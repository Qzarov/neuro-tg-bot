import { error } from "console";
import TelegramBot, { User as TgUser, Message, CallbackQuery, InlineKeyboardMarkup } from "node-telegram-bot-api";

import CommandsHandler, { Commands } from "./commands";
import TgBot from "../lib/telegram/tgBot";
import NeuroManager, { AvailableNeuros } from "./neuro";
import { replyKeyboardButtons } from "../lib/telegram/const/buttons";
import User, { UserRole, UserState } from "../models/user";
import TextHandler from "../lib/text/text";
import { Langs } from '../lib/text/types/lang';


export enum CallbackData {
    translate = "translate", 
    approveAccess = "approveAccess",
    cancelAccess = "cancelAccess",
};

export default class EventsHandler {
    private commandsHandler: CommandsHandler
    private neuroManager: NeuroManager

    constructor(private bot: TgBot) {
        this.commandsHandler = new CommandsHandler(bot)
        this.neuroManager = new NeuroManager()
    }

    async messageReceived(message: Message) {
        console.log(`Got new message from @${message.from?.username}:`, message.text)
    
        const from: TelegramBot.User = message.from as TelegramBot.User
        const userId: number = from.id
        const text: string | undefined = message.text;
    
        const user: User = new User({
            tgId: userId, 
            username: from.username, 
            firstName: from.first_name, 
            lastName: from.last_name,
        });

        await user.isInDatabase(); 

        if (typeof text !== "string") {
            throw error(`⛔️  Error! Type of message's text is ${typeof text}:`, text)
        }

        if (text === Commands.requestAccess) {
            await this.commandsHandler.handleCommand(user, text);
            return;
        } else if (!user.hasAccessToBot()) {
            this.bot.sendMessage(from.id, `Привет, человек! Прости, но сейчас наши тарологи не могут разложить карты для тебя. Чтобы запросить доступ, отправь команду /requestAccess`)
            return
        }

        if (user.isUsingNeuro()) {
            if (text === Commands.endUsingNeuro) {
                await this.commandsHandler.handleEndUsingNeuro(user);
                return
            }
            const state = user.getState()

            let response: string = ""
            let errorOccured: boolean = false
            switch(state) {
                case UserState.usingGPT:
                    try {
                        response = await this.neuroManager.request(AvailableNeuros.GPT, text)
                    } catch (e) {
                        console.log(`⛔️  Error while requesting GPT:`, (e as Error).message);
                        response = `Небесный фаервол закрыл звезды, тарологу не удалось получить ответ 😔`
                        errorOccured = true
                    }
                    break;
                // case UserState.usingGemini:
                //     response = await this.neuroManager.request(AvailableNeuros.GEMINI, text)
                //     break;
            }

            const keyboard: InlineKeyboardMarkup = {
                inline_keyboard: [
                    [
                        {text: 'Перевести', callback_data: `translate`},
                    ]
                ]
            }

            this.bot.sendMessage(from.id, response, keyboard)
            
            if (errorOccured) {
                await this.commandsHandler.handleEndUsingNeuro(user)
            } else {
                const postScriptum = `Надеюсь, что карты ответили на твой вопрос. Ты можешь отправить следующий или завершить расклад, нажав на кнопку "${replyKeyboardButtons.endUsingNeuro.text}"`
                this.bot.sendMessage(from.id, postScriptum)
            }
            return
        }
    
        try {
            await this.commandsHandler.handleCommand(user, text)
        } catch (err) {
            console.log(`⛔️  Error while handling message: ${err}`)
        }
    
        //textMessagesHanler.handleMessage(userId, text)
    }

    async callbackReceived(callbackData: CallbackQuery) {

        let msg: Message | undefined = typeof callbackData.message !== 'undefined' ? callbackData.message : undefined
        

        const dataAndParams: string[] | undefined = callbackData.data?.split(':');
        const commandWithoutParams: string | undefined = dataAndParams?.shift();
        const params = dataAndParams?.join(':');

        console.log(`callback dataAndParams:`, dataAndParams);
        console.log(`callback commandWithoutParams:`, commandWithoutParams);
        console.log(`callback params:`, params);

        if (typeof msg === 'undefined') {
            console.log(`⛔️  Message is undefined in callback_query`)
            // TODO handle error
            return
        }

        // TODO deligate to callbackHandler
        if (commandWithoutParams === CallbackData.translate) {
            if (msg.text) {
                const text: TextHandler = new TextHandler(msg.text);
                this.bot.sendMessage(callbackData.from.id, (await text.translate(Langs.ru)).text)
            }
        }

        // TODO deligate to callbackHandler
        if (commandWithoutParams === CallbackData.approveAccess) {
            let replyToUser: string = `Доступ к боту успешно получен`
            let replyToAdmin: string = `Доступ выдан`

            // Check if params are correct
            if (params && isNaN(+params)) {
                console.log(`⛔️  Trying to approve access for user with ${params} as id`)
            }

            // Create a new user and fetch his data
            const user = new User({tgId: Number(params)})
            await user.isInDatabase();
            if (!user.hasAccessToBot()) { 
                console.log(`Updating role for user @${user.getData().username}`);
                await user.update({ role: UserRole.user })
            } else {
                replyToAdmin = `Пользователь уже имеет доступ`
            }

            // send messages to admin and user (status updated)
            this.bot.sendMessage(user.getTgId(), replyToUser)
            this.bot.sendMessage(callbackData.from.id, replyToAdmin)
        }
    }
}