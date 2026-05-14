/**
 * Jerseys Inventory System - Server Listener
 * Starts the Express application on the configured port.
 */

import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

// Define the port for the backend server
// Default is 5000 if not specified in .env
const PORT = process.env.PORT || 5000;

// Start listening for incoming requests
app.listen(PORT, () => {
  console.log(`🚀 Jerseys Server is running on port ${PORT}`);
});
