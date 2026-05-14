/**
 * Jerseys Inventory System - Main App Component
 * Handles routing and global layouts.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import InventoryPage from './pages/InventoryPage';
import LoginPage from './pages/LoginPage';
import SalesPage from './pages/SalesPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import OrdersPage from './pages/OrdersPage';
import OrderSessionsPage from './pages/OrderSessionsPage';
import StoresPage from './pages/StoresPage';


function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales/history" element={<SalesHistoryPage />} />
        <Route path="/orders" element={<OrderSessionsPage />} />
        <Route path="/orders/:sessionId" element={<OrdersPage />} />
        <Route path="/stores" element={<StoresPage />} />
        
        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
