"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            ...(err.details && { details: err.details })
        });
    }
    // MongoDB Duplicate Key Error
    if (err.name === 'MongoServerError' && err.code === 11000) {
        return res.status(400).json({
            status: 'error',
            message: 'Duplicate value entered'
        });
    }
    // MongoDB Validation Error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
    // JWT Error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token'
        });
    }
    // Default Error
    console.error('Error 💥:', err);
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
};
exports.errorHandler = errorHandler;
