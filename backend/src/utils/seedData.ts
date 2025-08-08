import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/config';
import User from '../models/user.model';
import Category from '../models/category.model';
import Product from '../models/product.model';
import Review from '../models/review.model';

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

// Categories with curated Unsplash images (stable ids)
const categories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80',
    sortOrder: 1,
    slug: 'electronics'
  },
  {
    name: 'Clothing',
    description: 'Fashion and apparel',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80',
    sortOrder: 2,
    slug: 'clothing'
  },
  {
    name: 'Home and Garden',
    description: 'Home improvement and garden supplies',
    image: 'https://images.unsplash.com/photo-1416339684178-3a239570f315?auto=format&fit=crop&w=1200&q=80',
    sortOrder: 3,
    slug: 'home-and-garden'
  },
  {
    name: 'Sports',
    description: 'Sports equipment and accessories',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    sortOrder: 4,
    slug: 'sports'
  },
  {
    name: 'Books',
    description: 'Books and publications',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80',
    sortOrder: 5,
    slug: 'books'
  },
  {
    name: 'Health and Beauty',
    description: 'Health, beauty and personal care products',
    image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80',
    sortOrder: 6,
    slug: 'health-and-beauty'
  },
  {
    name: 'Toys',
    description: 'Toys and games',
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=1200&q=80',
    sortOrder: 7,
    slug: 'toys'
  },
  {
    name: 'Food',
    description: 'Food and beverages',
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1200&q=80',
    sortOrder: 8,
    slug: 'food'
  }
];

// Curated product presets per category with realistic names and images
const productPresets: Record<string, Array<{ name: string; brand: string; image: string; description: string; specs?: Record<string, string> }>> = {
  Electronics: [
    {
      name: '55" 4K UHD Smart TV',
      brand: 'NovaTech',
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
      description: 'Crystal-clear 4K resolution with built-in streaming apps and voice control.'
    },
    {
      name: 'Smartphone 128GB',
      brand: 'Aperture',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
      description: 'Sleek smartphone with dual cameras, long battery life, and fast charging.'
    },
    {
      name: '13" Ultrabook Laptop',
      brand: 'Stellar',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      description: 'Lightweight aluminum body, retina display, and all‑day battery.'
    },
    {
      name: 'Wireless Noise‑Cancelling Headphones',
      brand: 'SonicWave',
      image: 'https://images.unsplash.com/photo-1510070009289-b5bc34383727?auto=format&fit=crop&w=1200&q=80',
      description: 'Over‑ear comfort with premium ANC and 30‑hour playtime.'
    },
    {
      name: 'Mirrorless Camera 24MP',
      brand: 'Photon',
      image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
      description: 'Compact body with interchangeable lenses and 4K video.'
    },
  ],
  Clothing: [
    { name: 'Classic White T‑Shirt', brand: 'UrbanLine', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80', description: '100% cotton, breathable everyday tee.' },
    { name: 'Denim Jacket', brand: 'BlueForge', image: 'https://images.unsplash.com/photo-1520974735194-1dbd4c7e3dfd?auto=format&fit=crop&w=1200&q=80', description: 'Timeless fit denim jacket with sturdy stitching.' },
    { name: 'Running Sneakers', brand: 'Fleet', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80', description: 'Lightweight cushioning for daily runs.' },
    { name: 'Fleece Hoodie', brand: 'NorthTown', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80', description: 'Warm fleece interior with adjustable hood.' },
    { name: 'Summer Dress', brand: 'Luna', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80', description: 'Flowy silhouette with floral pattern.' },
  ],
  'Home and Garden': [
    { name: 'Modern Fabric Sofa', brand: 'HomeCraft', image: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80', description: 'Three‑seater sofa with soft fabric upholstery.' },
    { name: 'Indoor Plant Set', brand: 'GreenJoy', image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=1200&q=80', description: 'Low‑maintenance plants to freshen your home.' },
    { name: 'Wood Dining Chair', brand: 'Oak&Co', image: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80', description: 'Solid wood construction with ergonomic design.' },
    { name: 'Cookware Set 10‑Piece', brand: 'ChefLine', image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80', description: 'Non‑stick pots and pans for everyday cooking.' },
  ],
  Sports: [
    { name: 'Road Bicycle', brand: 'SwiftRide', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80', description: 'Light alloy frame with 18‑speed drivetrain.' },
    { name: 'Yoga Mat', brand: 'ZenFlex', image: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=1200&q=80', description: 'Non‑slip surface and easy to clean.' },
    { name: 'Adjustable Dumbbell Set', brand: 'IronCore', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80', description: 'Space‑saving weights for home workouts.' },
    { name: 'Match Football', brand: 'ProKick', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80', description: 'Durable PU cover with excellent grip.' },
  ],
  Books: [
    { name: 'Modern Web Development', brand: 'Press', image: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=1200&q=80', description: 'A practical guide to building robust web apps.' },
    { name: 'Creative Writing Handbook', brand: 'Press', image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80', description: 'Inspiration and techniques for storytellers.' },
  ],
  'Health and Beauty': [
    { name: 'Hydrating Face Serum', brand: 'PureSkin', image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&q=80', description: 'Hyaluronic acid formula for daily glow.' },
    { name: 'Eau de Parfum 50ml', brand: 'Aurora', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80', description: 'Long‑lasting fragrance with floral notes.' },
    { name: 'Cosmetics Bundle', brand: 'ColorPop', image: 'https://images.unsplash.com/photo-1585386959984-a41552231683?auto=format&fit=crop&w=1200&q=80', description: 'Everyday essentials for a complete look.' },
  ],
  Toys: [
    { name: 'Building Blocks Set', brand: 'MiniBlocks', image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80', description: 'Creative STEM play for kids 6+.' },
    { name: 'Plush Teddy Bear', brand: 'Huggy', image: 'https://images.unsplash.com/photo-1510583662347-5f44c0b6a3e2?auto=format&fit=crop&w=1200&q=80', description: 'Soft and cuddly friend for all ages.' },
    { name: 'Die‑Cast Toy Car', brand: 'Speedy', image: 'https://images.unsplash.com/photo-1578843687283-30c8a0b19733?auto=format&fit=crop&w=1200&q=80', description: 'Detailed model with rolling wheels.' },
  ],
  Food: [
    { name: 'Gourmet Burger', brand: 'KitchenLab', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80', description: 'Juicy beef patty with cheddar and pickles.' },
    { name: 'Neapolitan Pizza', brand: 'StoneFire', image: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=1200&q=80', description: 'Wood‑fired crust with fresh mozzarella.' },
    { name: 'Garden Salad Bowl', brand: 'FreshCo', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=80', description: 'Crisp greens with vinaigrette dressing.' },
    { name: 'Roasted Coffee Beans 1kg', brand: 'BrewHouse', image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80', description: 'Medium roast, chocolate and nut notes.' },
  ],
};

// Function to generate products for each category
const generateProducts = (categoryId: string, categoryName: string) => {
  const products = [];
  const presets = productPresets[categoryName] || [];
  const count = Math.max(5, Math.min(10, presets.length || 6));

  for (let i = 0; i < count; i++) {
    const preset = presets[i % presets.length] || {
      name: `${categoryName} Item ${i + 1}`,
      brand: 'Generic',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80',
      description: `Quality ${categoryName.toLowerCase()} product.`
    };
    products.push({
      name: preset.name,
      description: preset.description,
      basePrice: Math.floor(Math.random() * 900) + 100,
      category: categoryId,
      images: [preset.image],
      brand: preset.brand,
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
      tags: [categoryName.toLowerCase()],
      isFeatured: Math.random() > 0.8,
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
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Create users (base)
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    await User.create(hashedUsers);

    // Create additional customer users for realistic reviews
    const extraCustomers = Array.from({ length: 12 }).map((_, i) => ({
      email: `customer${i + 1}@example.com`,
      password: bcrypt.hashSync('user123', 10),
      firstName: `Customer${i + 1}`,
      lastName: 'User',
      phoneNumber: `100000000${i}`,
      role: 'customer' as const,
    }));
    await User.create(extraCustomers);
    console.log('Created demo users');

    // Create categories
    const createdCategories = await Category.create(categories);
    console.log('Created categories');

    // Create products for each category
    for (const category of createdCategories) {
      if (!category._id || !category.name) continue;
      const products = generateProducts(category._id.toString(), category.name);
      const created = await Product.create(products);
      // Create random reviews for each product to generate average ratings
      // Fetch all customers to assign unique reviewers per product
      const customers = await User.find({ role: 'customer' }).select('_id');
      for (const p of created) {
        const reviewCount = Math.floor(Math.random() * 6); // 0-5 reviews
        // create a shuffled copy of customers and take first N to avoid duplicate (user,product)
        const shuffled = [...customers].sort(() => Math.random() - 0.5).slice(0, reviewCount);
        for (let r = 0; r < shuffled.length; r++) {
          // Weighted rating around 4.0
          const roll = Math.random();
          const rating = roll < 0.30 ? 5
            : roll < 0.70 ? 4
            : roll < 0.90 ? 3
            : roll < 0.98 ? 2
            : 1; // skewed towards higher ratings
          await Review.create({
            user: shuffled[r]._id,
            product: p._id,
            order: new mongoose.Types.ObjectId(),
            rating,
            comment: `Auto-generated review #${r + 1} with rating ${rating}. Great product!`,
            isApproved: true,
          });
        }
      }
    }
    console.log('Created products');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};