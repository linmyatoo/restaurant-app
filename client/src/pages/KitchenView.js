import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../services/socket";

const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

function KitchenView() {
  const { kitchenId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Connect and join room
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("kitchen:joinRoom", kitchenId);
    console.log(`KitchenView: Attempting to join room kitchen-${kitchenId}`);

    // === THIS IS THE FIX ===
    // 2. Fetch all pending orders for this kitchen on load
    setLoading(true);
    fetch(`${SERVER_URL}/api/orders/kitchen/${kitchenId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(
          `KitchenView: Fetched ${data.length} pending orders.`,
          data
        );
        setOrders(data); // Set the initial state
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching kitchen orders:", err);
        setLoading(false);
      });
    // === END OF FIX ===

    // 3. Listen for NEW orders
    const onNewOrder = (newOrder) => {
      console.log("KitchenView: Received new order!", newOrder);

      // This logic merges new items if the order card already exists
      setOrders((prevOrders) => {
        const existingOrder = prevOrders.find(
          (o) => o.orderId === newOrder.orderId
        );

        if (existingOrder) {
          // Add new items to an existing order card
          return prevOrders.map((o) =>
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

    socket.on("server:newOrder", onNewOrder);

    // 4. Cleanup
    return () => {
      socket.emit("kitchen:leaveRoom", kitchenId);
      socket.off("server:newOrder", onNewOrder);
    };
  }, [kitchenId]);

  const handleMarkReady = (orderId, itemId) => {
    console.log(`KitchenView: Marking item ${itemId} as ready.`);
    socket.emit("kitchen:updateStatus", {
      orderId,
      itemId,
      status: "ready",
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800">
            👨‍🍳 Kitchen {kitchenId} Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage and prepare orders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading kitchen orders...</p>
            <p className="text-gray-400 text-sm mt-2">
              This may take 30-60 seconds if the server is waking up
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">😴</div>
            <p className="text-gray-400 text-xl">No pending orders</p>
            <p className="text-gray-400 text-sm mt-2">
              New orders will appear here automatically
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-orange-200 hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <span className="bg-white text-orange-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">
                      {order.tableId}
                    </span>
                    Table {order.tableId}
                  </h3>
                  <p className="text-orange-100 text-sm mt-1">
                    {order.items.length} item(s) to prepare
                  </p>
                </div>

                {/* Order Items */}
                <div className="p-6 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item._id}
                      className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="bg-orange-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
                              {item.qty}
                            </span>
                            <span className="font-bold text-gray-800 text-lg">
                              {item.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleMarkReady(order.orderId, item._id)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Mark as Ready</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default KitchenView;
