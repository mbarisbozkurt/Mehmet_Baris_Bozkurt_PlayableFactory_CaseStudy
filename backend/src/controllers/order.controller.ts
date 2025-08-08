import { Request, Response, NextFunction } from 'express';
import Order from '../models/order.model';
import { AppError } from '../middleware/error.middleware';
import Product from '../models/product.model';

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { items, shippingAddress, paymentInfo } = req.body as any;
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError(400, 'Order must contain at least one item');
    }

    // Map incoming items (productId, quantity) -> order items (product, name, price, quantity)
    const productIds = items.map((it: any) => String(it.productId));
    const products = await Product.find({ _id: { $in: productIds } }).select('_id name basePrice variants');
    const productMap = new Map<string, any>(products.map((p: any) => [String(p._id), p]));

    const orderItems = items.map((it: any) => {
      const prod: any = productMap.get(String(it.productId));
      if (!prod) throw new AppError(400, 'Invalid product in order');
      const unitPrice = typeof prod.basePrice === 'number' ? prod.basePrice : (prod.variants?.[0]?.price ?? 0);
      return {
        product: prod._id as any,
        name: prod.name,
        price: unitPrice,
        quantity: it.quantity,
      };
    });

    const order = await Order.create({
      user: req.user?.userId,
      items: orderItems,
      totalAmount: orderItems.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0),
      shippingAddress,
      paymentInfo: paymentInfo ?? { method: 'credit_card', status: 'pending' },
    });
    await order.populate('items.product', 'name');
    
    res.status(201).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query: any = {};
    if (req.user?.role !== 'admin') {
      query.user = req.user?.userId;
    }
    if (status) query.status = status;

    // Execute query
    const orders = await Order.find(query)
      .sort({ [sortBy as string]: order === 'desc' ? -1 : 1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string))
      .populate('user', 'email name')
      .populate('items.product', 'name');

    const total = await Order.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        orders,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'email name')
      .populate('items.product', 'name');

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    // Check if user has permission to view this order
    if (req.user?.role !== 'admin' && order.user.toString() !== req.user?.userId) {
      throw new AppError(403, 'You do not have permission to view this order');
    }

    res.json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, trackingNumber } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(trackingNumber && { trackingNumber })
      },
      { new: true, runValidators: true }
    ).populate('user', 'email name');

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    res.json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    // Check if user has permission to cancel this order
    if (req.user?.role !== 'admin' && order.user.toString() !== req.user?.userId) {
      throw new AppError(403, 'You do not have permission to cancel this order');
    }

    // Check if order can be cancelled
    if (!['pending', 'paid'].includes(order.status)) {
      throw new AppError(400, 'Order cannot be cancelled at this stage');
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};