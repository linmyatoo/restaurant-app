const Order = require('../models/Order');
const mongoose = require('mongoose'); // Make sure this is imported

// This function is for your ADMIN page
exports.getActiveOrders = async (req, res) => {
  try {
    const activeOrders = await Order.aggregate([
      { $match: { isPaid: false } },
      {
        $group: {
          _id: '$tableId',
          total: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          tableId: '$_id',
          total: 1,
          _id: 0,
        },
      },
    ]);
    res.json(activeOrders);
  } catch (err) {
    console.error('Error fetching active orders:', err);
    res.status(500).send('Server Error');
  }
};

// === THIS IS THE FUNCTION THAT IS CAUSING THE ERROR ===
// Make sure this function exists and starts with "exports."
exports.getKitchenOrders = async (req, res) => {
  try {
    const kitchenId = parseInt(req.params.kitchenId, 10);
    if (![1, 2].includes(kitchenId)) {
      return res.status(400).json({ msg: 'Invalid Kitchen ID' });
    }

    const orders = await Order.aggregate([
      // 1. Find all unpaid orders
      { $match: { isPaid: false } },
      
      // 2. Deconstruct the 'items' array
      { $unwind: '$items' },
      
      // 3. Filter for 'pending' items only
      { $match: { 'items.status': 'pending' } },
      
      // 4. Look up the menu item details
      {
        $lookup: {
          from: 'menus', // The collection name for 'Menu' model
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'menuItemDetails'
        }
      },
      
      // 5. Deconstruct the lookup results
      { $unwind: '$menuItemDetails' },
      
      // 6. Filter by the requested kitchen_id
      { $match: { 'menuItemDetails.kitchen_id': kitchenId } },
      
      // 7. Group the items back together by order
      {
        $group: {
          _id: '$_id', // Group by Order ID
          tableId: { $first: '$tableId' },
          items: {
            $push: {
              _id: '$items._id',
              name: '$menuItemDetails.name',
              qty: '$items.qty'
            }
          }
        }
      },
      
      // 8. Clean up the output
      {
        $project: {
          _id: 0,
          orderId: '$_id',
          tableId: 1,
          items: 1
        }
      },
      { $sort: { tableId: 1 } }
    ]);
    
    res.json(orders);
  } catch (err) {
    console.error(`Error fetching orders for kitchen ${req.params.kitchenId}:`, err);
    res.status(500).send('Server Error');
  }
};