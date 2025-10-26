import express from 'express';
import { authenticateToken, requireOwner } from '../middleware/auth.js';
import {
  getAllShops,
  getShopById,
  updateShop,
  getMyShop
} from '../controllers/shopController.js';

const router = express.Router();

// Public routes (accessible to authenticated users)
router.get('/', authenticateToken, getAllShops);
router.get('/:id', authenticateToken, getShopById);

// Owner-only routes
router.get('/my/shop', authenticateToken, requireOwner, getMyShop);
router.put('/my/shop', authenticateToken, requireOwner, updateShop);

export default router;
