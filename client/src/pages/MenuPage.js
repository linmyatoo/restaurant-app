import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import MobileNav from "../components/MobileNav";

const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

function MenuPage() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tableId) return;

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("customer:joinTable", tableId);

    setLoading(true);
    fetch(`${SERVER_URL}/api/menu`)
      .then((res) => res.json())
      .then((data) => {
        setMenu(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch menu:", err);
        setLoading(false);
      });

    return () => {
      socket.emit("customer:leaveTable", tableId);
    };
  }, [tableId]);

  const addToCart = (item) => {
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
        return [
          ...prevCart,
          { id: item._id, name: item.name, qty: 1, price: item.price },
        ];
      }
    });

    // Store cart in sessionStorage for persistence
    const updatedCart = [...cart];
    const existingItemIndex = updatedCart.findIndex((c) => c.id === item._id);
    if (existingItemIndex >= 0) {
      updatedCart[existingItemIndex].qty++;
    } else {
      updatedCart.push({
        id: item._id,
        name: item.name,
        qty: 1,
        price: item.price,
      });
    }
    sessionStorage.setItem(`cart_${tableId}`, JSON.stringify(updatedCart));
  };

  // Load cart from sessionStorage on mount
  useEffect(() => {
    const savedCart = sessionStorage.getItem(`cart_${tableId}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [tableId]);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-orange-500 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                🍽️ Restaurant Menu
              </h1>
              <p className="text-gray-600 text-sm md:text-base mt-1">
                Table {tableId}
              </p>
            </div>
            {/* Desktop Cart Button */}
            <button
              onClick={() => navigate(`/table/${tableId}/cart`)}
              className="hidden md:flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-full transition-colors relative"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-1">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
          Our Menu
        </h2>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading menu...</p>
            <p className="text-gray-400 text-sm mt-2">
              This may take 30-60 seconds if the server is waking up
            </p>
          </div>
        ) : menu.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-gray-400 text-xl">No menu items available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {menu.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {item.photoUrl && (
                  <div className="relative h-40 md:h-48 bg-gray-200">
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      ฿{Math.round(item.price)}
                    </div>
                  </div>
                )}
                <div className="p-3 md:p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-bold text-gray-800">
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
                      className="ml-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3 md:px-4 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNav tableId={tableId} cartCount={totalItems} />
    </div>
  );
}

export default MenuPage;
