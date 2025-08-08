"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelatedProducts = exports.deleteProduct = exports.updateProduct = exports.getProduct = exports.getProducts = exports.createProduct = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const error_middleware_1 = require("../middleware/error.middleware");
const createProduct = async (req, res, next) => {
    try {
        const product = await product_model_1.default.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { product }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const getProducts = async (req, res, next) => {
    try {
        const { page = '1', limit = '12', search, category, minPrice, maxPrice, rating, tags, brand, featured, active, inStock, popular, sortBy = 'createdAt', order = 'desc' } = req.query;
        // Build query
        const query = {};
        if (category)
            query.category = category;
        if (featured)
            query.isFeatured = featured === 'true';
        if (active)
            query.isActive = active === 'true';
        if (brand)
            query.brand = { $regex: brand, $options: 'i' };
        if (rating)
            query.averageRating = { $gte: Number(rating) };
        if (inStock === 'true') {
            query.$or = [
                { 'variants': { $elemMatch: { stock: { $gt: 0 } } } },
                { 'variants': { $size: 0 } } // products without variants considered available
            ];
        }
        if (typeof minPrice === 'string' || typeof maxPrice === 'string') {
            query.basePrice = {};
            if (minPrice)
                query.basePrice.$gte = Number(minPrice);
            if (maxPrice)
                query.basePrice.$lte = Number(maxPrice);
        }
        if (tags) {
            const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
            if (tagList.length)
                query.tags = { $in: tagList };
        }
        if (search) {
            // use text index if available
            query.$text = { $search: search };
        }
        // Popular products shortcut
        const sort = popular === 'true'
            ? { totalReviews: -1, averageRating: -1 }
            : { [sortBy]: (order === 'desc' ? -1 : 1) };
        // Execute query
        const products = await product_model_1.default.find(query)
            .sort(sort)
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .populate('category', 'name');
        const total = await product_model_1.default.countDocuments(query);
        res.json({
            status: 'success',
            data: {
                products,
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
exports.getProducts = getProducts;
const getProduct = async (req, res, next) => {
    try {
        const product = await product_model_1.default.findById(req.params.id)
            .populate('category', 'name');
        if (!product) {
            throw new error_middleware_1.AppError(404, 'Product not found');
        }
        res.json({
            status: 'success',
            data: { product }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProduct = getProduct;
const updateProduct = async (req, res, next) => {
    try {
        const product = await product_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) {
            throw new error_middleware_1.AppError(404, 'Product not found');
        }
        res.json({
            status: 'success',
            data: { product }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const product = await product_model_1.default.findByIdAndDelete(req.params.id);
        if (!product) {
            throw new error_middleware_1.AppError(404, 'Product not found');
        }
        res.status(204).json({
            status: 'success',
            data: null
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
const getRelatedProducts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { limit = '8' } = req.query;
        const current = await product_model_1.default.findById(id);
        if (!current) {
            throw new error_middleware_1.AppError(404, 'Product not found');
        }
        const query = {
            _id: { $ne: current._id },
            isActive: true,
            $or: [
                { category: current.category },
                current.tags && current.tags.length ? { tags: { $in: current.tags } } : {}
            ]
        };
        // Clean empty $or entries if tags empty
        query.$or = query.$or.filter((c) => Object.keys(c).length);
        if (!query.$or.length)
            delete query.$or;
        const related = await product_model_1.default.find(query)
            .sort({ averageRating: -1, totalReviews: -1, createdAt: -1 })
            .limit(parseInt(limit))
            .populate('category', 'name');
        res.json({
            status: 'success',
            data: { products: related }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRelatedProducts = getRelatedProducts;
