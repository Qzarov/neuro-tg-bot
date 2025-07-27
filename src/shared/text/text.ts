import axios from 'axios'
import querystring from "node:querystring";
import { Langs, Translation } from './types';

export class TextHandler {
    private source: Translation
    private translations: Translation[]

    constructor(text: string, private textLang: Langs = Langs.auto) {
        this.translations = []
        this.source = {
            lang: textLang,
            confidence: undefined,
            text: text,
        }
    }

    sourceText(): string { return this.source.text }

    async detectedLang(): Promise<Translation> {
        if (this.source.lang === Langs.auto) {
            await this.translate(Langs.en)
        } 
        return this.source
    }

    async translate(targetLang: Langs): Promise<Translation> {
        for (let i = 0; i < this.translations.length; i++) {
            if (this.translations[i].lang === targetLang) {
                return this.translations[i]
            }
        }

        try {
            const encodedSource = querystring.escape(this.source.text);
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${this.textLang}&tl=${targetLang}&dt=t&q=${encodedSource}`;
        
            const response = await axios.get(url);
            const lang: string = response.data[2];
            this.source.confidence = response.data[6];
            this.source.lang = lang as Langs
            
            const translations = response.data[0];

            let translatedText = "";
            // biome-ignore lint/complexity/noForEach: <explanation>
            translations.forEach((translation: string[]) => {
              translatedText += translation[0];
            });
        
            const translation: Translation = {
                lang: targetLang,
                confidence: undefined,
                text: translatedText
            }
            this.translations.push(translation)
            return translation

          } catch (error) {
            console.error("Error translating text:", error);
            throw error;
          }
    }
}