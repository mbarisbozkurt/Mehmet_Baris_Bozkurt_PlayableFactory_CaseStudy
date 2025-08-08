"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategory = exports.getCategories = exports.createCategory = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
const error_middleware_1 = require("../middleware/error.middleware");
const createCategory = async (req, res, next) => {
    try {
        const category = await category_model_1.default.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { category }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res, next) => {
    try {
        const { page = '1', limit = '10', search, sortBy = 'sortOrder', order = 'asc', active } = req.query;
        // Build query
        const query = {};
        if (active)
            query.isActive = active === 'true';
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        // Execute query
        const categories = await category_model_1.default.find(query)
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .populate('parentCategory', 'name');
        const total = await category_model_1.default.countDocuments(query);
        res.json({
            status: 'success',
            data: {
                categories,
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
exports.getCategories = getCategories;
const getCategory = async (req, res, next) => {
    try {
        const category = await category_model_1.default.findById(req.params.id)
            .populate('parentCategory', 'name');
        if (!category) {
            throw new error_middleware_1.AppError(404, 'Category not found');
        }
        await category.updateProductCount();
        res.json({
            status: 'success',
            data: { category }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategory = getCategory;
const updateCategory = async (req, res, next) => {
    try {
        const category = await category_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('parentCategory', 'name');
        if (!category) {
            throw new error_middleware_1.AppError(404, 'Category not found');
        }
        res.json({
            status: 'success',
            data: { category }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        // Check if category has subcategories
        const hasSubcategories = await category_model_1.default.exists({ parentCategory: req.params.id });
        if (hasSubcategories) {
            throw new error_middleware_1.AppError(400, 'Cannot delete category with subcategories');
        }
        // Check if category has products
        if ((await category_model_1.default.findById(req.params.id))?.productCount ?? 0 > 0) {
            throw new error_middleware_1.AppError(400, 'Cannot delete category with products');
        }
        const category = await category_model_1.default.findByIdAndDelete(req.params.id);
        if (!category) {
            throw new error_middleware_1.AppError(404, 'Category not found');
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
exports.deleteCategory = deleteCategory;
