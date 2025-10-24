const Menu = require('../models/Menu');
const Order = require('../models/Order');

function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // === 1. JOINING ROOMS ===
    socket.on('customer:joinTable', (tableId) => {
      socket.join(tableId); // Join a room named after the table (e.g., "table-5")
      console.log(`Socket ${socket.id} joined room table-${tableId}`);
    });

    socket.on('kitchen:joinRoom', (kitchenId) => {
      socket.join(`kitchen-${kitchenId}`); // Join "kitchen-1" or "kitchen-2"
      console.log(`Socket ${socket.id} joined room kitchen-${kitchenId}`);
    });

    // === 2. CUSTOMER PLACES ORDER ===
    socket.on('customer:placeOrder', async ({ tableId, items }) => {
      try {
        let total = 0;
        const orderItems = []; // Array to store items for the DB

        // 1. Prepare order items and calculate total
        for (const item of items) {
          const menuItem = await Menu.findById(item.id);
          if (!menuItem) continue;
          total += menuItem.price * item.qty;
          orderItems.push({
            menuItem: menuItem._id,
            qty: item.qty,
            status: 'pending',
          });
        }

        // 2. Save the *full* order to the database
        const newOrder = new Order({
          tableId: tableId,
          items: orderItems,
          total: total,
        });
        await newOrder.save();

        // 3. Populate order to get item names and kitchen_ids
        const populatedOrder = await Order.findById(newOrder._id).populate(
          'items.menuItem'
        );

        // 4. SPLIT THE ORDER for the kitchens
        const kitchenOrders = { 1: [], 2: [] };
        
        for (const item of populatedOrder.items) {
          const kitchenId = item.menuItem.kitchen_id; // This is the magic!
          kitchenOrders[kitchenId].push({
            _id: item._id, // This is the unique OrderItem ID
            name: item.menuItem.name,
            qty: item.qty,
          });
        }

        // 5. Emit the split orders to the correct kitchen rooms
        if (kitchenOrders[1].length > 0) {
          io.to('kitchen-1').emit('server:newOrder', {
            orderId: newOrder._id,
            tableId: newOrder.tableId,
            items: kitchenOrders[1],
          });
        }
        if (kitchenOrders[2].length > 0) {
          io.to('kitchen-2').emit('server:newOrder', {
            orderId: newOrder._id,
            tableId: newOrder.tableId,
            items: kitchenOrders[2],
          });
        }

        // 6. Send confirmation and total bill back to the customer
        io.to(tableId).emit('server:orderConfirmation', populatedOrder);

      } catch (err) {
        console.error('Order processing failed:', err);
        io.to(tableId).emit('server:orderFailed', {
          message: 'Your order could not be placed.',
        });
      }
    });

    // === 3. KITCHEN UPDATES STATUS ===
    socket.on('kitchen:updateStatus', async ({ orderId, itemId, status }) => {
      try {
        // Find the order and the specific item
        const order = await Order.findById(orderId).populate('items.menuItem');
        const itemToUpdate = order.items.find(
          (item) => item._id.toString() === itemId
        );

        if (itemToUpdate) {
          itemToUpdate.status = status;
          await order.save();

          // Notify the customer's table
          io.to(order.tableId).emit('server:statusUpdate', {
            itemName: itemToUpdate.menuItem.name,
            status: status, // e.g., "ready"
          });
        }
      } catch (err) {
        console.error('Status update failed:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

module.exports = initializeSocket;