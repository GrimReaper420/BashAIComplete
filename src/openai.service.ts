import { Configuration, OpenAIApi } from "openai";
import { Logger } from './logger.js';

const utils = require('./utils.js');


export default class OpenAiService {
    private openai: OpenAIApi;

    private model: string = "gpt-3.5-turbo";
    private logger = new Logger(__filename);

    constructor() {

        const OPENAI_API_KEY = utils.getAPIKey();

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
            max_tokens: 128,
            n: 1,
            temperature: 1,
        });
    }

    // createChatCompletion
    public async createChatCompletion(prompt: string): Promise<any> {
        return await this.openai.createChatCompletion({
            model: this.model,
            messages: [{"role": "user", "content":prompt}],
            max_tokens: 128,
            n: 1,
            temperature: 0.8,
        });
    }
}