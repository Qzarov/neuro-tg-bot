import TelegramBot, { InlineKeyboardMarkup, Message } from "node-telegram-bot-api";

import TgBot from "./lib/telegram/tgBot";
import EventsHandler from "./handlers/events";
import config from "./config"
import { connectToMongo } from "./services/mongo.service";

(async () => {
    await connectToMongo();
})();

const tgBot = new TgBot(config.BOT_TOKEN)
const eventsHandler = new EventsHandler(tgBot)
console.log(`Neuro bot start polling`)

tgBot.bot.on("message", async (message: Message) => {
    try{
        await eventsHandler.messageReceived(message)
    } catch (e) {
        console.log(`⛔️  Error while processing message:`, (e as Error).message);
    }
});

tgBot.bot.on("callback_query", async (callbackQuery) => {
    await eventsHandler.callbackReceived(callbackQuery)
});

console.log(`Crypto Tarot bot starts polling!`)