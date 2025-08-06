import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/config';
import User from '../models/user.model';
import Category from '../models/category.model';
import Product from '../models/product.model';

// Demo Users
const users = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    phoneNumber: '1234567890',
    role: 'admin'
  },
  {
    email: 'user@example.com',
    password: 'user123',
    firstName: 'Demo',
    lastName: 'User',
    phoneNumber: '0987654321',
    role: 'customer'
  }
];

// Categories with Unsplash images
const categories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661',
    sortOrder: 1,
    slug: 'electronics'
  },
  {
    name: 'Clothing',
    description: 'Fashion and apparel',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
    sortOrder: 2,
    slug: 'clothing'
  },
  {
    name: 'Home and Garden',
    description: 'Home improvement and garden supplies',
    image: 'https://images.unsplash.com/photo-1416339684178-3a239570f315',
    sortOrder: 3,
    slug: 'home-and-garden'
  },
  {
    name: 'Sports',
    description: 'Sports equipment and accessories',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
    sortOrder: 4,
    slug: 'sports'
  },
  {
    name: 'Books',
    description: 'Books and publications',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d',
    sortOrder: 5,
    slug: 'books'
  },
  {
    name: 'Health and Beauty',
    description: 'Health, beauty and personal care products',
    image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a',
    sortOrder: 6,
    slug: 'health-and-beauty'
  },
  {
    name: 'Toys',
    description: 'Toys and games',
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7',
    sortOrder: 7,
    slug: 'toys'
  },
  {
    name: 'Food',
    description: 'Food and beverages',
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759',
    sortOrder: 8,
    slug: 'food'
  }
];

// Function to generate products for each category
const generateProducts = (categoryId: string, categoryName: string) => {
  const products = [];
  const count = Math.floor(Math.random() * 5) + 5; // 5-10 products per category

  for (let i = 0; i < count; i++) {
    products.push({
      name: `${categoryName} Product ${i + 1}`,
      description: `This is a sample product in the ${categoryName} category`,
      basePrice: Math.floor(Math.random() * 900) + 100, // Random price between 100-1000
      category: categoryId,
      images: [
        `https://source.unsplash.com/800x600/?${categoryName.toLowerCase()},product`
      ],
      brand: 'Sample Brand',
      specifications: {
        model: `Model ${i + 1}`,
        color: ['Black', 'White', 'Blue'][Math.floor(Math.random() * 3)]
      },
      variants: [
        {
          sku: `${categoryName.substring(0, 3).toUpperCase()}${i + 1}`,
          price: Math.floor(Math.random() * 900) + 100,
          stock: Math.floor(Math.random() * 50) + 10
        }
      ],
      tags: ['sample', categoryName.toLowerCase(), 'new'],
      isFeatured: Math.random() > 0.8, // 20% chance to be featured
      isActive: true
    });
  }

  return products;
};

// Seed function
export const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.uri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    await User.create(hashedUsers);
    console.log('Created demo users');

    // Create categories
    const createdCategories = await Category.create(categories);
    console.log('Created categories');

    // Create products for each category
    for (const category of createdCategories) {
      if (!category._id || !category.name) continue;
      const products = generateProducts(category._id.toString(), category.name);
      await Product.create(products);
    }
    console.log('Created products');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};