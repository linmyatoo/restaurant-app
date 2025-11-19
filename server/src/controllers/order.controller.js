const Order = require("../models/Order");
const mongoose = require("mongoose"); // Make sure this is imported

// This function is for your ADMIN page
exports.getActiveOrders = async (req, res) => {
  try {
    // First get unpaid orders with populated menu items
    const orders = await Order.find({ isPaid: false })
      .populate("items.menuItem", "name price")
      .lean();

    // Group by table and calculate totals
    const tableMap = {};
    orders.forEach((order) => {
      if (!tableMap[order.tableId]) {
        tableMap[order.tableId] = {
          tableId: order.tableId,
          total: 0,
          orders: [],
        };
      }

      // Transform items to include name and price from populated menuItem
      const transformedOrder = {
        ...order,
        items: order.items.map((item) => ({
          _id: item._id,
          name: item.menuItem?.name || "Unknown",
          price: item.menuItem?.price || 0,
          qty: item.qty,
          status: item.status,
        })),
      };

      tableMap[order.tableId].orders.push(transformedOrder);
      tableMap[order.tableId].total += order.total;
    });

    // Convert to array and sort
    const activeOrders = Object.values(tableMap).sort(
      (a, b) => parseInt(a.tableId) - parseInt(b.tableId)
    );

    res.json(activeOrders);
  } catch (err) {
    console.error("Error fetching active orders:", err);
    res.status(500).send("Server Error");
  }
};

// === THIS IS THE FUNCTION THAT IS CAUSING THE ERROR ===
// Make sure this function exists and starts with "exports."
exports.getKitchenOrders = async (req, res) => {
  try {
    const kitchenId = parseInt(req.params.kitchenId, 10);
    if (![1, 2].includes(kitchenId)) {
      return res.status(400).json({ msg: "Invalid Kitchen ID" });
    }

    const orders = await Order.aggregate([
      // 1. Find all unpaid orders
      { $match: { isPaid: false } },

      // 2. Deconstruct the 'items' array
      { $unwind: "$items" },

      // 3. Filter for 'pending' items only
      { $match: { "items.status": "pending" } },

      // 4. Look up the menu item details
      {
        $lookup: {
          from: "menus", // The collection name for 'Menu' model
          localField: "items.menuItem",
          foreignField: "_id",
          as: "menuItemDetails",
        },
      },

      // 5. Deconstruct the lookup results
      { $unwind: "$menuItemDetails" },

      // 6. Filter by the requested kitchen_id
      { $match: { "menuItemDetails.kitchen_id": kitchenId } },

      // 7. Group the items back together by order
      {
        $group: {
          _id: "$_id", // Group by Order ID
          tableId: { $first: "$tableId" },
          items: {
            $push: {
              _id: "$items._id",
              name: "$menuItemDetails.name",
              qty: "$items.qty",
            },
          },
        },
      },

      // 8. Clean up the output
      {
        $project: {
          _id: 0,
          orderId: "$_id",
          tableId: 1,
          items: 1,
        },
      },
      { $sort: { tableId: 1 } },
    ]);

    res.json(orders);
  } catch (err) {
    console.error(
      `Error fetching orders for kitchen ${req.params.kitchenId}:`,
      err
    );
    res.status(500).send("Server Error");
  }
};

// Get orders for a specific table (for customers to see their bill details)
exports.getTableOrders = async (req, res) => {
  try {
    const { tableId } = req.params;
    
    const orders = await Order.find({ tableId, isPaid: false })
      .populate("items.menuItem", "name price")
      .lean();

    if (!orders || orders.length === 0) {
      return res.json({ total: 0, items: [] });
    }

    // Calculate total and flatten all items
    let total = 0;
    const allItems = [];

    orders.forEach((order) => {
      total += order.total;
      order.items.forEach((item) => {
        allItems.push({
          name: item.menuItem?.name || "Unknown",
          price: item.menuItem?.price || 0,
          qty: item.qty,
          status: item.status,
        });
      });
    });

    res.json({ total, items: allItems });
  } catch (err) {
    console.error(`Error fetching orders for table ${req.params.tableId}:`, err);
    res.status(500).send("Server Error");
  }
};
