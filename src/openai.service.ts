import { Configuration, OpenAIApi } from "openai";

export default class OpenAiService {
    private openai: OpenAIApi;

    private model: string = "gpt-3.5-turbo";

    constructor() {
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

        if (!OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not defined");
        }

        const configuration = new Configuration({
            apiKey: OPENAI_API_KEY,
        });

        const openai = new OpenAIApi(configuration);

        this.openai = openai;
    }

    // createCompletion
    public async createCompletion(prompt: string): Promise<any> {
        return await this.openai.createCompletion({
            model: this.model,
            prompt: prompt,
            max_tokens: 64,
            n: 1,
            echo: false,
            temperature: 1,
        });
    }
}