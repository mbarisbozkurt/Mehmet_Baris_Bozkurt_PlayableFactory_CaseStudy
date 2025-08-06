import mongoose, { Document, Schema } from 'mongoose';

// Category document interface
export interface ICategory extends Document {
  name: string;
  description: string;
  slug: string;
  image: string;
  isActive: boolean;
  parentCategory?: mongoose.Types.ObjectId;
  sortOrder: number;
  productCount: number;
  updateProductCount(): Promise<void>;
}

// Category schema
const categorySchema = new Schema<ICategory>(
  {
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
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
categorySchema.index({ name: 'text', description: 'text' });

// Method to update product count
categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ 
    category: this._id,
    isActive: true 
  });
  this.productCount = count;
  await this.save();
};

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

// Create the model
const Category = mongoose.model<ICategory>('Category', categorySchema);

export default Category;

// Seed data for initial categories
export const defaultCategories = [
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