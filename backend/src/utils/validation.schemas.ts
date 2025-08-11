import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phoneNumber: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Product Schema
export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
});

// Order Schema
export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
  })).nonempty('Order must contain at least one item'),
  shippingAddress: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    phone: z.string().min(1, 'Phone is required'),
  }),
  paymentInfo: z.object({
    method: z.enum(['credit_card', 'bank_transfer']).optional(),
    status: z.enum(['pending', 'completed', 'failed']).optional(),
    transactionId: z.string().optional(),
  }).optional(),
});

// Admin Product Schemas
export const adminCreateProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  basePrice: z.number().positive(),
  category: z.string().min(1),
  brand: z.string().min(1),
  images: z.array(z.string().min(1)).min(1),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  variants: z.array(z.object({
    sku: z.string().min(1),
    price: z.number().positive(),
    stock: z.number().int().nonnegative(),
    size: z.string().optional(),
    color: z.string().optional(),
  })).optional(),
});

export const adminUpdateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  basePrice: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  images: z.array(z.string().min(1)).min(1).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  variants: z.array(z.object({
    sku: z.string().min(1),
    price: z.number().positive(),
    stock: z.number().int().nonnegative(),
    size: z.string().optional(),
    color: z.string().optional(),
  })).optional(),
});