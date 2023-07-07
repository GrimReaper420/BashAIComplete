"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const logger_1 = require("./logger");
const app_validate_1 = require("./app.validate");
const app_service_1 = require("./app.service");
const completion_exception_1 = require("./completion-exception");
class AppController {
    constructor() {
        this.logger = new logger_1.Logger(AppController.name);
        this.appService = new app_service_1.AppService();
    }
    findCommand(_prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = yield this.appService.findCommand(_prompt);
            if (command === "") {
                throw new Error("command not found");
            }
            this.logger.log(`command: ${command}\n`);
            const confirm = yield this.appService.confirmCommand(command);
            if (!confirm) {
                this.logger.log("command not run");
                return;
            }
            yield this.appService.runCommand(command);
        });
    }
}
__decorate([
    (0, app_validate_1.Validate)(),
    ErrorFilter()
], AppController.prototype, "findCommand", null);
exports.AppController = AppController;
function ErrorFilter() {
    const logger = new logger_1.Logger('Error');
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield originalMethod.apply(this, args);
                }
                catch (error) {
                    if (error instanceof completion_exception_1.CompletionException) {
                        logger.error(error.message);
                    }
                    else {
                        throw error;
                    }
                }
            });
        };
    };
}
//# sourceMappingURL=app.controller.js.map