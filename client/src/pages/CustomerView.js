import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../services/socket";

const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

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
    alert("Thank you for your payment! Your table has been cleared.");
  };

  useEffect(() => {
    if (!tableId) return;

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("customer:joinTable", tableId);

    fetch(`${SERVER_URL}/api/menu`)
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch((err) => console.error("Failed to fetch menu:", err));

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
      setOrderStatus((prev) => [
        ...prev,
        `${data.itemName} is ${data.status}!`,
      ]);
    };

    // 4. (NEW) This resets the table after payment
    const onBillCleared = () => {
      resetTable();
    };

    const onOrderFailed = (data) => {
      alert(data.message);
    };

    // Listeners
    socket.on("server:updateBill", onUpdateBill);
    socket.on("server:orderStatusUpdate", onOrderStatusUpdate);
    socket.on("server:statusUpdate", onStatusUpdate);
    socket.on("server:billCleared", onBillCleared);
    socket.on("server:orderFailed", onOrderFailed);

    // --- UPDATED: Cleanup ---
    return () => {
      socket.emit("customer:leaveTable", tableId);
      socket.off("server:updateBill", onUpdateBill);
      socket.off("server:orderStatusUpdate", onOrderStatusUpdate);
      socket.off("server:statusUpdate", onStatusUpdate);
      socket.off("server:billCleared", onBillCleared);
      socket.off("server:orderFailed", onOrderFailed);
    };
  }, [tableId]);

  const addToCart = (item) => {
    // ... no change to this function
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.id === item._id
      );
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
    socket.emit("customer:placeOrder", { tableId, items: cart });
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800">
            🍽️ Restaurant Menu
          </h1>
          <p className="text-gray-600 mt-1">Table {tableId}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Menu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menu.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1"
                >
                  {item.photoUrl && (
                    <div className="relative h-48 bg-gray-200">
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        ฿{Math.round(item.price)}
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">
                          {item.name}
                        </h3>
                        {!item.photoUrl && (
                          <p className="text-orange-600 font-semibold mt-1">
                            ฿{Math.round(item.price)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="ml-3 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Cart */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  🛒 Your Order
                </h3>
                {cart.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No items yet</p>
                ) : (
                  <ul className="space-y-2 mb-4">
                    {cart.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between items-center py-2 border-b border-gray-100"
                      >
                        <span className="text-gray-700">
                          <span className="font-semibold text-orange-600">
                            {item.qty}x
                          </span>{" "}
                          {item.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={handlePlaceOrder}
                  disabled={cart.length === 0}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                >
                  Place Order
                </button>
              </div>

              {/* Bill */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  💰 Bill
                </h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-green-600">
                    ฿{Math.round(bill)}
                  </p>
                </div>
              </div>

              {/* Order Status */}
              {orderStatus.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    📋 Order Status
                  </h3>
                  <ul className="space-y-2">
                    {orderStatus.map((status, i) => (
                      <li
                        key={i}
                        className="flex items-start space-x-2 text-sm"
                      >
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-gray-700">{status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerView;
