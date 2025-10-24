const Menu = require('../models/Menu');
const Order = require('../models/Order');

// === Helper Function to Calculate Grand Total ===
// We'll use this in multiple places
const getGrandTotal = async (tableId) => {
  const allUnpaidOrders = await Order.find({
    tableId: tableId,
    isPaid: false,
  });
  const grandTotal = allUnpaidOrders.reduce(
    (acc, order) => acc + order.total,
    0
  );
  return grandTotal;
};

function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // === JOINING ROOMS ===
    socket.on('customer:joinTable', (tableId) => {
      socket.join(tableId);
      console.log(`[Socket] Socket ${socket.id} joined room table-${tableId}`);
      
      // When a customer joins, send them their current bill
      getGrandTotal(tableId).then(total => {
        socket.emit('server:updateBill', { total });
      });
    });

    socket.on('kitchen:joinRoom', (kitchenId) => {
      socket.join(`kitchen-${kitchenId}`);
      console.log(`[Socket] Socket ${socket.id} joined room kitchen-${kitchenId}`);
    });

    // === NEW: ADMIN ROOM ===
    socket.on('admin:joinRoom', () => {
      socket.join('admin-room');
      console.log(`[Socket] Socket ${socket.id} joined room admin-room`);
    });

    // === 2. CUSTOMER PLACES ORDER (UPDATED) ===
    socket.on('customer:placeOrder', async ({ tableId, items }) => {
      console.log(`[Socket] Received order from table ${tableId}:`, items);
      try {
        let orderTotal = 0;
        const orderItems = [];
        for (const item of items) {
          const menuItem = await Menu.findById(item.id);
          if (!menuItem) continue;
          orderTotal += menuItem.price * item.qty;
          orderItems.push({
            menuItem: menuItem._id,
            qty: item.qty,
            status: 'pending',
          });
        }

        const newOrder = new Order({
          tableId: tableId,
          items: orderItems,
          total: orderTotal, // This is the total for *this* order only
        });
        await newOrder.save();
        
        // --- THIS IS THE PRICE FIX ---
        // 1. Now, calculate the new GRAND TOTAL
        const grandTotal = await getGrandTotal(tableId);

        // 2. Send updated total to the customer
        io.to(tableId).emit('server:updateBill', { total: grandTotal });

        // 3. Send updated total to the admin
        io.to('admin-room').emit('server:updateTableBill', {
          tableId: tableId,
          total: grandTotal,
        });
        // --- END PRICE FIX ---

        // Send order to kitchens (no change here)
        const populatedOrder = await Order.findById(newOrder._id).populate(
          'items.menuItem'
        );
        const kitchenOrders = { 1: [], 2: [] };
        for (const item of populatedOrder.items) {
          const kitchenId = item.menuItem.kitchen_id;
          kitchenOrders[kitchenId].push({
            _id: item._id,
            name: item.menuItem.name,
            qty: item.qty,
          });
        }

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
        
        // Let customer know items are confirmed
        io.to(tableId).emit('server:orderStatusUpdate', {
          message: 'Order confirmed!',
        });

      } catch (err) {
        console.error('[Socket] Order processing failed:', err);
        socket.emit('server:orderFailed', {
          message: 'Your order could not be placed.',
        });
      }
    });

    // === 3. KITCHEN UPDATES STATUS (No Change) ===
    socket.on('kitchen:updateStatus', async ({ orderId, itemId, status }) => {
      // ... no change to this function
      console.log(`[Socket] Item ${itemId} status updated to ${status}`);
      try {
        const order = await Order.findById(orderId).populate('items.menuItem');
        const itemToUpdate = order.items.find(
          (item) => item._id.toString() === itemId
        );
        if (itemToUpdate) {
          itemToUpdate.status = status;
          await order.save();
          io.to(order.tableId).emit('server:statusUpdate', {
            itemName: itemToUpdate.menuItem.name,
            status: status,
          });
        }
      } catch (err) {
        console.error('[Socket] Status update failed:', err);
      }
    });

    // === 4. NEW: ADMIN CLEARS BILL ===
    socket.on('admin:clearBill', async ({ tableId }) => {
      console.log(`[Socket] Clearing bill for table ${tableId}`);
      try {
        // Find all unpaid orders for this table and mark them as paid
        await Order.updateMany(
          { tableId: tableId, isPaid: false },
          { $set: { isPaid: true } }
        );

        // Tell the admin to remove the table from their view
        io.to('admin-room').emit('server:tableCleared', { tableId });

        // Tell the customer's table to reset
        io.to(tableId).emit('server:billCleared');

      } catch (err) {
        console.error(`[Socket] Failed to clear bill for table ${tableId}:`, err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });
}

module.exports = initializeSocket;