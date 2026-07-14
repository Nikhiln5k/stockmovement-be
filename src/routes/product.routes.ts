import { Router } from 'express';
import { getProducts, createProduct } from '../controllers/product.controller';
import { isValid, adminOnly } from '../middleware/auth.middlware';

const router = Router();
router.use(isValid);

// Any authenticated user can view products
router.get('/', getProducts);

// Only admins can create products
router.post('/', adminOnly, createProduct);

export default router;
