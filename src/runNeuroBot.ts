import TelegramBot, { InlineKeyboardMarkup, Message } from "node-telegram-bot-api";

import TgBot from "./lib/telegram/tgBot";
import EventsHandler from "./handlers/events";
import config from "./config"
import { connectToMongo } from "./services/mongo.service";


connectToMongo()

const tgBot = new TgBot(config.BOT_TOKEN)
const eventsHandler = new EventsHandler(tgBot)
console.log(`Neuro bot start polling`)

tgBot.bot.on("message", async (message: Message) => {
    await eventsHandler.messageReceived(message)
});

tgBot.bot.on("callback_query", async (callbackQuery) => {
    await eventsHandler.callbackReceived(callbackQuery)
});