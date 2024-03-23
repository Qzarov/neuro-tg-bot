import config from "../config";
import GPT, { GptResponse } from "../lib/gpt";


export enum AvailableNeuros {
    GPT,
    GEMINI // unsupported now
}


export default class NeuroManager {
    constructor() {}

    public async request(neuro: AvailableNeuros, request: string) {
        let result: string = ""

        switch(neuro) {
            case AvailableNeuros.GPT:
                const gpt = new GPT(config.GPT_API_SECRET)
                const response: GptResponse = await gpt.request(request)
                result =  this.messageFromGptResponse(response)
                break;

            case AvailableNeuros.GEMINI:
                result = `⚠️ Таролог Gemini пока не предотавляет своих услуг ⚠️`
                break;

        }

        return result
    }

    private messageFromGptResponse(response: GptResponse): string {
        console.log(`Forming message from GPT response:`, response)
        const choice0 = response.choices[0]

        const res = "🔮 Результат расклада:\n" + choice0.message.content

        return res
    }

}