"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validate = void 0;
function Validate() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const [prompt] = args;
            if (!prompt || prompt === "" || prompt === " ") {
                throw new Error("prompt is required");
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
exports.Validate = Validate;
//# sourceMappingURL=app.validate.js.map