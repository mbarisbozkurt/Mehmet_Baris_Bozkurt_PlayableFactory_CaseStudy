import express from 'express';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config/config';
import { errorHandler } from './middleware/error.middleware';
import { rateLimiter, securityHeaders } from './middleware/security.middleware';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
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
app.use('/api/uploads', uploadRoutes);

// Database connection
mongoose
  .connect(config.database.uri)
  .then(() => {
    console.log('Connected to MongoDB');
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