import TelegramBot, { InlineKeyboardMarkup } from "node-telegram-bot-api";
import config from "../config.js";


class TgBot {
    public bot: TelegramBot 
    constructor(bot_token: string) {
        const token: string = bot_token;
        this.bot = new TelegramBot(token, { polling: true });
    }

    async sendMessage(userId: number, replyText: string, keyboard?: InlineKeyboardMarkup) {
        this.bot.sendMessage(
            userId, 
            replyText,
            {
                parse_mode: `Markdown`,
                reply_markup: keyboard,
            }
        )
    }
}

export const tgBot = new TgBot(config.BOT_TOKEN)