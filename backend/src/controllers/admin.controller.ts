import { Request, Response, NextFunction } from 'express';
import Order from '../models/order.model';
import User from '../models/user.model';
import Product from '../models/product.model';

export const getAdminStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [ordersCount, customersCount, salesAgg, popular, recentOrders, statusDist, salesTrend] = await Promise.all([
      Order.countDocuments({}),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', qty: { $sum: '$items.quantity' } } },
        { $sort: { qty: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $project: { _id: 0, productId: '$product._id', name: '$product.name', qty: 1, averageRating: '$product.averageRating' } },
      ]),
      Order.find({}).sort({ createdAt: -1 }).limit(10).select('createdAt totalAmount status').populate('user', 'email'),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $in: ['paid', 'delivered'] } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$totalAmount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalSales = salesAgg?.[0]?.total || 0;
    const statusDistribution = statusDist.reduce((acc: any, s: any) => { acc[s._id] = s.count; return acc; }, {} as Record<string, number>);

    res.json({
      status: 'success',
      data: { ordersCount, customersCount, totalSales, popularProducts: popular, recentOrders, statusDistribution, salesTrend },
    });
  } catch (err) {
    next(err);
  }
};

export const getUsersWithOrderCounts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search = '' } = req.query as { search?: string };
    const match: any = {};
    if (search) {
      match.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.aggregate([
      { $match: { role: 'customer', ...(match.$or ? match : {}) } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders',
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          firstName: 1,
          lastName: 1,
          createdAt: 1,
          ordersCount: { $size: '$orders' },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
    ]);

    res.json({ status: 'success', data: { users } });
  } catch (err) {
    next(err);
  }
};

export const getUserDetailWithOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string };
    const user = await User.findById(id).select('email firstName lastName createdAt');
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    const orders = await Order.find({ user: id })
      .sort({ createdAt: -1 })
      .select('createdAt totalAmount status');
    res.json({ status: 'success', data: { user, orders } });
  } catch (err) {
    next(err);
  }
};


