import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";

const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

function AdminView() {
  const navigate = useNavigate();
  const [activeTables, setActiveTables] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  useEffect(() => {
    // 1. Connect and join admin room
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("admin:joinRoom");

    // === THIS IS THE FIX ===
    // 2. Fetch all active tables from the API on page load
    fetch(`${SERVER_URL}/api/orders/active`, {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          // Unauthorized, redirect to login
          handleLogout();
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          console.log("AdminView: Fetched active tables on load", data);
          setActiveTables(data); // Populate the state
        }
      })
      .catch((err) => console.error("Error fetching active tables:", err));
    // === END OF FIX ===

    // 3. Listen for REAL-TIME updates

    // When a table's bill is updated (new order)
    const onUpdateTable = (data) => {
      console.log("AdminView: Received updateTableBill", data);
      setActiveTables((prevTables) => {
        const tableExists = prevTables.some((t) => t.tableId === data.tableId);
        if (tableExists) {
          return prevTables.map((table) =>
            table.tableId === data.tableId ? data : table
          );
        } else {
          return [...prevTables, data];
        }
      });
    };

    // When a table's bill is cleared
    const onTableCleared = (data) => {
      console.log("AdminView: Received tableCleared", data);
      setActiveTables((prevTables) =>
        prevTables.filter((table) => table.tableId !== data.tableId)
      );
    };

    socket.on("server:updateTableBill", onUpdateTable);
    socket.on("server:tableCleared", onTableCleared);

    // 4. Cleanup
    return () => {
      socket.emit("admin:leaveRoom");
      socket.off("server:updateTableBill", onUpdateTable);
      socket.off("server:tableCleared", onTableCleared);
    };
  }, []); // The empty array [] means this runs once on page load

  // 5. Function to send the "clear bill" event
  const handleClearBill = (tableId) => {
    if (
      window.confirm(
        `Are you sure you want to clear the bill for table ${tableId}?`
      )
    ) {
      socket.emit("admin:clearBill", { tableId });
    }
  };

  // 6. Function to print receipt
  const handlePrintReceipt = (table) => {
    const printWindow = window.open('', '_blank');
    
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - Table ${table.tableId}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            @page {
              size: 80mm auto;
              margin: 0;
            }
            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Courier New', monospace;
              padding: 10px;
              font-size: 14px;
              line-height: 1.5;
            }
            .receipt-container {
              width: 100%;
              max-width: 80mm;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }
            .restaurant-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .date {
              font-size: 11px;
              margin-top: 5px;
            }
            .table-info {
              font-size: 16px;
              margin: 10px 0;
              font-weight: bold;
              text-align: center;
            }
            .items {
              margin: 10px 0;
            }
            .item {
              margin: 6px 0;
              font-size: 13px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .item-name {
              flex: 1;
            }
            .item-price {
              text-align: right;
              white-space: nowrap;
              margin-left: 10px;
              font-weight: bold;
            }
            .item-detail {
              font-size: 11px;
              color: #444;
              margin-left: 5px;
            }
            .separator {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            .total-section {
              border-top: 2px solid #000;
              padding-top: 10px;
              margin-top: 12px;
            }
            .total {
              display: flex;
              justify-content: space-between;
              font-size: 18px;
              font-weight: bold;
              margin: 8px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              border-top: 2px dashed #000;
              padding-top: 10px;
              font-size: 12px;
            }
            @media print {
              html, body {
                width: 80mm;
                height: auto;
              }
              .receipt-container {
                width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="restaurant-name">RESTAURANT</div>
              <div class="date">${new Date().toLocaleString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
              })}</div>
            </div>
            
            <div class="table-info">TABLE ${table.tableId}</div>
            
            <div class="separator"></div>
            
            <div class="items">
              ${table.orders?.map(order => 
                order.items?.map(item => `
                  <div class="item">
                    <div class="item-row">
                      <span class="item-name">${item.name}</span>
                      <span class="item-price">฿${Math.round(item.price * item.qty)}</span>
                    </div>
                    <div class="item-detail">
                      ${item.qty} x ฿${Math.round(item.price)}
                    </div>
                  </div>
                `).join('')
              ).join('')}
            </div>
            
            <div class="total-section">
              <div class="total">
                <span>TOTAL:</span>
                <span>฿${Math.round(table.total)}</span>
              </div>
            </div>
            
            <div class="footer">
              <div>Thank you!</div>
              <div>Please come again</div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
      printWindow.print();
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                👨‍💼 Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage menu items and orders</p>
            </div>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Create Menu Item Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-4 md:p-8 mb-8 border-2 border-indigo-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-3 md:p-4 mr-3 md:mr-4">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-white"
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
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                  Menu Management
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Add new items to your restaurant menu
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
              <button
                onClick={() => navigate("/admin/create-menu")}
                className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-4 md:px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Create Menu Item</span>
              </button>
              <button
                onClick={() => navigate("/admin/suspend-menu")}
                className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-4 md:px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
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
            </div>
          </div>
        </div>

        {/* Active Bills Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-green-100 text-green-600 rounded-full p-2 mr-3">
              💵
            </span>
            Active Bills
          </h3>
          {activeTables.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💤</div>
              <p className="text-gray-400 text-lg">No active bills</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTables.map((table) => (
                <div
                  key={table.tableId}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-md hover:shadow-lg transition-shadow"
                >
                  {/* Table Header */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b-2 border-green-200">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800 flex items-center">
                        <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">
                          {table.tableId}
                        </span>
                        Table {table.tableId}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {table.orders?.length || 0} order(s)
                      </p>
                    </div>
                    <div className="bg-green-500 text-white rounded-full p-2 cursor-pointer hover:bg-green-600 transition-colors"
                         onClick={() => handlePrintReceipt(table)}
                         title="Print Receipt">
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Order Items Details */}
                  <div className="mb-4 max-h-64 overflow-y-auto">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">
                      Order Items:
                    </h5>
                    <div className="space-y-2">
                      {table.orders?.map((order) => (
                        <div key={order._id} className="space-y-1">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-white rounded-lg p-3 text-sm"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2 flex-1">
                                  <span className="bg-green-500 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                    {item.qty}
                                  </span>
                                  <span className="text-gray-800 font-medium">
                                    {item.name}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-600 text-xs">
                                    ฿{Math.round(item.price)} × {item.qty}
                                  </span>
                                  <span className="text-green-600 font-bold">
                                    ฿{Math.round(item.price * item.qty)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total and Clear Button */}
                  <div className="pt-4 border-t-2 border-green-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-semibold text-gray-700">
                        Total:
                      </span>
                      <p className="text-3xl font-bold text-green-600">
                        ฿{Math.round(table.total)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleClearBill(table.tableId)}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
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
                      <span>Mark as Paid & Clear</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminView;
