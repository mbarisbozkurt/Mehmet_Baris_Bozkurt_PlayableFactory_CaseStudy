"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const order_controller_1 = require("../controllers/order.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_schemas_1 = require("../utils/validation.schemas");
const router = express_1.default.Router();
// All order routes require authentication
router.use(auth_middleware_1.authenticate);
// Customer & Admin routes
router.post('/', (0, validation_middleware_1.validateRequest)(validation_schemas_1.orderSchema), order_controller_1.createOrder);
router.get('/', order_controller_1.getOrders);
router.get('/:id', order_controller_1.getOrder);
router.post('/:id/cancel', order_controller_1.cancelOrder);
// Admin only routes
router.patch('/:id/status', auth_middleware_1.authorizeAdmin, order_controller_1.updateOrderStatus);
exports.default = router;
