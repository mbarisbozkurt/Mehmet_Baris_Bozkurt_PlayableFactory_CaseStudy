import { Request, Response, NextFunction } from 'express';
import Product from '../models/product.model';
import { AppError } from '../middleware/error.middleware';

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = '1',
      limit = '12',
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      tags,
      brand,
      featured,
      active,
      includeInactive,
      inStock,
      popular,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query: any = {};

    if (category) query.category = category;
    if (featured) query.isFeatured = featured === 'true';
    if (active) {
      query.isActive = active === 'true';
    } else if (includeInactive !== 'true') {
      // By default, hide inactive products from public listing
      query.isActive = true;
    }
    if (brand) query.brand = { $regex: brand as string, $options: 'i' };
    if (rating) query.averageRating = { $gte: Number(rating) };
    if (inStock === 'true') {
      query.$or = [
        { 'variants': { $elemMatch: { stock: { $gt: 0 } } } },
        { 'variants': { $size: 0 } } // products without variants considered available
      ];
    }

    if (typeof minPrice === 'string' || typeof maxPrice === 'string') {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    if (tags) {
      const tagList = (tags as string).split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length) query.tags = { $in: tagList };
    }

    if (search) {
      // use text index if available
      query.$text = { $search: search as string };
    }

    // Popular products shortcut
    const sort: Record<string, 1 | -1> = popular === 'true'
      ? { totalReviews: -1, averageRating: -1 }
      : { [sortBy as string]: (order === 'desc' ? -1 : 1) as 1 | -1 };

    // Execute query
    const products = await Product.find(query)
      .sort(sort)
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string))
      .populate('category', 'name');

    const total = await Product.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        products,
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

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name');

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    res.json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    res.json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateProductStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { ids, isActive } = req.body as { ids: string[]; isActive: boolean | string };
    if (!Array.isArray(ids)) {
      return res.status(400).json({ status: 'error', message: 'ids (array) and isActive (boolean) are required' });
    }
    if (typeof isActive === 'string') isActive = isActive === 'true';
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ status: 'error', message: 'isActive must be boolean' });
    }
    const result: any = await Product.updateMany({ _id: { $in: ids } }, { $set: { isActive } });
    res.json({ status: 'success', data: { matched: result.matchedCount ?? result.n, modified: result.modifiedCount ?? result.nModified } });
  } catch (error) {
    next(error);
  }
};

export const getRelatedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { limit = '8' } = req.query;

    const current = await Product.findById(id);
    if (!current) {
      throw new AppError(404, 'Product not found');
    }

    const query: any = {
      _id: { $ne: current._id },
      isActive: true,
      $or: [
        { category: current.category },
        current.tags && current.tags.length ? { tags: { $in: current.tags } } : {}
      ]
    };

    // Clean empty $or entries if tags empty
    query.$or = query.$or.filter((c: any) => Object.keys(c).length);
    if (!query.$or.length) delete query.$or;

    const related = await Product.find(query)
      .sort({ averageRating: -1, totalReviews: -1, createdAt: -1 })
      .limit(parseInt(limit as string))
      .populate('category', 'name');

    res.json({
      status: 'success',
      data: { products: related }
    });
  } catch (error) {
    next(error);
  }
};