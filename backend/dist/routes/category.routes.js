"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const category_controller_1 = require("../controllers/category.controller");
const router = express_1.default.Router();
// Public routes
router.get('/', category_controller_1.getCategories);
router.get('/:id', category_controller_1.getCategory);
// Protected routes (Admin only)
router.post('/', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, category_controller_1.createCategory);
router.patch('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, category_controller_1.updateCategory);
router.delete('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, category_controller_1.deleteCategory);
exports.default = router;
