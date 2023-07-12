#!/usr/bin/env node

import { Logger } from '../logger.js';

import * as os from 'os';
import * as path from 'node:path';
import * as util from 'util';
import { exec as _exec_ } from 'child_process';
import which from 'which';
import { createRequire } from 'module';
import { UserConfiguration, PackageConfiguration, UserInformation } from '../utils.js';

const require = createRequire(import.meta.url);

const prompt = require("prompt-sync")({ sigint: true });

const exec = util.promisify(_exec_);

const logger = new Logger(path.basename(import.meta.url));

const user_config_filename = 'user_config.json';
const package_config_filename = 'package_config.json';

const current_working_directory = process.cwd();
const package_config_dir = path.join(current_working_directory, 'dist/config');
const package_user_config_path = path.join(package_config_dir, user_config_filename);
const package_config_path = path.join(package_config_dir, package_config_filename);

const package_config_data = require(package_config_path);

var INSTALLATION_SUCCESSFULL = false;
var BEFORE_EXIT_ALREADY_RAN = false;

function revert_changes(): void
{
  PackageConfiguration.remove_user_config();
}

function handle_fatal_error(err: any)
{
  logger.error(err);
  throw new Error(err);
}



export async function run(): Promise<void>
{
  logger.msg('Installing as: ' + UserInformation.get_user(), true);
  logger.msg("Installation started by: " + os.userInfo().username);

  await PackageConfiguration.move_user_config_to_home();

  // watch changes to configuration files to keep config data up to date.
  PackageConfiguration.watch_for_updates();
  UserConfiguration.watch_for_updates();

  // process.on('beforeExit', (code) => {
  //   logger.log('Clsoing with code: ' + code);

  //   if((code != 0 || !INSTALLATION_SUCCESSFULL) && !BEFORE_EXIT_ALREADY_RAN)
  //   {
  //     BEFORE_EXIT_ALREADY_RAN = true;

  //     try{
  //       revert_changes();
  //     }
  //     catch (e)
  //     {
  //       logger.log('Error occcured while exiting: ');
  //       logger.log('' + e);
  //     }
      
  //     logger.msg('Reverted changes. Closed.');
  //   }
  // });

  process.on('exit', (code) => {
    logger.log('Clsoing with code: ' + code);

    if((code != 0 || !INSTALLATION_SUCCESSFULL) && !BEFORE_EXIT_ALREADY_RAN)
    {
      BEFORE_EXIT_ALREADY_RAN = true;
      logger.log("Reverting changes...");

      try{
        revert_changes();
      }
      catch (e)
      {
        logger.log('Error occcured while exiting: ');
        logger.log('' + e);
      }
      
      logger.msg('Reverted changes. Closed.');
    }
  });

  // process.on('exit', async (code) => {
  //   logger.log('Process beforeExit event with code: ' + code);

  //   await clear_files();
  // });
  
  // FILESYSTEM SETUP
  
  // find ?? binary path

  await which('??')
    .then((path: string) => package_config_data.binary_path = path)
    .catch((error: string) => package_config_data.binary_path = "");
  
  logger.msg("Installation complete!", true);
  
  INSTALLATION_SUCCESSFULL = true;

  return;
}

