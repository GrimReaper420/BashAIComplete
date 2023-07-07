"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionException = void 0;
class CompletionException extends Error {
    constructor(message) {
        super(message);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, CompletionException.prototype);
        this.name = "CompletionException";
        this.message = message;
        this.stack = (new Error(this.message)).stack;
    }
}
exports.CompletionException = CompletionException;
//# sourceMappingURL=completion-exception.js.map