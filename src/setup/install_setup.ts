#!/usr/bin/env node

import { Logger } from '../logger.js';

import * as os from 'os';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as fsx from 'fs-extra';
import * as path from 'path';
import * as util from 'util';
import * as readlinePromises from 'readline/promises'
import { exec as _exec_ } from 'child_process';
import which from 'which';
import { createRequire } from 'module';

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

var local_config_dir = "";
var local_user_config_path = "";

var current_user_home_dir = "";
var current_user_name = "";
var current_user_id = 0;
var current_user_group_id = 0;

logger.msg('Installing as: ' + current_user_name, true);
logger.msg("Installation started by: " + os.userInfo().username);

function parse_tilde_home(path: string): string {
  return path.replace('~', current_user_home_dir);
}
async function get_current_user_information() : Promise<void> {
  const passwdPath = '/etc/passwd';
  const sudo_user_name = process.env.SUDO_USER;

  if (!sudo_user_name) {
    current_user_home_dir = os.homedir();
    current_user_id = os.userInfo().uid;
    current_user_group_id = os.userInfo().gid;
    return Promise.resolve();
  }

  current_user_name = sudo_user_name;

  return fsp.readFile(passwdPath, 'utf8')
    .then((passwdData) => {
      const userEntry = passwdData.split('\n').find((line: string) => line.startsWith(`${sudo_user_name}:`));

      if (userEntry) {
        const userEntryarr = userEntry.split(':');
        current_user_home_dir = userEntryarr[5];
        current_user_id = Number(userEntryarr[2]);
        current_user_group_id = Number(userEntryarr[3]);
      } else {
        handle_fatal_error(`User entry not found for ${sudo_user_name} in /etc/passwd. This is useful for creating configuration files as the user and not as root for global installations using sudo npm. Cannot finish installation.`);
      }
    })
    .catch((err: string) => handle_fatal_error('An error occured while getting user information: ' + err));
}

function revert_changes(): void
{
  var config_dir_exists = false;
  // deliberatey hanging promise.. will exit app when it is done
  try{
    fs.accessSync(local_config_dir);
    config_dir_exists = true;
  }
  catch(e) {
    logger.error('' + e)
    config_dir_exists = false;
  }

  if(config_dir_exists)
  {
    fs.rmSync(local_config_dir, { recursive: true });
  }

  // return fs.access(local_config_dir)
  //   .then(success => {
  //       if(success != undefined)
  //         return;
        
  //       return fs.rm(local_config_dir, { recursive: true })
  //         .catch(err => logger.error(err));
  //   })
  //   .catch(() => {}); // file not found throws error
}

function handle_fatal_error(err: any)
{
  logger.error(err);

  revert_changes();

  throw new Error(err);
}

export async function run(): Promise<void>
{
  process.on('beforeExit', (code) => {
    logger.log('Clsoing with code: ' + code);

    if((code != 0 || INSTALLATION_SUCCESSFULL == false) && BEFORE_EXIT_ALREADY_RAN == false)
    {
      BEFORE_EXIT_ALREADY_RAN = true;

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

  which('??')
    .then((path: string) => package_config_data.binary_path = path)
    .catch((error: string) => package_config_data.binary_path = "");

  

  await get_current_user_information()
    .then(() => {
      // move user config files to home dir
      local_config_dir = parse_tilde_home(package_config_data.user_config_dir);
      local_user_config_path = path.join(local_config_dir, user_config_filename);

      // save use config path to package config
      package_config_data.user_config_json_path = local_user_config_path;
    })
    .then(() => fsp.access(local_config_dir))
    .then((success: any) => !success ? handle_fatal_error("Configuration directory already exists! (" + local_config_dir + ") Might be from previous installation or coincidental. Please remove it first.") : null)
    .catch((e: any) => {}) // dismiss rejection
    .then(() => fsp.mkdir(local_config_dir, 0o700))
    .then(() => fsp.chown(local_config_dir, current_user_id, current_user_group_id))
    .then(() => {
      logger.msg('Config directory created and owned successfully.', true);
      return fsx.move(package_user_config_path, local_user_config_path)
        .then(() => fsp.chown(local_user_config_path, current_user_id, current_user_group_id));
    })
    .then(() => {
      logger.msg("Config file moved and owned successfully.", true)

      logger.msg("Updated user configuration information.", true);
      // logger.log('Home directory: ' + current_user_home_dir);
      // logger.log('Package config path: ' + package_config_path);
      // logger.log('User config path: ' + local_user_config_path);
      // logger.log('User config data: ' + JSON.stringify(package_config_data, null, 4));
      return fsp.writeFile(package_config_path, JSON.stringify(package_config_data, null, 4));
    })
    .then(() => {
      logger.msg("Updated package configuration information.", true);

      const user_config_data = require(local_user_config_path);

      // get api key from user
      // const answer = prompt("What is your OpenAI API Secret Key? (press enter to do this later): ");
      const answer = "";

      user_config_data.openaikey = answer;
      return fsp.writeFile(local_user_config_path, JSON.stringify(user_config_data, null, 4));
    })
    .catch(handle_fatal_error);
  
  logger.msg("Installation complete!", true);
  
  INSTALLATION_SUCCESSFULL = true;

  return;
}

