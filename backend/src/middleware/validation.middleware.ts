import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './error.middleware';

export const validateRequest = (schema: z.ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError(400, error.issues[0]?.message || 'Validation failed'));
      } else {
        next(new AppError(400, 'Validation failed'));
      }
    }
  };
};