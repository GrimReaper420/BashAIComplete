"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildProcess = void 0;
const logger_1 = require("./logger");
class ChildProcess {
    constructor() {
        this.logger = new logger_1.Logger(ChildProcess.name);
    }
    run(command) {
        const logger = this.logger;
        const { spawn } = require('node:child_process');
        const child = spawn(command, {
            shell: true,
            stdio: 'inherit'
        });
        child.on('exit', function (code, signal) {
            logger.debug(`child process exited with ` +
                `code ${code} and signal ${signal}`);
        });
        child.on('error', function (err) {
            logger.error(`child process error: ${err}`);
        });
        child.on('message', function (message) {
            logger.debug(`child process message: ${message}`);
        });
        child.on('disconnect', function () {
            console.debug('child process disconnect');
        });
        child.on('close', function (code) {
            logger.debug(`child process close: ${code}`);
        });
    }
}
exports.ChildProcess = ChildProcess;
//# sourceMappingURL=child-process.js.map