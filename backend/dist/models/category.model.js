"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultCategories = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Category schema
const categorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        required: [true, 'Category description is required'],
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    image: {
        type: String,
        required: [true, 'Category image is required'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    parentCategory: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    sortOrder: {
        type: Number,
        default: 0,
    },
    productCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
// Index for better search performance
categorySchema.index({ name: 'text', description: 'text' });
// Method to update product count
categorySchema.methods.updateProductCount = async function () {
    const Product = mongoose_1.default.model('Product');
    const count = await Product.countDocuments({
        category: this._id,
        isActive: true
    });
    this.productCount = count;
    await this.save();
};
// Pre-save middleware to generate slug
categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
    next();
});
// Create the model
const Category = mongoose_1.default.model('Category', categorySchema);
exports.default = Category;
// Seed data for initial categories
exports.defaultCategories = [
    {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        image: '/images/categories/electronics.jpg',
        sortOrder: 1,
    },
    {
        name: 'Clothing',
        description: 'Fashion and apparel',
        image: '/images/categories/clothing.jpg',
        sortOrder: 2,
    },
    {
        name: 'Home and Garden',
        description: 'Home improvement and garden supplies',
        image: '/images/categories/home-garden.jpg',
        sortOrder: 3,
    },
    {
        name: 'Sports',
        description: 'Sports equipment and accessories',
        image: '/images/categories/sports.jpg',
        sortOrder: 4,
    },
    {
        name: 'Books',
        description: 'Books and publications',
        image: '/images/categories/books.jpg',
        sortOrder: 5,
    },
    {
        name: 'Health and Beauty',
        description: 'Health, beauty and personal care products',
        image: '/images/categories/health-beauty.jpg',
        sortOrder: 6,
    },
    {
        name: 'Toys',
        description: 'Toys and games',
        image: '/images/categories/toys.jpg',
        sortOrder: 7,
    },
    {
        name: 'Food',
        description: 'Food and beverages',
        image: '/images/categories/food.jpg',
        sortOrder: 8,
    },
];
