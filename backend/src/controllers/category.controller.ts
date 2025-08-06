import { Request, Response, NextFunction } from 'express';
import Category from '../models/category.model';
import { AppError } from '../middleware/error.middleware';

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = '1',
      limit = '10',
      search,
      sortBy = 'sortOrder',
      order = 'asc',
      active
    } = req.query;

    // Build query
    const query: any = {};
    if (active) query.isActive = active === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query
    const categories = await Category.find(query)
      .sort({ [sortBy as string]: order === 'desc' ? -1 : 1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string))
      .populate('parentCategory', 'name');

    const total = await Category.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        categories,
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

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name');

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    await category.updateProductCount();

    res.json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name');

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    res.json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if category has subcategories
    const hasSubcategories = await Category.exists({ parentCategory: req.params.id });
    if (hasSubcategories) {
      throw new AppError(400, 'Cannot delete category with subcategories');
    }

    // Check if category has products
    if ((await Category.findById(req.params.id))?.productCount ?? 0 > 0) {
      throw new AppError(400, 'Cannot delete category with products');
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};