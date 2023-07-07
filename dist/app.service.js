"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const logger_1 = require("./logger");
const bash_prompt_1 = require("./bash-prompt");
const openai_service_1 = __importDefault(require("./openai.service"));
const child_process_1 = require("./child-process");
const completion_exception_1 = require("./completion-exception");
class AppService {
    constructor() {
        this.logger = new logger_1.Logger(AppService.name);
        this.openAiService = new openai_service_1.default();
        this.childProcess = new child_process_1.ChildProcess();
    }
    findCommand(_prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = new bash_prompt_1.BashPrompt(_prompt);
            const fullPrompt = prompt.toString();
            console.log("Prompt: " + _prompt);
            try {
                const completion = yield this.openAiService.createCompletion(fullPrompt);
                const result = completion.data.choices[0].text;
                const command = result.trim();
                // if command has ?? or !!, throw error
                if (command.includes("??") || command.includes("!!")) {
                    // this.logger.error(`Error: ${command}`);
                    throw new completion_exception_1.CompletionException(command);
                }
                return command;
            }
            catch (error) {
                if (error.response) {
                    console.log(error.response.status);
                    console.log(error.response.data);
                }
                else {
                    console.log(error.message);
                }
            }
            return "";
        });
    }
    // confirm command 
    confirmCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            const question = `do your want to use command in your terminal ? [yes/no] `;
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });
            return new Promise(resolve => readline.question(question, (ans) => {
                // if answer is yes or empty, answer is yes
                const answer = ans === "yes" || ans === "" ? true : false;
                readline.close();
                resolve(answer);
            }));
        });
    }
    // run command
    runCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log(`run command: ${command}\n`);
            // remove $ sign from command
            command = command.replace("$", "");
            // run command
            this.childProcess.run(command);
        });
    }
}
exports.AppService = AppService;
//# sourceMappingURL=app.service.js.map