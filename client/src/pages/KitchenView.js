import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../services/socket';

function KitchenView() {
  const { kitchenId } = useParams();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // 1. Connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // 2. Join the kitchen room
    socket.emit('kitchen:joinRoom', kitchenId);
    console.log(`KitchenView: Attempting to join room kitchen-${kitchenId}`);

    // 3. Listen for new orders
    const onNewOrder = (newOrder) => {
      console.log('KitchenView: Received new order!', newOrder);
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    };
    
    socket.on('server:newOrder', onNewOrder);

    // 4. Cleanup function (THIS IS THE CHANGED PART)
    return () => {
      console.log(`KitchenView: Leaving room kitchen-${kitchenId}`);
      // We are NO LONGER calling socket.disconnect() here.
      // We just leave the room and remove the listener.
      socket.emit('kitchen:leaveRoom', kitchenId);
      socket.off('server:newOrder', onNewOrder);
    };
  }, [kitchenId]); // Re-run if kitchenId changes

  const handleMarkReady = (orderId, itemId) => {
    console.log(`KitchenView: Marking item ${itemId} as ready.`);
    socket.emit('kitchen:updateStatus', {
      orderId,
      itemId,
      status: 'ready',
    });

    // Remove the item from the local UI
    setOrders((prevOrders) =>
      prevOrders
        .map((order) => {
          if (order.orderId !== orderId) return order;
          const updatedItems = order.items.filter(
            (item) => item._id !== itemId
          );
          if (updatedItems.length === 0) return null;
          return { ...order, items: updatedItems };
        })
        .filter(Boolean)
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Kitchen {kitchenId} Dashboard</h2>
      {orders.length === 0 && <p>No pending orders.</p>}
      
      {orders.map((order) => (
        <div
          key={order.orderId}
          style={{ border: '2px solid black', padding: '15px', margin: '10px', backgroundColor: '#f9f9f9' }}
        >
          <h3 style={{ marginTop: 0 }}>Table: {order.tableId}</h3>
          {order.items.map((item) => (
            <div
              key={item._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #eee',
              }}
            >
              <span>
                {item.qty}x <strong>{item.name}</strong>
              </span>
              <button
                onClick={() => handleMarkReady(order.orderId, item._id)}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Mark as Ready
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default KitchenView;