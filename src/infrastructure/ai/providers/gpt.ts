import OpenAI from "openai";
import { ChatCompletion } from "openai/resources";

export type GptResponse = {
    choices: ChatCompletion.Choice[]
    tokens_used?: number;
  }

export default class GPT {
    private openai: OpenAI
    
    constructor(
        api_secret: string,
        private model: string = 'gpt-3.5-turbo'
    ) {
        this.openai = new OpenAI({
            apiKey: api_secret,
        })
    }

    public async request(request: string): Promise<GptResponse> {
        const params: OpenAI.Chat.ChatCompletionCreateParams = {
            messages: [{ role: 'user', content: request }],
            model: this.model,
        };
        const chatCompletion: OpenAI.Chat.ChatCompletion = await this.openai.chat.completions.create(params);

        return {
            choices: chatCompletion.choices,
            tokens_used: chatCompletion.usage?.total_tokens
        }
    }
}