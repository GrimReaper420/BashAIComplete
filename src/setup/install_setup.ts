#!/usr/bin/env node

import { Logger } from '../logger.js';

const fs = require('fs-extra');
// const fsp = require('fs-extra/promises');
const path = require('path');

const readlinePromises = require('readline/promises');

const rl = readlinePromises.createInterface({
  input: process.stdin,
  output: process.stdout
});

const logger = new Logger(path.basename(__filename));

const user_config_filename = 'user_config.json';
const package_config_filename = 'package_config.json';

const package_config_dir = path.join(__dirname, '../config');
const package_user_config_path = path.join(package_config_dir, user_config_filename);
const package_config_path = path.join(package_config_dir, package_config_filename);

const package_config_data = require(package_config_path);

function parseTildeHome(inputPath: string) {
  if(process.env.HOME == undefined)
    return inputPath;

  return inputPath.replace('~', process.env.HOME);
}

function handle_fatal_error(err: any)
{
  logger.error(err);
  process.exit(5);
}

export async function run()
{
  // FILESYSTEM SETUP
  
  // find ?? binary path
  const which = require("which");
  const binaryPath = which.sync('??');
  package_config_data.binary_path = binaryPath;

  // move user config files to home dir
  const local_config_dir = parseTildeHome(package_config_data.user_config_dir);
  const local_user_config_path = path.join(local_config_dir, user_config_filename);

  // save use config path to package config
  package_config_data.user_config_json_path = local_user_config_path;

  // if(fs.existsSync(local_config_dir))
  // {
  //   logger.error("Configuration directory already exists! (" + local_config_dir + ") Might be from previous installation or coincidental. Please remove it first.");
  //   process.exit(5);
  // }

  const installation_promise = fs.access(local_config_dir)
    .then((success: any) => !success ? handle_fatal_error("Configuration directory already exists! (" + local_config_dir + ") Might be from previous installation or coincidental. Please remove it first.") : null, undefined)
    .then(() => fs.mkdir(local_config_dir))
    .then(() => {
      logger.log('Config directory created successfully.');
      return fs.move(package_user_config_path, local_user_config_path);
    })
    .then(() => {
      logger.log("Config file moved successfully.")

      // get api key
      const user_config_data = require(local_user_config_path);
      
      return rl.question("What is your OpenAI API Secret Key? (press enter to do this later): ")
        .then((answer: string) => {
          rl.close();

          user_config_data.openaikey = answer;
          return fs.writeFile(local_user_config_path, JSON.stringify(user_config_data, null, 4));
        })
        .catch(handle_fatal_error);
    })
    .then(() => {
      logger.log("Updated user configuration information.");
      return fs.writeFile(package_config_path, JSON.stringify(package_config_data, null, 4));
    })
    .then(() => {
      logger.log("Updated package configuration information.");
      logger.msg("Installation complete!", true);
    })
    .catch(handle_fatal_error);
  
  await installation_promise;
  
  logger.log("Installation complete!");
  
  return;
}

