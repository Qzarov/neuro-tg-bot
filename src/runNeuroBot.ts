import TelegramBot, { InlineKeyboardMarkup, Message } from "node-telegram-bot-api";
// import { OpenAIApi, Configuration } from "openai";

import { tgBot } from "./telegram/tgBot";
import { messageReceived } from "./telegram/eventHandlers";


console.log(`Neuro bot start polling`)

tgBot.bot.on("message", async (message: Message) => {
    await messageReceived(message)
});