import { Configuration, OpenAIApi } from "openai";
import { Logger } from './logger.js';
import * as path from 'path';
import { UserConfiguration  } from "./utils.js";

export default class OpenAiService {
    private openai: OpenAIApi | undefined;
    private openaikey: string | undefined;

    private model: string = "gpt-3.5-turbo";
    private logger = new Logger(path.basename(import.meta.url));

    constructor() {

        const OPENAI_API_KEY = UserConfiguration.get_config_data().openaikey;
        
        if(OPENAI_API_KEY)
            this.set_api_key(OPENAI_API_KEY);
        else {
            this.openai = undefined;
            this.openaikey = "";
        }
    }

    set_api_key(key: string)
    {
        const configuration = new Configuration({
            apiKey: key,
        });

        const openai = new OpenAIApi(configuration);

        this.openai = openai;
        this.openaikey = key;
    }

    // createCompletion
    public async createCompletion(prompt: string): Promise<any> {
        return await this.openai?.createCompletion({
            model: this.model,
            prompt: prompt,
            max_tokens: 128,
            n: 1,
            temperature: 1,
        });
    }

    // createChatCompletion
    public async createChatCompletion(prompt: string): Promise<any> {
        if(!this.openaikey)
        {
            const key = UserConfiguration.set_api_key();
            this.set_api_key(key);
        }

        return await this.openai?.createChatCompletion({
            model: this.model,
            messages: [{"role": "user", "content":prompt}],
            max_tokens: 128,
            n: 1,
            temperature: 0.8,
        });
    }
}