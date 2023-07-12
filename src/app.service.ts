import { Logger } from "./logger.js";
import { BashPrompt } from "./bash-prompt.js";
import OpenAiService from "./openai.service.js";
import { ChildProcess } from "./child-process.js";
import { CompletionException } from "./completion-exception.js";
import { UserConfiguration, handle_fatal_error } from "./utils.js";
import * as readline from 'node:readline/promises';

export class AppService {
    private logger: Logger = new Logger(AppService.name);
    private openAiService: OpenAiService;
    private childProcess: ChildProcess;

    constructor() {
        this.openAiService = new OpenAiService();
        this.childProcess = new ChildProcess();
    }

    public async findCommand(_prompt: string): Promise<string> {
        const prompt = new BashPrompt(_prompt);
        const fullPrompt = prompt.toString();

        this.logger.log("Full prompt:\n" + fullPrompt);
        
        try {  
            const completion = await this.openAiService.createChatCompletion(fullPrompt);

            const result = completion.data.choices[0].message.content;
            const command: string = result.trim();

            // if command has ?? or !!, throw error
            if (command.startsWith('??'))
            {
                this.logger.msg("GPT does not know how to answer the question! Response: " + command);
                process.exit(5);
            }
            else if (command.startsWith('!!'))
            {
                this.logger.msg("GPT cannot answer the question! Response: " + command);
                process.exit(5);
            }

            return command;
        } catch (error: any) {
            if (error.response) {
                this.logger.error('An error occured while processig the command!');
                this.logger.error('Response status: ' + error.response.status);
                this.logger.error('Error message: ' + error.response.data.error.message);
                // this.logger.error(JSON.stringify(error.response.data, null, 4));

                if(error.response.data.error.code == 'invalid_api_key')
                   UserConfiguration.set_api_key();

                process.exit(5);
            } else {
                this.logger.error(error.message);
            }

            return "";
        }

        
    }


    // confirm command 
    public async confirmCommand(command: string): Promise<boolean | void> {
        const question = `Run the command? [y/n] `;
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return rl.question(question)
            .then((ans: any) => {
                rl.close();
                return ans === "y" || ans === "yes" ? true : false;
            })
            .catch((error: any) => handle_fatal_error(error));
    }

    // run command
    public async runCommand(command: string): Promise<void> {
        this.logger.log(`run command: ${command}\n`);

        // remove $ sign from command
        command = command.replace("$ ", "");

        // run command
        return this.childProcess.run(command);
    }
}

