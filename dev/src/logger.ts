import { createRequire } from "module";

const require = createRequire(import.meta.url);


var DEV_LOGGING = true;

export class Logger {
    constructor(
        private name: string
    ) { }

    public static check_config()
    {
        const package_config_data = require('./config/package_config.json');
        const user_config_data = require(package_config_data.user_config_json_path);

        DEV_LOGGING = user_config_data.logging;
    }

    public msg(message: string, colored: boolean = false) {
        if(!colored)
            console.log(message);
        else
            console.log(withColor("36", `${message}`));
    }

    public info(message: string) {
        console.info(withColor("36", `[${this.name}] ${message}`));
    }

    public log(message: string) {
        if(DEV_LOGGING)
            console.log(withColor("32", `[${this.name}] ${message}`));
    }

    public error(message: string) {
        console.error(withColor("31", `[${this.name}] ${message}`));
    }

    public warn(message: string) {
        console.warn(withColor("33", `[${this.name}] ${message}`));
    }

    public debug(message: string) {
        if(DEV_LOGGING)
            if (process.env.DEBUG === "true") console.debug(withColor("35", `[${this.name}] ${message}`));
    }
}


function withColor(color: string, text: string) {
    return `\x1b[${color}m${text}\x1b[0m`;
}
