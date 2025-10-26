import express from 'express';
import {
  getAllInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} from '../controllers/inventoryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All inventory routes require authentication
router.use(authenticateToken);

router.get('/', getAllInventory);
router.get('/:id', getInventoryItem);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

export default router;
