"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BashPrompt = void 0;
const environment = () => {
    // get os name
    const os = require('os');
    const osName = os.type();
    // get os version
    const osVersion = os.release();
    // list all files in current directory
    const fs = require('fs');
    const files = fs.readdirSync('./');
    // get current directory
    const currentDir = process.cwd();
    // get current user
    const currentUser = process.env.USER;
    // get current user home directory
    const homeDir = process.env.HOME;
    // get current user shell
    const shell = process.env.SHELL;
    // get current user terminal
    const terminal = process.env.TERM;
    // get current user editor
    const editor = process.env.EDITOR;
    // get current user language
    const language = process.env.LANG;
    // get current time zone
    const timeZone = process.env.TZ;
    const distributor = "Ubuntu";
    const distributionVersion = "22.04";
    const env = {
        osName,
        osVersion,
        files,
        currentDir,
        currentUser,
        homeDir,
        shell,
        terminal,
        editor,
        language,
        timeZone,
        distributor,
        distributionVersion,
    };
    return Object.entries(env).map(([key, value]) => {
        return `- ${key}: ${value}`;
    }).join("\n");
};
class BashPrompt {
    constructor(question, options) {
        this.question = question;
        this.environment = [
            '- os: Linux',
        ].join("\n");
        this.answeringQuestions = [
            '- write one bash command for your answer',
            '- answer must be one line',
            '- don\'t use "Answer:", only answer with the commands',
            '- use "&&" to connect commands (ex: "git add . && git commit -m \'message\'")',
            '- if you can answer, write "$ <your answer>"',
            '- if you can\'t answer, write "!! <your answer>"',
            '- if you don\'t know, write "?? <your answer>"',
        ].join("\n");
        if (options === null || options === void 0 ? void 0 : options.environment) {
            this.environment = options.environment;
        }
        else {
            this.environment = environment();
        }
        if (options === null || options === void 0 ? void 0 : options.answeringQuestions) {
            this.answeringQuestions = options.answeringQuestions;
        }
    }
    getPrompt() {
        return [
            "Your environment:",
            this.environment,
            "",
            "Instructions for answering questions:",
            this.answeringQuestions,
            "",
            "Question:",
            `Give a command for: ${this.question}.`,
        ].join("\n");
    }
    // magic method for get prompt
    toString() {
        return this.getPrompt();
    }
}
exports.BashPrompt = BashPrompt;
//# sourceMappingURL=bash-prompt.js.map