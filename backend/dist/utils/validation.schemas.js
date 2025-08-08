"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderSchema = exports.productSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Auth Schemas
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    firstName: zod_1.z.string().min(2, 'First name is required'),
    lastName: zod_1.z.string().min(2, 'Last name is required'),
    phoneNumber: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
// Product Schema
exports.productSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Product name is required'),
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters'),
    price: zod_1.z.number().positive('Price must be positive'),
    category: zod_1.z.string().min(1, 'Category is required'),
    stock: zod_1.z.number().int().nonnegative('Stock cannot be negative'),
});
// Order Schema
exports.orderSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().min(1, 'Product ID is required'),
        quantity: zod_1.z.number().int().positive('Quantity must be positive'),
    })).nonempty('Order must contain at least one item'),
    shippingAddress: zod_1.z.object({
        street: zod_1.z.string().min(1, 'Street is required'),
        city: zod_1.z.string().min(1, 'City is required'),
        state: zod_1.z.string().min(1, 'State is required'),
        zipCode: zod_1.z.string().min(1, 'Zip code is required'),
    }),
});
