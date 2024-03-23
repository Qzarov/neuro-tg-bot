import { error } from "console";
import TelegramBot, { Message } from "node-telegram-bot-api";

import CommandsHandler, { Commands } from "./commands";
import usersState, { UserState } from "./usersState";
import TgBot from "../lib/telegram/tgBot";
import NeuroManager, { AvailableNeuros } from "./neuro";
import { replyButtons } from "../lib/telegram/const/buttons";


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
    
        if (typeof text !== "string") {
            throw error(`⛔️  Error! Type of message's text is ${typeof text}`)
        }
    
        if (usersState.isUsingNeuro(from.id)) {
            if (text === Commands.endUsingNeuro) {
                this.commandsHandler.handleEndUsingNeuro(userId)
                return
            }
            const state = usersState.getCurrentState(from.id)

            let response: string = ""
            switch(state) {
                case UserState.usingGPT:
                    response = await this.neuroManager.request(AvailableNeuros.GPT, text)
                    break;
                // case UserState.usingGemini:
                //     response = await this.neuroManager.request(AvailableNeuros.GEMINI, text)
                //     break;
            }

            this.bot.sendMessage(from.id, response)
            
            const postScriptum = `Надеюсь, что карты ответили на твой вопрос. Ты можешь отправить следующий или завершить расклад, нажав на кнопку "${replyButtons.endUsingNeuro.text}"`
            this.bot.sendMessage(from.id, postScriptum)
            return
        }
    
        
        try {
            await this.commandsHandler.handleCommand(from, text)
        } catch (err) {
            console.log(`⛔️  Error while handling message: ${err}`)
        }
    
        //textMessagesHanler.handleMessage(userId, text)
    }
}