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
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/menu/all`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("adminToken");
        navigate("/login");
        return;
      }

      const data = await res.json();
      setMenuItems(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching menu items:", err);
      setError("Failed to load menu items");
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (itemId, currentStatus) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/menu/${itemId}/suspend`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ isSuspended: !currentStatus }),
      });

      if (res.ok) {
        // Update local state
        setMenuItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId
              ? { ...item, isSuspended: !currentStatus }
              : item
          )
        );
      } else {
        alert("Failed to update item status");
      }
    } catch (err) {
      console.error("Error toggling suspend:", err);
      alert("Failed to update item status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600 text-lg">Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
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
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {menuItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 text-lg">No menu items found</p>
            <button
              onClick={() => navigate("/admin/create-menu")}
              className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Create First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className={`rounded-xl p-6 shadow-md hover:shadow-lg transition-all ${
                  item.isSuspended
                    ? "bg-gray-100 border-2 border-red-300"
                    : "bg-white border-2 border-green-300"
                }`}
              >
                {/* Item Image */}
                <div className="relative mb-4">
                  <img
                    src={item.photo || "/placeholder.jpg"}
                    alt={item.name}
                    className={`w-full h-48 object-cover rounded-lg ${
                      item.isSuspended ? "opacity-50 grayscale" : ""
                    }`}
                  />
                  {item.isSuspended && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      SUSPENDED
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ฿{Math.round(item.price)}
                  </p>
                </div>

                {/* Suspend/Unsuspend Button */}
                <button
                  onClick={() =>
                    handleToggleSuspend(item._id, item.isSuspended)
                  }
                  className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 ${
                    item.isSuspended
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                      : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  }`}
                >
                  {item.isSuspended ? (
                    <>
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
                      <span>Unsuspend Item</span>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SuspendMenuPage;
