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
// Review schema
const reviewSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required'],
    },
    order: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Order is required'],
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5'],
    },
    comment: {
        type: String,
        required: [true, 'Comment is required'],
        trim: true,
        minlength: [10, 'Comment must be at least 10 characters long'],
        maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    images: [{
            type: String,
            validate: {
                validator: function (v) {
                    // Basic URL validation
                    return /^https?:\/\/.+\..+/.test(v);
                },
                message: 'Invalid image URL',
            },
        }],
    likes: {
        type: Number,
        default: 0,
        min: 0,
    },
    helpfulCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    reportCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    response: {
        comment: String,
        date: Date,
    },
}, {
    timestamps: true,
});
// Ensure user can only review a product once
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
// Index for better search performance
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ isApproved: 1 });
// Update product's average rating after review is saved
reviewSchema.post('save', async function (doc) {
    const Product = mongoose_1.default.model('Product');
    const product = await Product.findById(doc.product);
    if (product) {
        await product.updateAverageRating(doc.rating);
    }
});
// Create the model
const Review = mongoose_1.default.model('Review', reviewSchema);
exports.default = Review;
