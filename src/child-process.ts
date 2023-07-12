import { Logger } from "./logger.js";
import { spawn } from "child_process";
import { UserConfiguration } from "./utils.js";

export class ChildProcess {
    private logger: Logger = new Logger(ChildProcess.name);

    public run(command: string) {
        const logger = this.logger;

        const child = spawn(command, {
            shell:  UserConfiguration.get_config_data().use_config_shell ? UserConfiguration.get_config_data().shell : process.env.SHELL,
            stdio: 'inherit'
        });

        child.on('exit', function (code: any, signal: any) {
            logger.debug(`child process exited with ` +
                `code ${code} and signal ${signal}`);
        });

        child.on('error', function (err: any) {
            logger.error(`child process error: ${err}`);
        });

        child.on('message', function (message: any) {
            logger.debug(`child process message: ${message}`);
        });

        child.on('disconnect', function () {
            console.debug('child process disconnect');
        });

        child.on('close', function (code: any) {
            logger.debug(`child process close: ${code}`);
        });
    }
}
