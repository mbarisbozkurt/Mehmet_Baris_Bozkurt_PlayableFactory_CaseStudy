"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const security_middleware_1 = require("../middleware/security.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_schemas_1 = require("../utils/validation.schemas");
const router = (0, express_1.Router)();
// Apply rate limiter to all auth routes
router.use(security_middleware_1.authRateLimiter);
router.post('/register', (0, validation_middleware_1.validateRequest)(validation_schemas_1.registerSchema), auth_controller_1.register);
router.post('/login', (0, validation_middleware_1.validateRequest)(validation_schemas_1.loginSchema), auth_controller_1.login);
router.post('/forgot-password', auth_controller_1.forgotPassword);
router.post('/reset-password', auth_controller_1.resetPassword);
router.post('/verify-email', auth_controller_1.verifyEmail);
exports.default = router;
