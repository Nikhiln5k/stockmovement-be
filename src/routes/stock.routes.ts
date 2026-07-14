import { Router } from 'express';
import { getStocks, adjustStock, transferStock } from '../controllers/stock.controller';
import { isValid, adminOnly } from '../middleware/auth.middlware';

const router = Router();
router.use(isValid);

// All authenticated users can view stock levels
router.get('/', getStocks);

// Only admins can adjust or transfer stock
router.post('/adjust', adminOnly, adjustStock);
router.post('/transfer', adminOnly, transferStock);

export default router;
