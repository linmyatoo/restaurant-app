import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

function SuspendMenuPage() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllMenuItems();
  }, []);

  const fetchAllMenuItems = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/menu/all`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401 || res.status === 403) {
        // Unauthorized, redirect to login
        localStorage.removeItem("adminToken");
        navigate("/login");
        return;
      }

      const data = await res.json();
      setMenuItems(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching menu items:", err);
      setLoading(false);
    }
  };

  const handleSuspend = async (itemId) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/menu/${itemId}/suspend`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        // Update the local state
        setMenuItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, suspended: true } : item
          )
        );
      }
    } catch (err) {
      console.error("Error suspending item:", err);
    }
  };

  const handleUnsuspend = async (itemId) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/menu/${itemId}/unsuspend`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        // Update the local state
        setMenuItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, suspended: false } : item
          )
        );
      }
    } catch (err) {
      console.error("Error unsuspending item:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                🚫 Suspend Menu Items
              </h1>
              <p className="text-gray-600 mt-1">
                Manage item availability for customers
              </p>
            </div>
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back to Admin</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-600 text-lg">Loading menu items...</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-400 text-lg">No menu items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className={`rounded-xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl ${
                  item.suspended
                    ? "bg-gradient-to-br from-gray-100 to-gray-200 opacity-75"
                    : "bg-gradient-to-br from-white to-gray-50"
                }`}
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500 overflow-hidden">
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      className={`w-full h-full object-cover ${
                        item.suspended ? "grayscale" : ""
                      }`}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-white text-6xl">🍽️</span>
                    </div>
                  )}
                  {item.suspended && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
                        SUSPENDED
                      </div>
                    </div>
                  )}
                  {/* Kitchen Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-bold shadow-md">
                      Kitchen {item.kitchen_id}
                    </span>
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-2xl font-bold text-orange-600">
                      ฿{Math.round(item.price)}
                    </p>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        item.suspended
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {item.suspended ? "Suspended" : "Active"}
                    </div>
                  </div>

                  {/* Action Button */}
                  {item.suspended ? (
                    <button
                      onClick={() => handleUnsuspend(item._id)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Activate Item</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSuspend(item._id)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
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
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                      <span>Suspend Item</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SuspendMenuPage;
