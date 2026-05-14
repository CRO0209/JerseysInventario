/**
 * Jerseys Inventory System - Frontend Entry Point
 * Technology: React (JavaScript) + Vite
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App.jsx';
import { store } from './store/index.js';
import './index.css';

// Render the application into the DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Redux Store Provider */}
    <Provider store={store}>
      {/* Router for navigation */}
      <BrowserRouter>
        <App />
        {/* Toast notifications handler */}
        <Toaster position="top-right" />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
