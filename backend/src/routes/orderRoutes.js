import express from 'express';
import { authenticateToken, requireCustomer, requireOwner } from '../middleware/auth.js';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getShopOrders,
  updateOrderStatus,
  createPayment,
  getMyPayments
} from '../controllers/orderController.js';

const router = express.Router();

// Customer routes
router.post('/', authenticateToken, requireCustomer, createOrder);
router.get('/my/orders', authenticateToken, requireCustomer, getMyOrders);
router.get('/my/payments', authenticateToken, requireCustomer, getMyPayments);
router.post('/payment', authenticateToken, requireCustomer, createPayment);

// Owner routes
router.get('/shop/orders', authenticateToken, requireOwner, getShopOrders);

// Shared routes
router.get('/:id', authenticateToken, getOrderById);
router.put('/:id/status', authenticateToken, updateOrderStatus);

export default router;
