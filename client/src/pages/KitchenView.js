import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../services/socket';

const SERVER_URL = 'http://localhost:3001';

function KitchenView() {
  const { kitchenId } = useParams();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // 1. Connect and join room
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('kitchen:joinRoom', kitchenId);
    console.log(`KitchenView: Attempting to join room kitchen-${kitchenId}`);

    // === THIS IS THE FIX ===
    // 2. Fetch all pending orders for this kitchen on load
    fetch(`${SERVER_URL}/api/orders/kitchen/${kitchenId}`)
      .then(res => res.json())
      .then(data => {
        console.log(`KitchenView: Fetched ${data.length} pending orders.`, data);
        setOrders(data); // Set the initial state
      })
      .catch(err => console.error('Error fetching kitchen orders:', err));
    // === END OF FIX ===

    // 3. Listen for NEW orders
    const onNewOrder = (newOrder) => {
      console.log('KitchenView: Received new order!', newOrder);
      
      // This logic merges new items if the order card already exists
      setOrders((prevOrders) => {
        const existingOrder = prevOrders.find(o => o.orderId === newOrder.orderId);
        
        if (existingOrder) {
          // Add new items to an existing order card
          return prevOrders.map(o =>
            o.orderId === newOrder.orderId
              ? { ...o, items: [...o.items, ...newOrder.items] }
              : o
          );
        } else {
          // Add a new order card
          return [newOrder, ...prevOrders];
        }
      });
    };
    
    socket.on('server:newOrder', onNewOrder);

    // 4. Cleanup
    return () => {
      socket.emit('kitchen:leaveRoom', kitchenId);
      socket.off('server:newOrder', onNewOrder);
    };
  }, [kitchenId]);

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