import TelegramBot, { InlineKeyboardMarkup, ReplyKeyboardMarkup } from "node-telegram-bot-api";

export default class TgBot {
    public bot: TelegramBot 
    constructor(bot_token: string) {
        const token: string = bot_token;
        this.bot = new TelegramBot(token, { polling: true });
    }

    async sendMessage(userId: number, replyText: string, keyboard?: InlineKeyboardMarkup | ReplyKeyboardMarkup) {
        this.bot.sendMessage(
            userId, 
            replyText,
            {
                //parse_mode: `Markdown`,
                reply_markup: keyboard,
            }
        )
    }
}
