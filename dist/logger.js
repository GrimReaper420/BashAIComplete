"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(name) {
        this.name = name;
    }
    info(message) {
        console.info(withColor("36", `[${this.name}] ${message}`));
    }
    log(message) {
        console.log(withColor("32", `[${this.name}] ${message}`));
    }
    error(message) {
        console.error(withColor("31", `[${this.name}] ${message}`));
    }
    warn(message) {
        console.warn(withColor("33", `[${this.name}] ${message}`));
    }
    debug(message) {
        if (process.env.DEBUG === "true")
            console.debug(withColor("35", `[${this.name}] ${message}`));
    }
}
exports.Logger = Logger;
function withColor(color, text) {
    return `\x1b[${color}m${text}\x1b[0m`;
}
//# sourceMappingURL=logger.js.map