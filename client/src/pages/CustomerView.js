import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../services/socket';

const SERVER_URL = 'http://localhost:3001';

function CustomerView() {
  const { tableId } = useParams();
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [bill, setBill] = useState(0);
  const [orderStatus, setOrderStatus] = useState([]);

  // --- NEW: Helper function to reset the table ---
  const resetTable = () => {
    setCart([]);
    setBill(0);
    setOrderStatus([]);
    alert('Thank you for your payment! Your table has been cleared.');
  };

  useEffect(() => {
    if (!tableId) return;

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('customer:joinTable', tableId);

    fetch(`${SERVER_URL}/api/menu`)
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch((err) => console.error('Failed to fetch menu:', err));

    // --- UPDATED: Listen for events ---
    
    // 1. (NEW) This sets the bill total from the server
    const onUpdateBill = (data) => {
      setBill(data.total);
    };
    
    // 2. (RENAMED) This just confirms an order went through
    const onOrderStatusUpdate = (data) => {
      setOrderStatus((prev) => [...prev, data.message]);
    };
    
    // 3. This tracks item readiness
    const onStatusUpdate = (data) => {
      setOrderStatus((prev) => [...prev, `${data.itemName} is ${data.status}!`]);
    };

    // 4. (NEW) This resets the table after payment
    const onBillCleared = () => {
      resetTable();
    };
    
    const onOrderFailed = (data) => {
      alert(data.message);
    };
    
    // Listeners
    socket.on('server:updateBill', onUpdateBill);
    socket.on('server:orderStatusUpdate', onOrderStatusUpdate);
    socket.on('server:statusUpdate', onStatusUpdate);
    socket.on('server:billCleared', onBillCleared);
    socket.on('server:orderFailed', onOrderFailed);

    // --- UPDATED: Cleanup ---
    return () => {
      socket.emit('customer:leaveTable', tableId);
      socket.off('server:updateBill', onUpdateBill);
      socket.off('server:orderStatusUpdate', onOrderStatusUpdate);
      socket.off('server:statusUpdate', onStatusUpdate);
      socket.off('server:billCleared', onBillCleared);
      socket.off('server:orderFailed', onOrderFailed);
    };
  }, [tableId]);

  const addToCart = (item) => {
    // ... no change to this function
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item._id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item._id
            ? { ...cartItem, qty: cartItem.qty + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { id: item._id, name: item.name, qty: 1 }];
      }
    });
  };

  const handlePlaceOrder = () => {
    // ... no change to this function
    if (cart.length === 0) return;
    socket.emit('customer:placeOrder', { tableId, items: cart });
    setCart([]);
  };

  return (
    <div style={{ display: 'flex', gap: '40px', padding: '20px' }}>
      <div>
        <h2>Menu (Table {tableId})</h2>
        {/* ... no change to this menu mapping ... */}
        {menu.map((item) => (
          <div
            key={item._id}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              margin: '5px',
              maxWidth: '300px',
            }}
          >
            {item.photoUrl && (
              <img
                src={`${SERVER_URL}${item.photoUrl}`}
                alt={item.name}
                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
              />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <div>
                <strong>{item.name}</strong>
                <p style={{ margin: 0 }}>${item.price}</p>
              </div>
              <button onClick={() => addToCart(item)} style={{ marginLeft: '10px' }}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <div>
        <h3>Your Order</h3>
        {/* ... no change to this cart mapping ... */}
        <ul>
          {cart.map((item) => (
            <li key={item.id}>
              {item.qty}x {item.name}
            </li>
          ))}
        </ul>
        <button onClick={handlePlaceOrder} disabled={cart.length === 0}>
          Place Order
        </button>
        <hr />
        <h3>Bill</h3>
        <strong>Total: ${bill.toFixed(2)}</strong>
        <h3>Order Status</h3>
        <ul>
          {orderStatus.map((status, i) => (
            <li key={i}>{status}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CustomerView;