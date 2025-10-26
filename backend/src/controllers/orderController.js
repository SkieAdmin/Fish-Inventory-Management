/**
 * Order Controller - Order and Payment Management
 * Copyright (C) 2024 John Michael S. Abiol
 * All Rights Reserved
 */

import prisma from '../config/database.js';

// Create new order (customers only)
export const createOrder = async (req, res) => {
  try {
    const { items } = req.body; // items: [{ itemId, quantity }]

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Verify all items exist and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id: item.itemId }
      });

      if (!inventoryItem) {
        return res.status(404).json({
          success: false,
          message: `Item with ID ${item.itemId} not found`
        });
      }

      if (inventoryItem.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = inventoryItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        itemId: inventoryItem.id,
        quantity: item.quantity,
        price: inventoryItem.price
      });
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        customerId: req.user.id,
        totalAmount,
        status: 'PENDING',
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            item: {
              include: {
                shop: true
              }
            }
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true
          }
        }
      }
    });

    // Update inventory quantities
    for (const item of items) {
      await prisma.inventoryItem.update({
        where: { id: item.itemId },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      });
    }

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
};

// Get customer's orders (payment history)
export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user.id },
      include: {
        items: {
          include: {
            item: {
              include: {
                shop: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format for mobile app transaction history
    const formattedOrders = orders.map(order => {
      // Get shop name from first item (orders should be from same shop)
      const shopName = order.items[0]?.item?.shop?.name || 'Unknown Shop';

      return {
        id: order.id,
        orderId: `ORD-${order.createdAt.getFullYear()}-${order.id.substring(0, 6).toUpperCase()}`,
        shop: shopName,
        date: order.createdAt.toISOString().split('T')[0],
        total: order.totalAmount,
        status: order.status,
        paymentMethod: order.payment?.paymentMethod || 'Pending',
        paypalTransactionId: order.payment?.id || null,
        items: order.items.map(item => ({
          name: item.item.name,
          quantity: item.quantity,
          price: item.price
        })),
        createdAt: order.createdAt
      };
    });

    // Calculate total spent
    const totalSpent = orders
      .filter(order => order.status === 'COMPLETED')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      success: true,
      data: {
        transactions: formattedOrders,
        totalSpent: totalSpent,
        totalTransactions: formattedOrders.length
      }
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get single order
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            item: {
              include: {
                shop: true
              }
            }
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true
          }
        },
        payment: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access to this order
    if (req.user.role === 'CUSTOMER' && order.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get orders for owner's shop (market history for owners)
export const getShopOrders = async (req, res) => {
  try {
    // Get owner's shop
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user.id }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Get all orders containing items from this shop
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            item: {
              shopId: shop.id
            }
          }
        }
      },
      include: {
        items: {
          where: {
            item: {
              shopId: shop.id
            }
          },
          include: {
            item: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true
          }
        },
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate statistics for sales reports
    let totalSales = 0;
    let totalItems = 0;
    const completedOrders = orders.filter(order => order.status === 'COMPLETED');

    orders.forEach(order => {
      // Calculate total for items from this shop only
      const shopItemsTotal = order.items.reduce((sum, orderItem) => {
        return sum + (orderItem.price * orderItem.quantity);
      }, 0);

      if (order.status === 'COMPLETED') {
        totalSales += shopItemsTotal;
      }

      totalItems += order.items.reduce((sum, item) => sum + item.quantity, 0);
    });

    // Format orders for mobile app
    const formattedOrders = orders.map(order => {
      const shopItemsTotal = order.items.reduce((sum, orderItem) => {
        return sum + (orderItem.price * orderItem.quantity);
      }, 0);

      return {
        id: order.id,
        customer: order.customer.name,
        date: order.createdAt.toISOString().split('T')[0],
        total: shopItemsTotal,
        status: order.status,
        items: order.items.length,
        itemDetails: order.items.map(item => ({
          name: item.item.name,
          quantity: item.quantity,
          price: item.price
        })),
        payment: order.payment ? {
          method: order.payment.paymentMethod,
          status: order.payment.status
        } : null,
        createdAt: order.createdAt
      };
    });

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        statistics: {
          totalOrders: orders.length,
          completedOrders: completedOrders.length,
          pendingOrders: orders.filter(o => o.status === 'PENDING').length,
          totalSales: totalSales,
          totalItems: totalItems
        }
      }
    });
  } catch (error) {
    console.error('Get shop orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update order status (owners can mark as completed)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be PENDING, COMPLETED, or CANCELLED'
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            item: {
              include: {
                shop: true
              }
            }
          }
        },
        payment: true
      }
    });

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create payment for order
export const createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    if (!orderId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and payment method are required'
      });
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (order.payment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this order'
      });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: order.totalAmount,
        status: 'PAID',
        paymentMethod
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                item: true
              }
            }
          }
        }
      }
    });

    // Update order status to completed
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' }
    });

    res.status(201).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment'
    });
  }
};

// Get payment history for customer
export const getMyPayments = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        customerId: req.user.id,
        payment: {
          isNot: null
        }
      },
      include: {
        payment: true,
        items: {
          include: {
            item: {
              include: {
                shop: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      payments: orders
    });
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
