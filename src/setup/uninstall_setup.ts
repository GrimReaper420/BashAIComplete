import { Logger } from '../logger.js';

const fs = require('fs-extra');
const path = require('path');

const logger = new Logger(path.basename(__filename));

function handle_fatal_error(err: any)
{
  logger.error(err);
  process.exit(5);
}

export async function run()
{
    logger.log("Cleaning up...");

    var package_config_data = require('../config/package_config.json');
    const rm_promise = fs.rmdir(package_config_data.user_config_dir, { recursive: true })
        .then(() => {
            logger.log("Removed user configuration information from home directory.");
            return fs.unlink(package_config_data.binary_path);
        }, handle_fatal_error);

    const unlink_promise = fs.unlink(package_config_data.binary_path)
        .then(() => logger.log("Deleted '??' binary."), handle_fatal_error);

    await rm_promise;
    await unlink_promise;

    logger.log("Uninstalled!");

    return;
}



