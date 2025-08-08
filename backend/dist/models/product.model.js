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
const mongoose_1 = __importStar(require("mongoose"));
// Product schema
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        index: true, // Add index for better search performance
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
    },
    basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: [0, 'Price cannot be negative'],
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required'],
    },
    images: [{
            type: String,
            required: [true, 'At least one image is required'],
        }],
    specifications: {
        type: Map,
        of: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    tags: [{
            type: String,
            trim: true,
        }],
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    variants: [{
            size: String,
            color: String,
            price: {
                type: Number,
                required: true,
                min: [0, 'Price cannot be negative'],
            },
            stock: {
                type: Number,
                required: true,
                min: [0, 'Stock cannot be negative'],
                default: 0,
            },
            sku: {
                type: String,
                required: true,
                unique: true,
            },
        }],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    totalReviews: {
        type: Number,
        default: 0,
        min: 0,
    },
    brand: {
        type: String,
        required: [true, 'Brand is required'],
        trim: true,
    },
}, {
    timestamps: true,
});
// Indexes for better search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
// Virtual for checking if product is in stock
productSchema.virtual('inStock').get(function () {
    return this.variants.some(variant => variant.stock > 0);
});
// Method to update average rating
productSchema.methods.updateAverageRating = async function (newRating) {
    const oldTotal = this.averageRating * this.totalReviews;
    this.totalReviews += 1;
    this.averageRating = (oldTotal + newRating) / this.totalReviews;
    await this.save();
};
// Create the model
const Product = mongoose_1.default.model('Product', productSchema);
exports.default = Product;
