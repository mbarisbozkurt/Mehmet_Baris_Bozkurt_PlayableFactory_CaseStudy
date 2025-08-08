"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.updateOrderStatus = exports.getOrder = exports.getOrders = exports.createOrder = void 0;
const order_model_1 = __importDefault(require("../models/order.model"));
const error_middleware_1 = require("../middleware/error.middleware");
const createOrder = async (req, res, next) => {
    try {
        const orderData = {
            ...req.body,
            user: req.user?.userId
        };
        const order = await order_model_1.default.create(orderData);
        await order.populate('items.product', 'name');
        res.status(201).json({
            status: 'success',
            data: { order }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
const getOrders = async (req, res, next) => {
    try {
        const { page = '1', limit = '10', status, sortBy = 'createdAt', order = 'desc' } = req.query;
        // Build query
        const query = {};
        if (req.user?.role !== 'admin') {
            query.user = req.user?.userId;
        }
        if (status)
            query.status = status;
        // Execute query
        const orders = await order_model_1.default.find(query)
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .populate('user', 'email name')
            .populate('items.product', 'name');
        const total = await order_model_1.default.countDocuments(query);
        res.json({
            status: 'success',
            data: {
                orders,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrders = getOrders;
const getOrder = async (req, res, next) => {
    try {
        const order = await order_model_1.default.findById(req.params.id)
            .populate('user', 'email name')
            .populate('items.product', 'name');
        if (!order) {
            throw new error_middleware_1.AppError(404, 'Order not found');
        }
        // Check if user has permission to view this order
        if (req.user?.role !== 'admin' && order.user.toString() !== req.user?.userId) {
            throw new error_middleware_1.AppError(403, 'You do not have permission to view this order');
        }
        res.json({
            status: 'success',
            data: { order }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrder = getOrder;
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, trackingNumber } = req.body;
        const order = await order_model_1.default.findByIdAndUpdate(req.params.id, {
            status,
            ...(trackingNumber && { trackingNumber })
        }, { new: true, runValidators: true }).populate('user', 'email name');
        if (!order) {
            throw new error_middleware_1.AppError(404, 'Order not found');
        }
        res.json({
            status: 'success',
            data: { order }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrderStatus = updateOrderStatus;
const cancelOrder = async (req, res, next) => {
    try {
        const order = await order_model_1.default.findById(req.params.id);
        if (!order) {
            throw new error_middleware_1.AppError(404, 'Order not found');
        }
        // Check if user has permission to cancel this order
        if (req.user?.role !== 'admin' && order.user.toString() !== req.user?.userId) {
            throw new error_middleware_1.AppError(403, 'You do not have permission to cancel this order');
        }
        // Check if order can be cancelled
        if (!['pending', 'paid'].includes(order.status)) {
            throw new error_middleware_1.AppError(400, 'Order cannot be cancelled at this stage');
        }
        order.status = 'cancelled';
        await order.save();
        res.json({
            status: 'success',
            data: { order }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelOrder = cancelOrder;
