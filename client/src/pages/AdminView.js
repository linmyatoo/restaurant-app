import React, { useEffect, useState } from "react";
import { socket } from "../services/socket";

const SERVER_URL = "http://localhost:3001";

function AdminView() {
  const [activeTables, setActiveTables] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [kitchenId, setKitchenId] = useState(1);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // 1. Connect and join admin room
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("admin:joinRoom");

    // === THIS IS THE FIX ===
    // 2. Fetch all active tables from the API on page load
    fetch(`${SERVER_URL}/api/orders/active`)
      .then((res) => res.json())
      .then((data) => {
        console.log("AdminView: Fetched active tables on load", data);
        setActiveTables(data); // Populate the state
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

  // --- New: handle file input change ---
  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  };

  // --- New: Upload image (read as dataURL and send to server) ---
  const uploadImageToServer = async (file) => {
    if (!file) return null;
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result; // data:image/..;base64,...
          const res = await fetch(`${SERVER_URL}/api/upload`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: dataUrl }),
          });
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

  // --- New: handle submit to create menu item ---
  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!name || !price) {
      setMessage("Please enter name and price");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          photoUrl,
          kitchen_id: parseInt(kitchenId, 10),
        }),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.message || "Failed to create menu item");

      setName("");
      setPrice("");
      setKitchenId(1);
      setFile(null);
      setMessage("Menu item created");
      // Optionally refresh menu or notify user; here we just show message
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard (Active Bills)</h2>
      {/* --- New: Form to create menu items with image upload --- */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #eee",
          background: "#fafafa",
        }}
      >
        <h3>Create Menu Item</h3>
        <form onSubmit={handleCreateMenuItem}>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block" }}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block" }}>Price</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block" }}>Kitchen</label>
            <select
              value={kitchenId}
              onChange={(e) => setKitchenId(e.target.value)}
            >
              <option value={1}>Kitchen 1</option>
              <option value={2}>Kitchen 2</option>
            </select>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block" }}>Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          <div>
            <button
              type="submit"
              disabled={uploading}
              style={{ marginRight: "8px" }}
            >
              {uploading ? "Uploading..." : "Create"}
            </button>
            <span style={{ marginLeft: "8px" }}>{message}</span>
          </div>
        </form>
      </div>

      {activeTables.length === 0 && <p>No active bills.</p>}

      {activeTables.map((table) => (
        <div
          key={table.tableId}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px",
            margin: "10px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
          }}
        >
          <div>
            <h3>Table: {table.tableId}</h3>
            <strong>Total: ${table.total.toFixed(2)}</strong>
          </div>
          <button
            onClick={() => handleClearBill(table.tableId)}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Mark as Paid & Clear
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminView;
