import React, { useEffect, useState } from 'react';
import { socket } from '../services/socket';

const SERVER_URL = 'http://localhost:3001';

function AdminView() {
  const [activeTables, setActiveTables] = useState([]);

  useEffect(() => {
    // 1. Connect and join admin room
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('admin:joinRoom');

    // === THIS IS THE FIX ===
    // 2. Fetch all active tables from the API on page load
    fetch(`${SERVER_URL}/api/orders/active`)
      .then((res) => res.json())
      .then((data) => {
        console.log('AdminView: Fetched active tables on load', data);
        setActiveTables(data); // Populate the state
      })
      .catch((err) => console.error('Error fetching active tables:', err));
    // === END OF FIX ===

    // 3. Listen for REAL-TIME updates
    
    // When a table's bill is updated (new order)
    const onUpdateTable = (data) => {
      console.log('AdminView: Received updateTableBill', data);
      setActiveTables((prevTables) => {
        const tableExists = prevTables.some(t => t.tableId === data.tableId);
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
      console.log('AdminView: Received tableCleared', data);
      setActiveTables((prevTables) =>
        prevTables.filter((table) => table.tableId !== data.tableId)
      );
    };

    socket.on('server:updateTableBill', onUpdateTable);
    socket.on('server:tableCleared', onTableCleared);

    // 4. Cleanup
    return () => {
      socket.emit('admin:leaveRoom');
      socket.off('server:updateTableBill', onUpdateTable);
      socket.off('server:tableCleared', onTableCleared);
    };
  }, []); // The empty array [] means this runs once on page load

  // 5. Function to send the "clear bill" event
  const handleClearBill = (tableId) => {
    if (window.confirm(`Are you sure you want to clear the bill for table ${tableId}?`)) {
      socket.emit('admin:clearBill', { tableId });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard (Active Bills)</h2>
      {activeTables.length === 0 && <p>No active bills.</p>}
      
      {activeTables.map((table) => (
        <div
          key={table.tableId}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px',
            margin: '10px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
          }}
        >
          <div>
            <h3>Table: {table.tableId}</h3>
            <strong>Total: ${table.total.toFixed(2)}</strong>
          </div>
          <button
            onClick={() => handleClearBill(table.tableId)}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
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