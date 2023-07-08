import { Logger } from "./logger";
import { Validate } from "./app.validate";
import { BashPrompt } from "./bash-prompt";
import { AppService } from "./app.service";
import { CompletionException } from "./completion-exception";

export class AppController {
    private logger: Logger = new Logger(AppController.name);
    private appService: AppService;

    constructor() {
        this.appService = new AppService();
    }

    @Validate()
    @ErrorFilter()
    public async findCommand(_prompt: string): Promise<void> {
        this.logger.msg("Prompt: " + _prompt);

        const command = await this.appService.findCommand(_prompt);

        if (command === "") {
            this.logger.error("Command was not received!");
            process.exit(5);
        }

        this.logger.msg(`Command: ${command}\n`, true);

        const confirm = await this.appService.confirmCommand(command);

        if (!confirm) {
            this.logger.log("OK");
            return;
        }

        this.logger.msg(`Output:\n`);
        return this.appService.runCommand(command);
    }
}

function ErrorFilter() {
    const logger = new Logger('Error');
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            try {
                await originalMethod.apply(this, args);
            } catch (error) {
                if (error instanceof CompletionException) {
                    logger.error(error.message);
                } else {
                    throw error;
                }
            }
        }
    }
}

