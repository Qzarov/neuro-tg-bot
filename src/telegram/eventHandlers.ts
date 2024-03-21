import { error } from "console";
import TelegramBot, { InlineKeyboardMarkup, Message } from "node-telegram-bot-api";

import { handleCommandStart, getUnknownCommand } from "./commandsHandler";


export async function messageReceived(message: Message) {
    console.log(`Got new message:`, message)

    const from: TelegramBot.User = message.from as TelegramBot.User
    const userId: number = from.id
    const text: string | undefined = message.text;

    if (typeof text !== "string") {
        throw error(`⛔️  Error! Type of message's text is ${typeof text}`)
    }

    try {
        if (text === "/start") {
            await handleCommandStart(from)
        } else {
            await getUnknownCommand(from)
        }
    } catch (err) {
        console.log(`⛔️  Error while handling message: ${err}`)
    }

    //textMessagesHanler.handleMessage(userId, text)
}