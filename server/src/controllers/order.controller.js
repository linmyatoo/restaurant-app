const Order = require('../models/Order');

exports.getActiveOrders = async (req, res) => {
  try {
    // This is an advanced MongoDB "aggregation pipeline"
    // 1. Find all orders that are not paid
    // 2. Group them by the 'tableId'
    // 3. Sum the 'total' for each group
    // 4. Sort by tableId
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