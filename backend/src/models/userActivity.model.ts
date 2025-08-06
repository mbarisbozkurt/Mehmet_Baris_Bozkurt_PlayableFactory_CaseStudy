import mongoose, { Document, Schema } from 'mongoose';

// UserActivity document interface
export interface IUserActivity extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  type: 'view' | 'search' | 'purchase' | 'cart_add' | 'wishlist_add';
  searchQuery?: string;
  category?: mongoose.Types.ObjectId;
  duration?: number; // Time spent viewing in seconds
  source: 'home' | 'search' | 'category' | 'recommendation' | 'other';
}

// UserActivity schema
const userActivitySchema = new Schema<IUserActivity>(
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
    type: {
      type: String,
      enum: ['view', 'search', 'purchase', 'cart_add', 'wishlist_add'],
      required: [true, 'Activity type is required'],
    },
    searchQuery: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    duration: {
      type: Number,
      min: 0,
    },
    source: {
      type: String,
      enum: ['home', 'search', 'category', 'recommendation', 'other'],
      default: 'other',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better search and recommendation performance
userActivitySchema.index({ user: 1, createdAt: -1 });
userActivitySchema.index({ product: 1, type: 1 });
userActivitySchema.index({ user: 1, type: 1, createdAt: -1 });

// TTL index - Delete activities older than 30 days
userActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Create the model
const UserActivity = mongoose.model<IUserActivity>('UserActivity', userActivitySchema);

export default UserActivity;