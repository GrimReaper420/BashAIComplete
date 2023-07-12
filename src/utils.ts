import { Logger } from './logger.js';
import * as path from 'node:path';
import * as fs from 'fs';
import * as fs_x from 'fs-extra';
import * as os from 'os';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const prompt = require("prompt-sync")({ sigint: true });

const logger = new Logger(path.basename(import.meta.url));

// UTILS VARIABLES

// const package_config_data_path = './config/package_config.json';
// var user_config_data_path = '';

// var user_config_data: any;
// var package_config_data: any = require(package_config_data_path);

const current_directory = path.dirname(import.meta.url).slice(5);
const package_config_path = path.join(current_directory, 'config/package_config.json');
const initial_package_config_data = require('./config/package_config.json');
// const initial_package_config_data = await import('./config/package_config.json', { assert: { type: "json "} });

const initial_user_config_path = path.join(current_directory, 'config/user_config.json');
const user_config_filename = path.basename(initial_user_config_path);;


export function handle_fatal_error(err: string): void
{
    logger.error(err);
    throw new Error(err);
}

export namespace UserInformation {
    var information_loaded = false;

    const user = {
        home_dir: "",
        name: "",
        id: 0,
        group_id: 0
    }

    export function get_user() {
        if(!information_loaded)
            load_information();

        return user;
    }

    export function load_information(): void {
        if(information_loaded)
            return;

        const passwdPath = '/etc/passwd';
        const sudo_user_name = process.env.SUDO_USER;
      
        if (!sudo_user_name) {
          user.home_dir = os.homedir();
          user.id = os.userInfo().uid;
          user.group_id = os.userInfo().gid;
          user.name = os.userInfo().username;

          information_loaded = true;
          return;
        }
      
        user.name = sudo_user_name;
      
        try {
          const passwdData = fs.readFileSync(passwdPath, { encoding: 'utf8' });
      
          const userEntry = passwdData.split('\n').find((line: string) => line.startsWith(`${sudo_user_name}:`));
      
          if (userEntry) {
            const userEntryarr = userEntry.split(':');
            user.home_dir = userEntryarr[5];
            user.id = Number(userEntryarr[2]);
            user.group_id = Number(userEntryarr[3]);
          } else {
            handle_fatal_error(`User entry not found for ${sudo_user_name} in /etc/passwd. This is useful for creating configuration files as the user and not as root for global installations using sudo npm. Cannot finish installation.`);
          }
      
        } catch(e: any) { handle_fatal_error(e); }

        information_loaded = true;
        return;
      }
}

export namespace PackageConfiguration {
    var config_data = initial_package_config_data;

    const user_config_dir = config_data.user_config_dir.replace('~', UserInformation.get_user().home_dir);

    // GETTING DATA --------------------------------------------------------------------------------------------------------------

    export function get_config_data() { return config_data; }
    export function get_user_config_dir() { return config_data.user_config_dir; }
    export function get_user_config_path() { return config_data.user_config_json_path; }

    // CHECKING FOR ACCESS TO FILES ----------------------------------------------------------------------------------------------------

    export function check_access_to_file(): boolean {
        logger.log("Checking acces to package configuration file.");

        try {
            fs.accessSync(package_config_path)
        } catch(e: any) {
            logger.error('Could not find the package configuration json file. Presumed to be located at: ' + package_config_path);
            throw new Error(e);
        }

        return true;
    }

    // WATCHING FOR CHANGES TO FILES ---------------------------------------------------------------------------------------------------------------------------

    export function watch_for_updates(): void {
        logger.log("Watching for changes to package configuration file.");

        check_access_to_file();

        try {
            fs.watch(package_config_path, { persistent: false }, (event_type, filename) => {
                if(event_type != "change")
                    return;
                
                config_data = require(package_config_path);
            });
        } catch(e: any) {
            logger.error("Unable to watch for changes to package configuration file.");
            throw new Error(e);
        }
    }

    /*
    UPDATING DATA ---------------------------------------------------------------------------------------------------------------------
    */
    export function update_config_data(): void { update_config_data_to(config_data); }
    export function update_config_data_to(package_config_data: any): void {
        logger.msg("Updating package configuration information.", true);

        check_access_to_file();

        try {
            fs.writeFileSync(package_config_path, JSON.stringify(package_config_data, null, 4));
        } catch(e: any) {
            logger.error("Couldn't update package configuration file.");
            throw new Error(e);
        }
    }

    // SETTERS

    export function set_user_config_data_path(user_config_data_path: string): void {
        logger.log("Setting user configuration file path.");

        config_data.user_config_json_path = user_config_data_path;
        update_config_data();
    }

    // MISC

    export async function move_user_config_to_home() {
        logger.log("Moving user configuration file to home directory.");
        
        // move user config files to home dir
        
        const local_user_config_path = path.join(user_config_dir, user_config_filename);
        
        // save user config path to package config
        PackageConfiguration.set_user_config_data_path(local_user_config_path);

        logger.log("Checking if user configuration directory already exists.");
        try {
            fs.accessSync(user_config_dir);
            handle_fatal_error("Configuration directory already exists! (" + user_config_dir + ") Might be from previous installation or coincidental. Please remove it first.");
            process.exit(5);
        } catch(e: any) {  }
        
        logger.log("Making new user configuration directory in home folder.")
        try {
            fs.mkdirSync(user_config_dir, { mode: 0o700 });
        } catch(e: any) { handle_fatal_error(e); }
        
        logger.log("Changing ownership of user configuration directory.")
        try {
            fs.chownSync(user_config_dir, UserInformation.get_user().id, UserInformation.get_user().group_id);
        } catch(e: any) { handle_fatal_error(e); }
        
        logger.log("Moving the user configuration file into the home folder.");
        try {
            await fs_x.move(initial_user_config_path, PackageConfiguration.get_user_config_path());
        } catch(e: any) { handle_fatal_error(e); }
        
        logger.log("Changing ownership of user configuration file.");
        try {
            fs.chownSync(PackageConfiguration.get_user_config_path(), UserInformation.get_user().id, UserInformation.get_user().group_id);
        } catch(e: any) { handle_fatal_error(e); }
        
    }

    export function remove_user_config() {
        logger.log("Removing user configuraiton directory.");

        var config_dir_exists = false;
        // deliberatey hanging promise.. will exit app when it is done
        try{
            fs.accessSync(user_config_dir);
            config_dir_exists = true;
        }
        catch(e) {
            logger.error('' + e)
            config_dir_exists = false;
        }

        if(!config_dir_exists)
            return
        try {
            fs.rmSync(user_config_dir, { recursive: true });
        } catch(e) { logger.error('Could not remove user config file.') }
    }

    export function remove_binary() {
        logger.log("Removing binaries...");
        try {
            fs.unlinkSync(config_data.binary_path)
        } catch(e: any) { handle_fatal_error(e); }
    }
}

export namespace UserConfiguration {
    var user_config_data_path = '';
    var user_config_data: any;

    if(PackageConfiguration.get_user_config_path() != "")
        user_config_data = require(PackageConfiguration.get_user_config_path());
    
    export function get_config_data() {return user_config_data; }

    // CREATING FILES ---------------------------------------------------------------------

    export function create_config_file() {
        logger.log("Creating new user configuration file.");

        var user_config_dir_exists = false;
        var user_config_file_exists = false;
        
        const user_config_dir = path.dirname(PackageConfiguration.get_config_data().user_config_json_path);

        try{
            fs.accessSync(user_config_dir);
            user_config_dir_exists = true;
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

        if(!check_access_to_file())
        {
            const user_config_data = {
                openapikey: "",
            }

            update_config_data(user_config_data);
        }
    }

    // CHECKING FOR ACCESS TO FILES ----------------------------------------------------------------------------------------------------

    export function check_access_to_file(): boolean {
        logger.log("Checking access to user configuration file.");

        try {
            fs.accessSync(PackageConfiguration.get_config_data().user_config_json_path);
        } catch(e: any) {
            logger.error('Could not find the user configuration json file. Presumed to be located at: ' + PackageConfiguration.get_user_config_path());
            // create_config_file();
            throw new Error(e);
        }

        return true;
    }

    // WATCHING FOR CHANGES TO FILES ---------------------------------------------------------------------------------------------------------------------------

    export function watch_for_updates(): void {
        logger.log("Watching for changes to user configuration file.");

        check_access_to_file();
    
        try {
            fs.watch(PackageConfiguration.get_user_config_path(), { persistent: false }, (event_type, filename) => {
                if(event_type != "change")
                    return;
                
                user_config_data = require(PackageConfiguration.get_config_data().user_config_json_path);
            });
        } catch(e: any) {
            logger.error("Unable to watch changes to user configuration file.");
            throw new Error(e);
        }
    }

    /*
    UPDATING FILES ---------------------------------------------------------------------------------------------------------------------
    */

    export function update_config_data(user_config_data: any): void {
        logger.log("Updating user configuration file.");

        check_access_to_file();
    
        try {
            fs.writeFileSync(PackageConfiguration.get_user_config_path(), JSON.stringify(user_config_data, null, 4), { mode: 0o700 });
        } catch(e: any) {
            logger.error("Couldn't update user configuration file.");
            throw new Error(e);
        }
        logger.log("done.");
    }

    export function set_api_key(): string
    {
        logger.log('Setting API key...');

        const answer = prompt("Set your OpenAI API Key: ");

        if(!answer.trim()) {
            logger.error('API key is missing. Quitting...');
            process.exit(0);
        }
        
        user_config_data.openaikey = answer.trim();
        update_config_data(user_config_data);

        logger.log("done.");

        return user_config_data.openaikey;
    }

}
















