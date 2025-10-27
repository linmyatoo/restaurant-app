import React, { useState } from "react";
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

function CreateMenuPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [kitchenId, setKitchenId] = useState(1);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  };

  // Upload image (read as dataURL and send to server)
  const uploadImageToServer = async (file) => {
    if (!file) return null;
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result; // data:image/..;base64,...
          const res = await fetch(`${SERVER_URL}/api/upload`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ image: dataUrl }),
          });
          if (res.status === 401 || res.status === 403) {
            handleLogout();
            reject(new Error("Unauthorized"));
            return;
          }
          const json = await res.json();
          if (!res.ok) throw new Error(json.message || "Upload failed");
          resolve(json.url);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Handle submit to create menu item
  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!name || !price) {
      setMessage("Please enter name and price");
      setMessageType("error");
      return;
    }

    try {
      setUploading(true);
      let photoUrl = "";

      if (file) {
        photoUrl = await uploadImageToServer(file);
      }

      // Create menu item
      const res = await fetch(`${SERVER_URL}/api/menu`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          photoUrl,
          kitchen_id: parseInt(kitchenId, 10),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      const json = await res.json();
      if (!res.ok)
        throw new Error(json.message || "Failed to create menu item");

      // Reset form on success
      setName("");
      setPrice("");
      setKitchenId(1);
      setFile(null);
      setMessage("Menu item created successfully!");
      setMessageType("success");

      // Clear file input
      const fileInput = document.getElementById("file-input");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Error creating menu item");
      setMessageType("error");
    } finally {
      setUploading(false);
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
                🍽️ Create Menu Item
              </h1>
              <p className="text-gray-600 mt-1">
                Add new items to your restaurant menu
              </p>
            </div>
            <div className="flex space-x-3">
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
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Create Menu Item Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-3 mr-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Add New Menu Item
              </h2>
              <p className="text-gray-600 text-sm">Fill in the details below</p>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg border-2 ${
                messageType === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <div className="flex items-center">
                {messageType === "success" ? (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleCreateMenuItem} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="e.g., Margherita Pizza"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (฿) *
                </label>
                <input
                  type="number"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kitchen *
                </label>
                <select
                  value={kitchenId}
                  onChange={(e) => setKitchenId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                >
                  <option value={1}>Kitchen 1</option>
                  <option value={2}>Kitchen 2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image (Optional)
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>
            </div>

            {/* Image Preview */}
            {file && (
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Image Preview:
                </p>
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-full max-w-xs h-48 object-cover rounded-lg shadow-md"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating Menu Item...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create Menu Item
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateMenuPage;
