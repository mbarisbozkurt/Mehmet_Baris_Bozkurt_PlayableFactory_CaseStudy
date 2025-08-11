import mongoose, { Document, Schema } from 'mongoose';

// Product variant interface
interface IProductVariant {
  size?: string;
  color?: string;
  price: number;
  stock: number;
  sku: string; // Stock Keeping Unit
}

// Product document interface
export interface IProduct extends Document {
  name: string;
  description: string;
  basePrice: number;
  category: mongoose.Types.ObjectId;
  images: string[];
  specifications: Record<string, any>;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  variants: IProductVariant[];
  averageRating: number;
  totalReviews: number;
  brand: string;
}

// Product schema
const productSchema = new Schema<IProduct>(
  {
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
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    images: [{
      type: String,
      required: [true, 'At least one image is required'],
    }],
    specifications: {
      type: Map,
      of: Schema.Types.Mixed,
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
        required: false,
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
  },
  {
    timestamps: true,
  }
);

// Indexes for better search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
// Allow many docs without variants.sku; avoid unique collisions on null
productSchema.index({ 'variants.sku': 1 }, { sparse: true });

// Virtual for checking if product is in stock
productSchema.virtual('inStock').get(function() {
  return this.variants.some(variant => variant.stock > 0);
});

// Method to update average rating
productSchema.methods.updateAverageRating = async function(newRating: number) {
  const oldTotal = this.averageRating * this.totalReviews;
  this.totalReviews += 1;
  this.averageRating = (oldTotal + newRating) / this.totalReviews;
  await this.save();
};

// Create the model
const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;