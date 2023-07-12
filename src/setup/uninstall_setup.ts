import { Logger } from '../logger.js';
import * as path from 'path';
import { PackageConfiguration } from '../utils.js';

const logger = new Logger(path.basename(import.meta.url));

export async function run()
{
    logger.log("Cleaning up...");

    PackageConfiguration.remove_user_config();
    PackageConfiguration.remove_binary();

    logger.log("Uninstalled!");

    return;
}



