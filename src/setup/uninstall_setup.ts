import { Logger } from '../logger.js';
import * as fsp from 'fs/promises';
import * as path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const logger = new Logger(path.basename(import.meta.url));

function handle_fatal_error(err: any)
{
  logger.error(err);
  process.exit(5);
}

export async function run()
{
    logger.log("Cleaning up...");

    var package_config_data = require('../config/package_config.json');
    const rm_promise = fsp.rmdir(package_config_data.user_config_dir, { recursive: true })
        .then(() => {
            logger.log("Removed user configuration information from home directory.");
            return fsp.unlink(package_config_data.binary_path);
        }, handle_fatal_error);

    const unlink_promise = fsp.unlink(package_config_data.binary_path)
        .then(() => logger.log("Deleted '??' binary."), handle_fatal_error);

    await rm_promise;
    await unlink_promise;

    logger.log("Uninstalled!");

    return;
}



