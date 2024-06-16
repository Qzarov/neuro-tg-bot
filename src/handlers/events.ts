import { error } from "console";
import TelegramBot, { User as TgUser, Message, CallbackQuery, InlineKeyboardMarkup } from "node-telegram-bot-api";

import CommandsHandler, { Commands } from "./commands";
import TgBot from "../lib/telegram/tgBot";
import NeuroManager, { AvailableNeuros } from "./neuro";
import { replyKeyboardButtons } from "../lib/telegram/const/buttons";
import User, { UserState } from "../models/user";
import TextHandler from "../lib/text/text";
import { Langs } from '../lib/text/types/lang';


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
    
        const user: User = new User(userId, from.username, from.first_name, from.last_name)
        if (!(await user.isInDatabase())) {
            await user.save()
        } 

        if (typeof text !== "string") {
            throw error(`⛔️  Error! Type of message's text is ${typeof text}:`, text)
        }

        if (! await user.hasAccessToBot()) {
            this.bot.sendMessage(from.id, `Привет, человек! Прости, но сейчас наши тарологи не могут разложить карты для тебя. Попробуй запросить доступ у администратора @the_crypto_dev`)
            return
        }

        if (await user.isUsingNeuro()) {
            if (text === Commands.endUsingNeuro) {
                await this.commandsHandler.handleEndUsingNeuro(userId)
                return
            }
            const state = await user.getState()

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
                await this.commandsHandler.handleEndUsingNeuro(userId)
            } else {
                const postScriptum = `Надеюсь, что карты ответили на твой вопрос. Ты можешь отправить следующий или завершить расклад, нажав на кнопку "${replyKeyboardButtons.endUsingNeuro.text}"`
                this.bot.sendMessage(from.id, postScriptum)
            }
            return
        }
    
        try {
            await this.commandsHandler.handleCommand(from, text)
        } catch (err) {
            console.log(`⛔️  Error while handling message: ${err}`)
        }
    
        //textMessagesHanler.handleMessage(userId, text)
    }

    async callbackReceived(callbackData: CallbackQuery) {

        let msg: Message | undefined = typeof callbackData.message !== 'undefined' ? callbackData.message : undefined
        
        if (typeof msg === 'undefined') {
            console.log(`⛔️  Message is undefined in callback_query`)
            // TODO handle error
            return
        }

        // TODO delegate to callbackHandler
        if (callbackData.data === "translate") {
            if (msg.text) {
                const text: TextHandler = new TextHandler(msg.text);
                this.bot.sendMessage(callbackData.from.id, (await text.translate(Langs.ru)).text)
            }

        }
    }
}