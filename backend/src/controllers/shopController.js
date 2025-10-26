/**
 * Shop Controller - Shop Management
 * Copyright (C) 2024 John Michael S. Abiol
 * All Rights Reserved
 */

import prisma from '../config/database.js';

// Get all shops (for customers to browse)
export const getAllShops = async (req, res) => {
  try {
    const { search } = req.query;

    const shops = await prisma.shop.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } }
        ]
      } : {},
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        items: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            quantity: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add item count and category counts per shop
    const shopsWithCounts = shops.map(shop => ({
      id: shop.id,
      name: shop.name,
      description: shop.description,
      owner: shop.owner,
      itemCount: shop.items.length,
      categories: {
        FISH: shop.items.filter(item => item.category === 'FISH').length,
        FISH_FOOD: shop.items.filter(item => item.category === 'FISH_FOOD').length,
        FISH_PLANT: shop.items.filter(item => item.category === 'FISH_PLANT').length,
        AQUARIUM: shop.items.filter(item => item.category === 'AQUARIUM').length
      },
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt
    }));

    res.json({
      success: true,
      data: shopsWithCounts
    });
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get shop by ID with items
export const getShopById = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, search } = req.query;

    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true
          }
        },
        items: {
          where: {
            ...(category && category !== 'ALL' && { category }),
            ...(search && {
              OR: [
                { name: { contains: search } },
                { description: { contains: search } }
              ]
            })
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Format response to match mobile app expectations
    const response = {
      id: shop.id,
      name: shop.name,
      description: shop.description,
      owner: shop.owner,
      items: shop.items,
      itemCount: shop.items.length,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update shop (owner only)
export const updateShop = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Find the owner's shop
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user.id }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Update shop
    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description })
      }
    });

    res.json({
      success: true,
      shop: updatedShop
    });
  } catch (error) {
    console.error('Update shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get owner's own shop
export const getMyShop = async (req, res) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user.id },
      include: {
        items: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.json({
      success: true,
      shop
    });
  } catch (error) {
    console.error('Get my shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
