import TelegramBot, { InlineKeyboardMarkup, Message } from "node-telegram-bot-api";

import { tgBot } from "./tgBot";


export async function handleCommandStart(from: TelegramBot.User) {
    let replyText: string = "Welcome to the Crypto Tarot!"
    
    // const keyboard: InlineKeyboardMarkup = {
    //     inline_keyboard: [
    //         [
    //             buttons.createScanner,
    //             buttons.myScanners
    //         ],
    //     ]
    // }

    await tgBot.sendMessage(Number(from.id), replyText)
}

export async function getUnknownCommand(from: TelegramBot.User) {
    let replyText: string = "Sorry, I don't understand 😅"
    await tgBot.sendMessage(Number(from.id), replyText)
}