"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const error_middleware_1 = require("./error.middleware");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                next(new error_middleware_1.AppError(400, error.issues[0]?.message || 'Validation failed'));
            }
            else {
                next(new error_middleware_1.AppError(400, 'Validation failed'));
            }
        }
    };
};
exports.validateRequest = validateRequest;
