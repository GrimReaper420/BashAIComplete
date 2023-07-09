import { Logger } from './logger.js';
import * as path from 'path';
import * as fs from 'fs';
import * as fsx from 'fs-extra';
import * as readline from 'node:readline';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const prompt = require("prompt-sync")({ sigint: true });

const logger = new Logger(path.basename(import.meta.url));

export function handle_fatal_error(err: any): void
{
  logger.error(err);
  process.exit(5);
}

export function create_user_config_file()
{
    var user_config_dir_exists = false;
    var user_config_file_exists = false;

    const package_config_data = require('./config/package_config.json');
    const user_config_dir = path.dirname(package_config_data.user_config_json_path);

    try{
        fs.accessSync(user_config_dir);
        user_config_file_exists = true;
    } catch (e) {
        user_config_dir_exists = false;
    }

    if(!user_config_dir_exists)
    {
        try {
            fs.mkdirSync(user_config_dir, 0o700);
        } catch(e) {
            handle_fatal_error('Failed to create config folder in home directory! ' + e);   
        }
    }

    try{
        fs.accessSync(package_config_data.user_config_json_path);
        user_config_file_exists = true;
        return;
    } catch(e) {
        user_config_file_exists = false;
    }

    if(!user_config_file_exists)
    {
        const user_config_data = {
            openapikey: "",
        }

        try {
            fs.writeFileSync(package_config_data.user_config_json_path, JSON.stringify(user_config_data, null, 4), { mode: 0o700 });
        } catch(e) {
            handle_fatal_error('Failed to create config file in user config directory! ' + e);
        }
    }
}

export function getAPIKey(): string
{
    logger.log('Getting API key...');
    var openaikey = "";

    const package_config_data = require('./config/package_config.json');

    try{

        fs.accessSync(package_config_data.user_config_json_path);
    }
    catch(e)
    {
        logger.error('User config file not found.' + e);
        create_user_config_file();
        return "";
    }

    const user_config_data = require(package_config_data.user_config_json_path);

    openaikey = user_config_data.openaikey;

    return openaikey;
}

export function setAPIKeySync(): string
{
    logger.log('Setting API key...');
    const package_config_data = require('./config/package_config.json');
    logger.log(JSON.stringify(package_config_data, null, 4));
    logger.log(package_config_data.user_config_json_path);

    const user_config_data = require(package_config_data.user_config_json_path);

    // const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    // });

    const answer = prompt("Set your OpenAI API Key: ");

    if(!answer.trim()) {
        logger.error('API key is missing. Quitting...');
        process.exit(5);
    }
    
    user_config_data.openaikey = answer.trim();

    try {
        fs.writeFileSync(package_config_data.user_config_json_path, JSON.stringify(user_config_data, null, 4) + '\n');
        logger.log('API key saved.');
    } catch(e) {
        logger.error("Couldn't create file! " + e);
        throw e;
    }

    const api_key = answer;

    return answer;
}

export async function setAPIKey(): Promise<string>
{
    logger.log('Setting API key...');
    var api_key = "";

    const package_config_data = require('./config/package_config.json');
    logger.log(JSON.stringify(package_config_data, null, 4));
    logger.log(package_config_data.user_config_json_path);

    const user_config_data = require(package_config_data.user_config_json_path);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    await rl.question("Set your OpenAI API Key: ", (answer) => {
        if(!answer.trim()) {
            logger.error('API key is missing. Quitting...');
            process.exit(5);
        }
        
        user_config_data.openaikey = answer.trim();
        api_key = answer.trim();

        try {
            fs.writeFileSync(package_config_data.user_config_json_path, JSON.stringify(user_config_data, null, 4) + '\n');
            logger.log('API key saved.');
        } catch(e) {
            logger.error("Couldn't create file! " + e);
            throw e;
        }
    });

    rl.close();

    return api_key.trim();
}