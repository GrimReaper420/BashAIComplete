import { Logger } from './logger.js';

const path = require('path');
const fs = require('fs-extra');
const readline = require('readline/promises');

const logger = new Logger(path.basename(__filename));



export function handle_fatal_error(err: any): void
{
  logger.error(err);
  process.exit(5);
}

export function getAPIKey(): string
{
    const package_config_data = require('./config/package_config.json');
    const user_config_data = require(package_config_data.user_config_json_path);

    return user_config_data.openaikey;
}

export async function setAPIKey(): Promise<void>
{
    const package_config_data = require('./config/package_config.json');
    const user_config_data = require(package_config_data.user_config_json_path);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const api_key = rl.question("Set your OpenAI API Key: ")
        .then((answer: string) => {
            if(!answer.trim()) {
                logger.error('API key is missing. Quitting...');
                process.exit(5);
            }
            
            user_config_data.openaikey = answer.trim();

            const fs = require('fs-extra');

            return fs.writeFile(package_config_data.user_config_json_path, JSON.stringify(user_config_data, null, 4) + '\n')
                .then(() => logger.log('API key saved.'), handle_fatal_error);
        });

    await api_key;

    return;
}