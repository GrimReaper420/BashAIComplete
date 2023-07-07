"use strict";
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
exports.run = void 0;
const app_controller_1 = require("./app.controller");
const commander_1 = require("commander");
const prompter = require("prompt-sync")({ sigint: true });
// app show app version in package.json
// $ node dist/app.js app show app version in package.json
// $ node dist/app.js app "show app version in package.json"
// $ node dist/app.js app 'show app version in package.json'
function run() {
    const program = new commander_1.Command();
    program
        .description('show app version in package.json')
        .action(() => __awaiter(this, void 0, void 0, function* () {
        // all arguments
        const args = process.argv.slice(2);
        const prompt = args.join(" ");
        const appController = new app_controller_1.AppController();
        yield appController.findCommand(prompt);
    }));
    program.parse(process.argv);
}
exports.run = run;
//# sourceMappingURL=app.js.map