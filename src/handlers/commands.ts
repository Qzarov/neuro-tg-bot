import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from "node-telegram-bot-api";
import { replyKeyboardButtons } from "../lib/telegram/const/buttons";
import TgBot from "../lib/telegram/tgBot";
import User, { UserRole, UserState } from "../models/user";
import { collections, UserService } from "../services/index";
import { CallbackData, Commands, HasAccessResult } from "./types";
import RolesHandler from "./roles.handler";

export default class CommandsHandler {
    constructor(private bot: TgBot) {} // TODO add UserService as injection

    public async handleCommand(from: User, command: string) {
        const commandAndParams: string[] = command.split(' ');
        const commandWithoutParams: string | undefined = commandAndParams.shift();
        const params = commandAndParams.join(' ');

        console.log(`commandAndParams:`, commandAndParams);
        console.log(`commandWithoutParams:`, commandWithoutParams);
        console.log(`params:`, params);

        switch(commandWithoutParams) {
            case Commands.start:
                await this.handleStart(from)
                break;

            case Commands.admin:
                await this.handleAdmin(from)
                break;

            case Commands.requestAccess:
                await this.handleRequestAccess(from)
                break;
                
            case Commands.grantAccess:
                await this.handleGrantAccess(from, params)
                break;

            case Commands.revokeAccess:
                await this.handleRevokeAccess(from, params)
                break;

            case Commands.removeAdmin:
                await this.handleRemoveAdmin(from, params)
                break;

            case Commands.makeAdmin:
                await this.handleMakeAdmin(from, params)
                break;

            case Commands.exitAdminMode:
                await this.handleExitAdminMode(from);
                break;

            case Commands.state:
                await this.handleState(from);
                break;

            case Commands.chooseNeuro:
                await this.handleChooseNeuro(from)
                break;

            case Commands.useGPT:
                await this.handleSetUseGpt(from)
                break;

            case Commands.useGemini:
                await this.handleSetUseGemini(from)
                break;

            case Commands.endUsingNeuro:
                await this.handleEndUsingNeuro(from)
                break;

            default:
                await this.handleUnknownCommand(from)
        }
    }

    public async handleAdmin(from: User) {
        let replyText: string = "Welcome to the Crypto Tarot!"
        if (from.hasAdminRights()) {
            from.update({ state: UserState.adminMode});
            replyText = 
                "Теперь ты в режиме администратора. Доступные команды:\n" + 
                "/grantAccess username - выдать пользователю @username доступ к боту\n" +
                "/revokeAccess username - отозвать у пользователя @username доступ к боту\n" +
                "/makeAdmin username - сделать пользователя @username администратором" + 
                "/revokeAdmin username - отозвать у пользователя @username права администратора";
        } else {
            replyText =  "⛔️  Сорри, но ты не администратор"
        }
        await this.bot.sendMessage(Number(from.getTgId()), replyText)
    }

    public async handleRequestAccess(from: User) {
        let replyText: string = "Доступ уже есть"
        
        if (from.hasAccessToBot()) {
            await this.bot.sendMessage(Number(from.getTgId()), replyText)
            return;
        }

        // Get all admins from DB
        if (collections.users) {
            const userService = new UserService();
            const adminsData = await userService.findAll({role: UserRole.admin});
            
            const username = from.getData().username;
            const userId = from.getData().tgId;
            const messageForAdmin = `Пользователь @${username} запросил доступ`;
            const keyboard: InlineKeyboardMarkup = {
                inline_keyboard: [
                    [
                        {text: 'Одобрить', callback_data: `${CallbackData.approveAccess}:${userId}`},
                        {text: 'Отклонить', callback_data: `${CallbackData.rejectAccess}:${userId}`},
                    ]
                ]
            }
            for (const adminData of adminsData) {
                const admin: User = new User(adminData);
                await this.bot.sendMessage(admin.getTgId(), messageForAdmin, keyboard)
            }

            replyText = "Запрос доступа успешно отправлен"
            await this.bot.sendMessage(Number(from.getTgId()), replyText)
        } else {
            throw new Error(`⛔️  Cannot creater new user: Users collection is undefined`);
        }
    }

    public async handleGrantAccess(from: User, username?: string) {
        let replyToAdmin: string = "";

        if (typeof username === 'undefined' || username.length === 0) {
            replyToAdmin = "Повторите команду с указанием юзернейма пользователя через пробел без символа '@'."
            await this.bot.sendMessage(Number(from.getTgId()), replyToAdmin);
            return;
        }

        const userService = new UserService()
        const usersData = await userService.findByUsername(username);

        // TODO delegate this check
        if (usersData.length === 0) {
            replyToAdmin = `Пользователь @${username} не найден в базе. Для того, чтобы пользователю можно было выдать доступ, он должен отправить боту команду /start`
            await this.bot.sendMessage(Number(from.getTgId()), replyToAdmin);
            return;

        } else if (usersData.length > 1) {
            const usernames = usersData.map(user => user.username)
            replyToAdmin = `По данному юзернейму найдено несколько пользователей: ${usernames.join(', ')}. Выберите пользователя, которому нужно дать доступ и повторите команду с его юзернеймом`;
            await this.bot.sendMessage(Number(from.getTgId()), replyToAdmin);
            return;
        }

        const userTo = new User(usersData[0]);
        const userToData = userTo.getData();
        
        /**
         * Check rights for using command
         */ 
        const access: HasAccessResult = RolesHandler.hasAccess(
            from, 
            Commands.grantAccess,
            { userTo: userTo}
        )
        if (!access.result) {
            replyToAdmin = access.message
        } else {
            userTo.update({ role: UserRole.user });
            replyToAdmin = `Теперь пользователь @${userToData.username} имеет доступ к боту`;

            const replyToUser = `Вам выдали доступ к боту`;
            await this.bot.sendMessage(userToData.tgId, replyToUser)
        }

        await this.bot.sendMessage(Number(from.getTgId()), replyToAdmin)
    }

    public async handleRevokeAccess(from: User, username?: string) {
        let replyText: string = ""
        
        /**
         * Check rights for using command
         */ 
        const fromUserData = from.getData()
        if (!(
            fromUserData.role && 
            [UserRole.admin, UserRole.super].includes(fromUserData.role))
        ) {
            replyText = `Вы не имеете доступ к этой команде`
            await this.bot.sendMessage(Number(from.getTgId()), replyText)
            return
        }

        if (typeof username === 'undefined' || username.length === 0) {
            replyText = "Повторите команду с указанием юзернейма пользователя через пробел без символа '@'."
        } else {
            const userService = new UserService()
            const usersData = await userService.findAll({ username: username })

            if (usersData.length === 0) {
                replyText = `Пользователь @${username} не найден в базе. Для того, чтобы пользователю можно было выдать доступ, он должен отправить боту команду /start`

            } else if (usersData.length === 1) {
                const user = new User(usersData[0]);
                user.update({ role: UserRole.guest });
                replyText = `Теперь пользователь @${user.getData().username} не имеет доступ к боту`;
                const replyToUser = `У вас отозвали доступ к боту`;
                await this.bot.sendMessage(user.getData().tgId, replyToUser)
            
            } else if (usersData.length > 1) {
                const usernames = usersData.map(user => user.username)
                replyText = `По данному юзернейму найдено несколько пользователей: ${usernames.join(', ')}. Выберите пользователя, которому нужно дать доступ и повторите команду с его юзернеймом`;
            }
        }
        
        await this.bot.sendMessage(Number(from.getTgId()), replyText)
    }

    public async handleMakeAdmin(from: User, username?: string) {
        let replyText: string = ""
        
        /**
         * Check rights for using command
         */ 
        const fromUserData = from.getData()
        if (!(
            fromUserData.role && 
            [UserRole.super].includes(fromUserData.role))
        ) {
            replyText = `Вы не имеете доступ к этой команде`
            await this.bot.sendMessage(Number(from.getTgId()), replyText)
            return
        }

        if (typeof username === 'undefined' || username.length === 0) {
            replyText = "Повторите команду с указанием юзернейма пользователя через пробел без символа '@'."
        } else {
            const userService = new UserService()
            const usersData = await userService.findAll({ username: username })

            if (usersData.length === 0) {
                replyText = `Пользователь @${username} не найден в базе. Для того, чтобы пользователю можно было выдать доступ, он должен отправить боту команду /start`

            } else if (usersData.length === 1) {
                const user = new User(usersData[0]);
                user.update({ role: UserRole.admin });
                replyText = `Теперь пользователь @${user.getData().username} является администратором`;
                const replyToUser = `Вам была выдана роль админстратора`;
                await this.bot.sendMessage(user.getData().tgId, replyToUser)
            
            } else if (usersData.length > 1) {
                const usernames = usersData.map(user => user.username)
                replyText = `По данному юзернейму найдено несколько пользователей: ${usernames.join(', ')}. Выберите пользователя, которому нужно дать доступ и повторите команду с его юзернеймом`;
            }
        }
        
        await this.bot.sendMessage(Number(from.getTgId()), replyText)
    }

    public async handleRemoveAdmin(from: User, username?: string) {
        let replyText: string = ""
        
        /**
         * Check rights for using command
         */ 
        const fromUserData = from.getData()
        if (!(
            fromUserData.role && 
            [UserRole.super].includes(fromUserData.role))
        ) {
            replyText = `Вы не имеете доступ к этой команде`
            await this.bot.sendMessage(Number(from.getTgId()), replyText)
            return
        }

        if (typeof username === 'undefined' || username.length === 0) {
            replyText = "Повторите команду с указанием юзернейма пользователя через пробел без символа '@'."
        } else {
            // get user's data from db
            const userService = new UserService()
            const usersData = await userService.findAll({ username: username })

            if (usersData.length === 0) {
                replyText = `Пользователь @${username} не найден в базе. Для того, чтобы пользователю можно было выдать доступ, он должен отправить боту команду /start`

            } else if (usersData.length === 1) {
                const user = new User(usersData[0]);
                user.update({ role: UserRole.user });
                replyText = `Пользователь @${user.getData().username} больше не админстратор`;
                const replyToUser = `Права администратора были отозваны`;
                await this.bot.sendMessage(user.getData().tgId, replyToUser)
            
            } else if (usersData.length > 1) {
                const usernames = usersData.map(user => user.username)
                replyText = `По данному юзернейму найдено несколько пользователей: ${usernames.join(', ')}. Выберите пользователя, которому нужно дать доступ и повторите команду с его юзернеймом`;
            }
        }
        
        await this.bot.sendMessage(Number(from.getTgId()), replyText)
    }

    public async handleExitAdminMode(from: User) {
        let replyText = `Текущий статус: ${UserState[from.getState()]}`

        if (from.getState() === UserState.adminMode) {
            await from.update({ state: UserState.start });
            replyText = `Вы вышли из режима администратора. ` + replyText; 
        }
        await this.bot.sendMessage(Number(from.getTgId()), replyText)
    }

    public async handleState(from: User) {
        const state = from.getState()
        const replyText = `Твой текущий статус: ${UserState[state]}`
        await this.bot.sendMessage(Number(from.getTgId()), replyText)
    }

    public async handleStart(from: User) {
        let replyText: string = "Welcome to the Crypto Tarot!"
        
        const keyboard: ReplyKeyboardMarkup = {
            keyboard: [
                [
                    replyKeyboardButtons.chooseNeuralNetwork
                ],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        }
    
        await this.bot.sendMessage(Number(from.getTgId()), replyText, keyboard)
    }
    
    public async handleChooseNeuro(from: User) {
        let replyText: string = "Хорошо. Выбери нейросеть, которая разложит карты"

        const keyboard: ReplyKeyboardMarkup = {
            keyboard: [
            [
                replyKeyboardButtons.useGPT,
                replyKeyboardButtons.useGemini,
            ]
        ]}

        await this.bot.sendMessage(Number(from.getTgId()), replyText, keyboard)
    }

    public async handleSetUseGpt(from: User) {
        from.update({ state: UserState.usingGPT })

        const keyboard: ReplyKeyboardMarkup = {
            keyboard: [
            [
                replyKeyboardButtons.endUsingNeuro,
            ]
        ]}

        let replyText: string = "Прекрасный выбор! GPT разложит карты без обмана и смс. Отправь свой запрос и GPT на него ответит 🙌🏻"
        await this.bot.sendMessage(Number(from.getTgId()), replyText, keyboard)
    }

    public async handleSetUseGemini(from: User) {
        // usersState.updateUserState(userId, UserState.usingGemini)

        // const keyboard: ReplyKeyboardMarkup = {
        //     keyboard: [
        //     [
        //         replyKeyboardButtons.endUsingNeuro,
        //     ]
        // ]}

        let replyText: string = `⚠️ Таролог Gemini пока не предотавляет своих услуг ⚠️`
        await this.bot.sendMessage(Number(from.getTgId()), replyText, /* keyboard */)
    }

    public async handleEndUsingNeuro(from: User) {
        from.update({ state: UserState.start})
        let replyText: string = "Надеюсь, что это было полезно. Убираю карты 🃏🃏🃏"
        const keyboard: ReplyKeyboardMarkup = {
            keyboard: [
                [
                    replyKeyboardButtons.chooseNeuralNetwork
                ],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        }
        await this.bot.sendMessage(Number(from.getTgId()), replyText, keyboard)
    }
    
    public async handleUnknownCommand(from: User) {
        let replyText: string = "Прости, человек, но карты не могут на это ответить 😅"
        await this.bot.sendMessage(Number(from.getTgId()), replyText)
    }
}