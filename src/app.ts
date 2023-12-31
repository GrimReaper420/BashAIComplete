import { AppController } from "./app.controller.js";
import { Command } from 'commander';
import { Logger } from './logger.js';
import { PackageConfiguration, UserConfiguration } from "./utils.js";

// app show app version in package.json
// $ node dist/app.js app show app version in package.json
// $ node dist/app.js app "show app version in package.json"
// $ node dist/app.js app 'show app version in package.json'

export function run() {

    const program = new Command();

    program
        .description('show app version in package.json')
        .action(async () => {
            // all arguments
            const args = process.argv.slice(2);
            const prompt = args.join(" ");

            Logger.check_config();
            
            // watch changes to configuration files to keep config data up to date.
            PackageConfiguration.watch_for_updates();
            UserConfiguration.watch_for_updates();

            const appController = new AppController();
            await appController.findCommand(prompt);

            // console.log("ive arrived!");
        });

    program.parse(process.argv);
}