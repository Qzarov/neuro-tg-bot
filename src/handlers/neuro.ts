import config from "../config";
import GPT, { GptResponse } from "../lib/gpt";
import TextHandler from "../lib/text/text";
import { Langs, Translation } from "../lib/text/types/lang";


export enum AvailableNeuros {
    GPT,
    GEMINI // unsupported now
}


export default class NeuroManager {
    constructor() {}

    public async request(neuro: AvailableNeuros, request: string): Promise<string> {
        
        const req = new TextHandler(request)
        const detected: Translation = await req.detectedLang()

        if (detected.lang !== Langs.en) {
            request = (await req.translate(Langs.en)).text
        }

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

        const res = new TextHandler(result)

        return (await res.translate(Langs.ru)).text
    }

    private messageFromGptResponse(response: GptResponse): string {
        console.log(`Forming message from GPT response:`, response)
        const choice0 = response.choices[0]

        const res = "🔮 Результат расклада:\n" + choice0.message.content

        return res
    }

}