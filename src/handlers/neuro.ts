import config from "../config";
import GPT, { GptResponse } from "../lib/gpt";
import TextHandler from "../lib/text/text";
import { Langs, Translation } from "../lib/text/types/lang";
import ApiToken, { ApiTokenType } from "../models/apiToken";
import { AvailableNeuros } from "./types";

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
                const provider = new ApiToken(ApiTokenType.GPT)
                const token = await provider.getLastUsed();
                console.log('last used token:', token)
                
                const gpt = new GPT(token, config.GPT_MODEL)
                const response: GptResponse = await gpt.request(request)
                result =  this.messageFromGptResponse(response)
                break;

            case AvailableNeuros.GEMINI:
                result = `⚠️ Таролог Gemini пока не предотавляет своих услуг ⚠️`
                break;

        }

        const res = new TextHandler(result)

        // return (await res.translate(Langs.ru)).text
        return res.sourceText()
    }

    private messageFromGptResponse(response: GptResponse): string {
        console.log(`Forming message from GPT response:`, response)
        const choice0 = response.choices[0]

        const res = "🔮 Результат расклада:\n" + choice0.message.content

        return res
    }

}