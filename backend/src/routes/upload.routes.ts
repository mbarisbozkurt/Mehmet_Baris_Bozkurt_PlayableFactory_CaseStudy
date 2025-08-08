import { Router, Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure upload directory exists
const uploadBaseDir = path.join(__dirname, '../../public/uploads');
const productUploadDir = path.join(uploadBaseDir, 'products');
fs.mkdirSync(productUploadDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, productUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '');
    const filename = `${base || 'image'}-${Date.now()}${ext.toLowerCase()}`;
    cb(null, filename);
  },
});

// File filter and limits
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/uploads/products  (form-data: file=<image>)
router.post('/products', upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }
    const url = `/static/uploads/products/${req.file.filename}`;
    return res.status(201).json({ status: 'success', data: { url } });
  } catch (err) {
    next(err);
  }
});

export default router;


