import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CustomerView from './pages/CustomerView';
import KitchenView from './pages/KitchenView';
import AdminView from './pages/AdminView'; // <-- 1. IMPORT

function Home() {
  return (
    <nav style={{ padding: '20px' }}>
      <h2>Restaurant App</h2>
      <Link to="/table/5" style={{ marginRight: '10px' }}>
        Go to Table 5
      </Link>
      <Link to="/kitchen/1" style={{ marginRight: '10px' }}>
        Go to Kitchen 1
      </Link>
      <Link to="/kitchen/2" style={{ marginRight: '10px' }}>
        Go to Kitchen 2
      </Link>
      <Link to="/admin">Go to Admin</Link> {/* <-- 2. ADD LINK */}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Home />
      <Routes>
        <Route path="/table/:tableId" element={<CustomerView />} />
        <Route path="/kitchen/:kitchenId" element={<KitchenView />} />
        <Route path="/admin" element={<AdminView />} /> {/* <-- 3. ADD ROUTE */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;