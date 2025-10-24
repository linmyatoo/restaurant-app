import React, { useEffect, useState } from 'react';
import { socket } from '../services/socket';

const SERVER_URL = 'http://localhost:3001';

function AdminView() {
  // This state will hold the list of tables and their totals
  // e.g., [ { tableId: '5', total: 55.00 }, { tableId: '6', total: 20.00 } ]
  const [activeTables, setActiveTables] = useState([]);

  useEffect(() => {
    // 1. Connect and join admin room
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('admin:joinRoom');

    // 2. Fetch all active tables on initial load
    fetch(`${SERVER_URL}/api/orders/active`)
      .then((res) => res.json())
      .then((data) => {
        setActiveTables(data);
      })
      .catch((err) => console.error('Error fetching active tables:', err));

    // 3. Listen for REAL-TIME updates
    
    // When a table's bill is updated (new order)
    const onUpdateTable = (data) => {
      // data = { tableId: '5', total: 75.00 }
      setActiveTables((prevTables) => {
        const tableExists = prevTables.some(t => t.tableId === data.tableId);
        if (tableExists) {
          // Map and update the total for the existing table
          return prevTables.map((table) =>
            table.tableId === data.tableId ? data : table
          );
        } else {
          // Add the new table to the list
          return [...prevTables, data];
        }
      });
    };
    
    // When a table's bill is cleared
    const onTableCleared = (data) => {
      // data = { tableId: '5' }
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
  }, []);

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