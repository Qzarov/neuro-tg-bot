import { Message } from "node-telegram-bot-api";

import TgBot from "./infrastructure/telegram/tgBot";
import EventsHandler from "./infrastructure/telegram/events";
import config from "./shared/config"
import { connectToMongo } from "./shared/infrastructure/mongo.service";

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