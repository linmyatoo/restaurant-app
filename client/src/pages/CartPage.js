import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MobileNav from "../components/MobileNav";
import { socket } from "../services/socket";

const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

function CartPage() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [bill, setBill] = useState(0);
  const [orderStatus, setOrderStatus] = useState([]);
  const [orderedItems, setOrderedItems] = useState([]);

  const resetTable = () => {
    setCart([]);
    setBill(0);
    setOrderStatus([]);
    setOrderedItems([]);
    sessionStorage.removeItem(`cart_${tableId}`);
    alert("Thank you for your payment! Your table has been cleared.");
  };

  // Fetch existing orders for this table on mount
  const fetchTableOrders = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/orders/table/${tableId}`);
      const data = await res.json();
      
      if (data.total > 0) {
        setBill(data.total);
        setOrderedItems(data.items);
      }
    } catch (err) {
      console.error("Error fetching table orders:", err);
    }
  };

  useEffect(() => {
    if (!tableId) return;

    // Fetch existing orders on page load
    fetchTableOrders();

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("customer:joinTable", tableId);

    // Load cart from sessionStorage
    const savedCart = sessionStorage.getItem(`cart_${tableId}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    const onUpdateBill = (data) => {
      setBill(data.total);
      // Refresh ordered items when bill updates
      fetchTableOrders();
    };

    const onOrderStatusUpdate = (data) => {
      setOrderStatus((prev) => [...prev, data.message]);
    };

    const onStatusUpdate = (data) => {
      setOrderStatus((prev) => [
        ...prev,
        `${data.itemName} is ${data.status}!`,
      ]);
    };

    const onBillCleared = () => {
      resetTable();
    };

    const onOrderFailed = (data) => {
      alert(data.message);
    };

    socket.on("server:updateBill", onUpdateBill);
    socket.on("server:orderStatusUpdate", onOrderStatusUpdate);
    socket.on("server:statusUpdate", onStatusUpdate);
    socket.on("server:billCleared", onBillCleared);
    socket.on("server:orderFailed", onOrderFailed);

    return () => {
      socket.emit("customer:leaveTable", tableId);
      socket.off("server:updateBill", onUpdateBill);
      socket.off("server:orderStatusUpdate", onOrderStatusUpdate);
      socket.off("server:statusUpdate", onStatusUpdate);
      socket.off("server:billCleared", onBillCleared);
      socket.off("server:orderFailed", onOrderFailed);
    };
  }, [tableId]);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    socket.emit("customer:placeOrder", { tableId, items: cart });
    setCart([]);
    sessionStorage.removeItem(`cart_${tableId}`);
    // Fetch updated orders after placing order
    setTimeout(() => fetchTableOrders(), 500);
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cart
      .map((item) =>
        item.id === itemId ? { ...item, qty: item.qty - 1 } : item
      )
      .filter((item) => item.qty > 0);
    setCart(updatedCart);
    sessionStorage.setItem(`cart_${tableId}`, JSON.stringify(updatedCart));
  };

  const addToCart = (itemId) => {
    const updatedCart = cart.map((item) =>
      item.id === itemId ? { ...item, qty: item.qty + 1 } : item
    );
    setCart(updatedCart);
    sessionStorage.setItem(`cart_${tableId}`, JSON.stringify(updatedCart));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-orange-500 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/table/${tableId}/menu`)}
              className="md:hidden text-gray-600 hover:text-gray-800"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                🛒 Your Cart
              </h1>
              <p className="text-gray-600 text-sm md:text-base mt-1">
                Table {tableId}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Cart Items */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Order Items</h3>
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-400 text-lg mb-4">Your cart is empty</p>
              <button
                onClick={() => navigate(`/table/${tableId}/menu`)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center py-3 px-4 border-2 border-gray-100 rounded-lg hover:border-orange-200 transition-colors"
                >
                  <div className="flex-1">
                    <span className="text-gray-800 font-semibold text-base md:text-lg">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full transition-colors"
                    >
                      −
                    </button>
                    <span className="text-lg font-bold text-orange-600 w-8 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => addToCart(item.id)}
                      className="w-8 h-8 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full transition-colors"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {cart.length > 0 && (
            <button
              onClick={handlePlaceOrder}
              className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
            >
              Place Order ({totalItems} items)
            </button>
          )}
        </div>

        {/* Bill */}
        {bill > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">💰</span>
                Your Bill
              </h3>

              {/* Itemized Bill */}
              {orderedItems.length > 0 && (
                <div className="mb-4 space-y-2 bg-white rounded-lg p-4 shadow-sm">
                  <div className="border-b-2 border-gray-300 pb-2 mb-3">
                    <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-gray-600">
                      <div className="col-span-5">Item</div>
                      <div className="col-span-2 text-center">Qty</div>
                      <div className="col-span-2 text-right">Price</div>
                      <div className="col-span-3 text-right">Total</div>
                    </div>
                  </div>
                  {orderedItems.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 text-sm py-2 border-b border-gray-100"
                    >
                      <div className="col-span-5 text-gray-800 font-medium">
                        {item.name}
                      </div>
                      <div className="col-span-2 text-center text-gray-600">
                        ×{item.qty}
                      </div>
                      <div className="col-span-2 text-right text-gray-600">
                        ฿{Math.round(item.price) || "0"}
                      </div>
                      <div className="col-span-3 text-right text-gray-800 font-semibold">
                        ฿{Math.round(item.qty * (item.price || 0))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t-2 border-green-300">
                <span className="text-xl font-semibold text-gray-700">
                  Grand Total:
                </span>
                <p className="text-4xl font-bold text-green-600">
                  ฿{Math.round(bill)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Status */}
        {orderStatus.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-6 h-6 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Order Status
            </h3>
            <ul className="space-y-3">
              {orderStatus.map((status, i) => (
                <li
                  key={i}
                  className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <span className="text-gray-700 flex-1">{status}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNav tableId={tableId} cartCount={totalItems} />
    </div>
  );
}

export default CartPage;
