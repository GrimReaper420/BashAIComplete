import { Logger } from "./logger";
import { BashPrompt } from "./bash-prompt";
import OpenAiService from "./openai.service";
import { ChildProcess } from "./child-process";
import { CompletionException } from "./completion-exception";


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
        
        try {  
            const completion = await this.openAiService.createCompletion(fullPrompt);
            const result = completion.data.choices[0].text;
            const command: string = result.trim();

            // if command has ?? or !!, throw error
            if (command.includes("??") || command.includes("!!")) {
                // this.logger.error(`Error: ${command}`);
                throw new CompletionException(command);
            }

            return command;
        } catch (error: any) {
            if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
            } else {
            console.log(error.message);
            }
        }

        return "";
    }


    // confirm command 
    public async confirmCommand(command: string): Promise<boolean> {
        const question = `Run the command? [y/n] `;
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise(resolve => readline.question(question, (ans: any) => {
            // if answer is yes or empty, answer is yes
            const answer = ans === "y" || ans === "yes" ? true : false;
            readline.close();
            resolve(answer);
        }));
    }

    // run command
    public async runCommand(command: string): Promise<void> {
        this.logger.log(`run command: ${command}\n`);

        // remove $ sign from command
        command = command.replace("$", "");

        // run command
        this.childProcess.run(command);
    }
}

