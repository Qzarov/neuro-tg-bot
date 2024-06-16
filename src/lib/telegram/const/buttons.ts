import { InlineKeyboardButton, KeyboardButton } from "node-telegram-bot-api"


export const replyKeyboardButtons: { [key: string]: KeyboardButton } = {
    chooseNeuralNetwork: {
        text: "Выбрать таролога"
    },
    useGPT: {
        text: "Расклад от GPT"
    },
    useGemini: {
        text: "Расклад от Gemini"
    },
    useGigaChat: {
        text: "Giga Chat"
    },
    useYaGPT: {
        text: "Yandex GPT"
    },
    endUsingNeuro: {
        text: "Закончить расклад"
    },
}

export const buttons: { [key: string]: InlineKeyboardButton } = {}