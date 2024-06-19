import TelegramBot, { ReplyKeyboardMarkup } from "node-telegram-bot-api";

import { replyKeyboardButtons } from "../lib/telegram/const/buttons";
import TgBot from "../lib/telegram/tgBot";
import User, { UserState } from "../models/user";


export const Commands = {
    start: "/start",
    user: "/user",
    admin: "/admin",
    grantAccess: "/grantAccess",
    revokeAccess: "/revokeAccess",
    makeAdmin: "/makeAdmin",
    revokeAdmin: "/revokeAdmin",
    state: "/state",
    exitAdminMode: "/exitAdmin",
    chooseNeuro: "Выбрать таролога",
    useGPT: "Расклад от GPT",
    useGemini: "Расклад от Gemini",
    endUsingNeuro: "Закончить расклад",
}


export default class CommandsHandler {
    constructor(private bot: TgBot) {}

    public async handleCommand(from: TelegramBot.User, command: string) {
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
                await this.handleChooseNeuro(from.id)
                break;

            case Commands.useGPT:
                await this.handleSetUseGpt(from.id)
                break;

            case Commands.useGemini:
                await this.handleSetUseGemini(from.id)
                break;

            case Commands.endUsingNeuro:
                await this.handleEndUsingNeuro(from.id)
                break;

            default:
                await this.handleUnknownCommand(from)
        }
    }

    public async handleAdmin(from: TelegramBot.User) {
        let replyText: string = "Welcome to the Crypto Tarot!"
        const user: User = new User({ tgId: from.id });
        if (await user.hasAdminRights()) {
            user.updateState(UserState.adminMode);
            replyText = 
                "Теперь ты в режиме администратора. Доступные команды:\n" + 
                "/grantAccess username - выдать пользователю @username доступ к боту\n" +
                "/revokeAccess username - отозвать у пользователя @username доступ к боту\n" +
                "/makeAdmin username - сделать пользователя @username администратором" + 
                "/revokeAdmin username - отозвать у пользователя @username права администратора";
        } else {
            replyText =  "⛔️  Сорри, но ты не администратор"
        }
        await this.bot.sendMessage(Number(from.id), replyText)
    }

    public async handleGrantAccess(from: TelegramBot.User, grantToUsername?: string) {
        let replyText: string = ""
        
        if (typeof grantToUsername === 'undefined') {
            replyText = "Повторите команду с указанием юзернейма пользователя через пробел без символа '@'."
        } else {
            
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

        if (await user.getState() === UserState.adminMode) {
            await user.updateState(UserState.start);
            replyText = `Вы вышли из режима администратора. ` + replyText; 
        }
        await this.bot.sendMessage(Number(from.id), replyText)
    }

    public async handleState(from: TelegramBot.User) {
        const user: User = new User({ tgId: from.id });
        const state = await user.getState()
        const replyText = `Твой текущий статус: ${UserState[state]}`
        await this.bot.sendMessage(Number(from.id), replyText)
    }

    public async handleStart(from: TelegramBot.User) {
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
    
        await this.bot.sendMessage(Number(from.id), replyText, keyboard)
    }
    
    public async handleChooseNeuro(userId: number) {
        let replyText: string = "Хорошо. Выбери нейросеть, которая разложит карты"

        const keyboard: ReplyKeyboardMarkup = {
            keyboard: [
            [
                replyKeyboardButtons.useGPT,
                replyKeyboardButtons.useGemini,
            ]
        ]}

        await this.bot.sendMessage(Number(userId), replyText, keyboard)
    }

    public async handleSetUseGpt(userId: number) {
        const user: User = new User({ tgId: userId })
        user.updateState(UserState.usingGPT)

        const keyboard: ReplyKeyboardMarkup = {
            keyboard: [
            [
                replyKeyboardButtons.endUsingNeuro,
            ]
        ]}

        let replyText: string = "Прекрасный выбор! GPT разложит карты без обмана и смс. Отправь свой запрос и GPT на него ответит 🙌🏻"
        await this.bot.sendMessage(Number(userId), replyText, keyboard)
    }

    public async handleSetUseGemini(userId: number) {
        // usersState.updateUserState(userId, UserState.usingGemini)

        // const keyboard: ReplyKeyboardMarkup = {
        //     keyboard: [
        //     [
        //         replyKeyboardButtons.endUsingNeuro,
        //     ]
        // ]}

        let replyText: string = `⚠️ Таролог Gemini пока не предотавляет своих услуг ⚠️`
        await this.bot.sendMessage(Number(userId), replyText, /* keyboard */)
    }

    public async handleEndUsingNeuro(userId: number) {
        const user: User = new User({ tgId: userId})
        user.updateState(UserState.start)
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
        await this.bot.sendMessage(Number(userId), replyText, keyboard)
    }
    
    public async handleUnknownCommand(from: TelegramBot.User) {
        let replyText: string = "Прости, человек, но карты не могут на это ответить 😅"
        await this.bot.sendMessage(Number(from.id), replyText)
    }
}