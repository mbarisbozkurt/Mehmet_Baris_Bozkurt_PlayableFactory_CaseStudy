import mongoose, { Document, Schema } from 'mongoose';

// Review document interface
export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  isApproved: boolean;
  images?: string[];
  likes: number;
  helpfulCount: number;
  reportCount: number;
  response?: {
    comment: string;
    date: Date;
  };
}

// Review schema
const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    order: {
      type: Schema.Types.ObjectId,
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
        validator: function(v: string) {
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
  },
  {
    timestamps: true,
  }
);

// Ensure user can only review a product once
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for better search performance
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ isApproved: 1 });

// Update product's average rating after review is saved
reviewSchema.post('save', async function(doc) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(doc.product);
  if (product) {
    await product.updateAverageRating(doc.rating);
  }
});

// Create the model
const Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review;