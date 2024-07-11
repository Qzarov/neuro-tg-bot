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
        let commandAndParams: string[] = [];
        let commandWithoutParams: string | undefined;
        let params: string | undefined;
        
        if ([
            String(Commands.chooseNeuro), 
            String(Commands.useGPT), 
            String(Commands.useGemini),
            String(Commands.endUsingNeuro)
        ].includes(command)) {
            commandWithoutParams = command
        } else {
            commandAndParams = command.split(' ');
            commandWithoutParams = commandAndParams.shift();
            params = commandAndParams.join(' ');
        }

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
                await this.handleCommandWithUsernameSearch(
                    Commands.grantAccess,
                    from, 
                    params,
                    `Теперь пользователь @username имеет доступ к боту`,
                    `Вам выдали доступ к боту`
                )
                break;

            case Commands.revokeAccess:
                await this.handleCommandWithUsernameSearch(
                    Commands.revokeAccess, 
                    from, 
                    params,
                    `Теперь пользователь @username не имеет доступ к боту`,
                    `У вас отозвали доступ к боту`
                )
                break;

            case Commands.makeAdmin:
                await this.handleCommandWithUsernameSearch(
                    Commands.makeAdmin,
                    from, 
                    params,
                    `Теперь пользователь @username администратор`,
                    `Вам была выдана роль админстратора`
                )
                break;

            case Commands.removeAdmin:                    
                await this.handleCommandWithUsernameSearch(
                    Commands.removeAdmin,
                    from, 
                    params,
                    `Пользователь @username больше не администратор`,
                    `Права администратора были отозваны`
                )
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
                "- /grantAccess username - выдать пользователю @username доступ к боту\n" +
                "- /revokeAccess username - отозвать у пользователя @username доступ к боту\n" +
                "- /makeAdmin username - сделать пользователя @username администратором\n" + 
                "- /revokeAdmin username - отозвать у пользователя @username права администратора";
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

    /**
     * Processes commands that require the user name of another user to be specified:
     *  - /grantAccess
     *  - /revokeAccess
     *  - /makeAdmin
     *  - /removeAdmin
     */
    private async handleCommandWithUsernameSearch(
        command: Commands, 
        from: User, 
        username?: string,
        successFromAnswer?: string,
        successToAnswer?: string,
    ) {
        /**
         * Check if command is handable by this function
         */
        if (![
            Commands.grantAccess, 
            Commands.revokeAccess, 
            Commands.makeAdmin, 
            Commands.removeAdmin
        ].includes(command)) {
            throw(`CommandsHandler.handleCommandWithUsernameSearch() cannot handle command ${command}`)
        }
        
        let replyText: string = "Есть ощущение, что что-то пошло не по плану";

        /**
         * Check if username is correct
         */
        if (typeof username === 'undefined' || username.length === 0) {
            replyText = "Повторите команду с указанием юзернейма пользователя через пробел без символа '@'."
            await this.bot.sendMessage(Number(from.getTgId()), replyText);
            return;
        }

        const userService = new UserService()
        const usersData = await userService.findByUsername(username);

        /**
         * Check if user for given data is unique
         */
        if (usersData.length === 0) {
            replyText = `Пользователь @${username} не найден в базе. Для того, чтобы пользователю можно было выдать доступ, он должен отправить боту команду /start`
            await this.bot.sendMessage(Number(from.getTgId()), replyText);
            return;

        } else if (usersData.length > 1) {
            const usernames = usersData.map(user => user.username)
            replyText = `По данному юзернейму найдено несколько пользователей: ${usernames.join(', ')}. Выберите пользователя, которому нужно дать доступ и повторите команду с его юзернеймом`;
            await this.bot.sendMessage(Number(from.getTgId()), replyText);
            return;
        }

        const userTo = new User(usersData[0]);
        const userToData = userTo.getData();

        /**
         * Check rights for using command
         */ 
        const access: HasAccessResult = RolesHandler.hasAccess(
            from, command, { userTo: userTo}
        )
        if (!access.result) {
            replyText = access.message
        } else {
            let userToNewRole;
            switch(command) {
                case Commands.revokeAccess:
                    userToNewRole = UserRole.guest;
                    break;

                case Commands.grantAccess:
                    userToNewRole = UserRole.user;
                    break;
                
                case Commands.makeAdmin:
                    userToNewRole = UserRole.admin;
                    break;

                case Commands.removeAdmin:
                    userToNewRole = UserRole.user;
                    break;

                default:
                    userToNewRole = UserRole.guest;
            }

            const roleChanges: boolean = userToData.role !== userToNewRole
            if (roleChanges) {
                userTo.update({ role: userToNewRole });
                if (successFromAnswer) {
                    replyText = successFromAnswer.replace('username', userToData.username ?? '');
                }
                if (successToAnswer) {
                    const replyToUser = successToAnswer;
                    await this.bot.sendMessage(userToData.tgId, replyToUser)
                }
            } else {
                replyText = `Пользователь уже имеет роль ${userToData.role}.`
            }

        }

        await this.bot.sendMessage(Number(from.getTgId()), replyText)
    }
}