import { Request, Response, NextFunction } from 'express';
import Review from '../models/review.model';
import Order from '../models/order.model';
import { AppError } from '../middleware/error.middleware';

export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId, isApproved: true })
      .sort({ createdAt: -1 })
      .select('rating comment createdAt user')
      .populate('user', 'firstName lastName');

    res.json({ status: 'success', data: { reviews } });
  } catch (err) {
    next(err);
  }
};

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { productId, rating, comment } = req.body as { productId: string; rating: number; comment: string };

    if (!userId) throw new AppError(401, 'Unauthorized');

    // Ensure the user purchased this product at least once
    const order = await Order.findOne({ user: userId, 'items.product': productId }).sort({ createdAt: -1 });
    if (!order) throw new AppError(400, 'You can only review products you purchased');

    const review = await Review.create({
      user: userId,
      product: productId,
      order: order._id,
      rating,
      comment,
      isApproved: true, // basic flow; could be moderated by admin later
    });

    res.status(201).json({ status: 'success', data: { review } });
  } catch (err) {
    // Handle duplicate (one review per user & product)
    if ((err as any).code === 11000) {
      return next(new AppError(400, 'You already reviewed this product'));
    }
    next(err);
  }
};


