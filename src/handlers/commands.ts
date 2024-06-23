import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from "node-telegram-bot-api";
import { replyKeyboardButtons } from "../lib/telegram/const/buttons";
import TgBot from "../lib/telegram/tgBot";
import User, { UserRole, UserState } from "../models/user";
import { collections, UserService } from "../services/index";
import { CallbackData } from "./events";


export const Commands = {
    start: "/start",
    user: "/user",
    admin: "/admin",
    requestAccess: "/requestAccess",
    grantAccess: "/grantAccess",
    revokeAccess: "/revokeAccess",
    makeAdmin: "/makeAdmin",
    removeAdmin: "/removeAdmin",
    state: "/state",
    exitAdminMode: "/exitAdmin",
    chooseNeuro: "Выбрать таролога",
    useGPT: "Расклад от GPT",
    useGemini: "Расклад от Gemini",
    endUsingNeuro: "Закончить расклад",
}


export default class CommandsHandler {
    constructor(private bot: TgBot) {}

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
            const userService = new UserService(collections.users);
            const adminsData = await userService.findAll({role: UserRole.admin});
            
            const username = from.getData().username;
            const userId = from.getData().tgId;
            const messageForAdmin = `Пользователь @${username} запросил доступ`;
            const keyboard: InlineKeyboardMarkup = {
                inline_keyboard: [
                    [
                        {text: 'Одобрить', callback_data: `${CallbackData.approveAccess}:${userId}`},
                        {text: 'Отклонить', callback_data: `${CallbackData.cancelAccess}:${userId}`},
                    ]
                ]
            }
            for (const adminData of adminsData) {
                const admin: User = new User(adminData);
                await this.bot.sendMessage(admin.getTgId(), messageForAdmin, keyboard)
            }

            replyText = "Запрос на доступ успешно отправлен"
            await this.bot.sendMessage(Number(from.getTgId()), replyText)
        } else {
            throw new Error(`⛔️  Cannot creater new user: Users collection is undefined`);
        }
        
        await this.bot.sendMessage(Number(from.id), replyText)
    }

    public async handleMakeAdmin(from: TelegramBot.User, makeAdminUsername?: string) {
        let replyText: string = ""
        
        if (typeof makeAdminUsername === 'undefined') {
            replyText = "Повторите команду с указанием юзернейма пользователя через пробел без символа '@'."
        } else {
            
        }
        
        await this.bot.sendMessage(Number(from.id), replyText)
    }

    public async handleExitAdminMode(from: TelegramBot.User) {
        const user: User = new User({ tgId: from.id });
        let replyText = `Текущий статус: ${UserState[await user.getState()]}`

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