import { Router } from 'express';
import { getStores, createStore } from '../controllers/store.controller';
import { isValid, adminOnly } from '../middleware/auth.middlware';

const router = Router();
router.use(isValid);

// Any authenticated user can view stores
router.get('/', getStores);

// Only admins can create stores
router.post('/', adminOnly, createStore);

export default router;
