import prisma from '../config/database.js';

export const getAllInventory = async (req, res) => {
  try {
    const { category, search, shopId } = req.query;

    // If user is OWNER, automatically filter by their shop
    let finalShopId = shopId;
    if (req.user.role === 'OWNER') {
      const shop = await prisma.shop.findUnique({
        where: { ownerId: req.user.id }
      });
      if (shop) {
        finalShopId = shop.id; // Override with owner's shop
      }
    }

    const inventory = await prisma.inventoryItem.findMany({
      where: {
        ...(category && { category }),
        ...(finalShopId && { shopId: finalShopId }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } }
          ]
        })
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            owner: {
              select: {
                id: true,
                name: true,
                username: true
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
      data: inventory
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching inventory'
    });
  }
};

export const getInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.inventoryItem.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching item'
    });
  }
};

export const createInventoryItem = async (req, res) => {
  try {
    const { name, category, quantity, price, description } = req.body;

    // Validate input
    if (!name || !category || quantity === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, quantity, and price are required'
      });
    }

    // Validate category
    const validCategories = ['FISH', 'FISH_FOOD', 'FISH_PLANT', 'AQUARIUM'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be FISH, FISH_FOOD, FISH_PLANT, or AQUARIUM'
      });
    }

    // Owner must have a shop
    if (req.user.role === 'OWNER') {
      const shop = await prisma.shop.findUnique({
        where: { ownerId: req.user.id }
      });

      if (!shop) {
        return res.status(400).json({
          success: false,
          message: 'Shop not found. Please create a shop first.'
        });
      }

      const item = await prisma.inventoryItem.create({
        data: {
          name,
          category,
          quantity: parseInt(quantity),
          price: parseFloat(price),
          description: description || null,
          shopId: shop.id
        },
        include: {
          shop: true
        }
      });

      res.status(201).json({
        success: true,
        data: item
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only owners can create inventory items'
      });
    }
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating item'
    });
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, price, description } = req.body;

    // Check if item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id },
      include: { shop: true }
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if user owns this item (only owners can update their own items)
    if (req.user.role === 'OWNER') {
      if (existingItem.shop.ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own shop items'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only owners can update inventory items'
      });
    }

    // Validate category if provided
    if (category) {
      const validCategories = ['FISH', 'FISH_FOOD', 'FISH_PLANT', 'AQUARIUM'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be FISH, FISH_FOOD, FISH_PLANT, or AQUARIUM'
        });
      }
    }

    // Update item
    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(description !== undefined && { description })
      },
      include: {
        shop: true
      }
    });

    res.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating item'
    });
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id },
      include: { shop: true }
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if user owns this item (only owners can delete their own items)
    if (req.user.role === 'OWNER') {
      if (existingItem.shop.ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own shop items'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only owners can delete inventory items'
      });
    }

    await prisma.inventoryItem.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting item'
    });
  }
};
