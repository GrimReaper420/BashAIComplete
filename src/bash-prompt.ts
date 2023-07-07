import { readFile } from 'fs'

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

    var distribution = "Ubuntu";
    var distributionVersion = "22.04";

    readFile('/etc/os-release', 'utf8', (err, data) => {
        if (err) throw err
        const lines: string[] = data.split('\n');

        const releaseDetails: any = {}
        lines.forEach((line, index) => {
            if(line == '')
                return;
            // Split the line into an array of words delimited by '='
            const words: string[] = line.split('=');
            releaseDetails[words[0].trim().toLowerCase()] = words[1].trim();
        })

        distribution = releaseDetails.id;
        distribution = releaseDetails.version_id;
      });

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
        distribution,
	    distributionVersion,
    }

    return Object.entries(env).map(([key, value]) => {
        return `- ${key}: ${value}`;
    }).join("\n");
}

export class BashPrompt {
    private environment: string = [
        '- os: Linux',
    ].join("\n");

    private answeringQuestions: string = [
        '- write one bash command for your answer',
        '- answer must be one line',
        '- don\'t use "Answer:", only answer with the commands',
        '- use "&&" to connect commands (ex: "git add . && git commit -m \'message\'")',
        '- if you can answer, write "$ <your answer>"',
        '- if you can\'t answer, write "!! <your answer>"',
        '- if you don\'t know, write "?? <your answer>"',
    ].join("\n");

    constructor(
        private question: string,
        options?: {
            environment?: string;
            answeringQuestions?: string;
        }
    ) {
        if (options?.environment) {
            this.environment = options.environment;
        } else {
            this.environment = environment();
        }

        if (options?.answeringQuestions) {
            this.answeringQuestions = options.answeringQuestions;
        }
    }

    public getPrompt(): string {
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
    public toString(): string {
        return this.getPrompt();
    }
}

