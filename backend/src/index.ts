import express from 'express';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import Product from './models/product.model';
import { config } from './config/config';
import { errorHandler } from './middleware/error.middleware';
import { rateLimiter, securityHeaders } from './middleware/security.middleware';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import reviewRoutes from './routes/review.routes';
import adminRoutes from './routes/admin.routes';
import uploadRoutes from './routes/upload.routes';

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(rateLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-frontend-domain.com' 
    : 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (product/category images, placeholders)
app.use('/static', express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);

// Database connection
mongoose
  .connect(config.database.uri)
  .then(() => {
    console.log('Connected to MongoDB');
    // One-time migration: drop any old unique index on variants.sku
    Product.collection.indexes()
      .then((indexes) => {
        const dupe: any = indexes.find((i: any) => i?.key?.['variants.sku'] === 1 && i?.unique);
        if (!dupe) return;
        const idxName: string | undefined = dupe.name as string | undefined;
        const drop = idxName
          ? Product.collection.dropIndex(idxName)
          : (Product.collection as any).dropIndex({ 'variants.sku': 1 });
        return drop.then(() => console.log('Dropped unique index on variants.sku'));
      })
      .catch(() => undefined);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(config.server.port, () => {
  console.log(`Server is running on port ${config.server.port}`);
});