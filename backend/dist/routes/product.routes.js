"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_schemas_1 = require("../utils/validation.schemas");
const router = (0, express_1.Router)();
// Public routes
router.get('/', product_controller_1.getProducts);
router.get('/:id', product_controller_1.getProduct);
router.get('/:id/related', product_controller_1.getRelatedProducts);
// Protected routes (admin only)
router.use(auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin);
router.post('/', (0, validation_middleware_1.validateRequest)(validation_schemas_1.productSchema), product_controller_1.createProduct);
router.patch('/:id', product_controller_1.updateProduct);
router.delete('/:id', product_controller_1.deleteProduct);
exports.default = router;
