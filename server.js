const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Connect DB
connectDB();

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);

// Serve frontend files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/products.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'products.html')));
app.get('/cart.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'cart.html')));
app.get('/checkout.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'checkout.html')));

// Start Server (use PORT env or default to 5000)
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});

// Handle server errors (for example: EADDRINUSE)
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`\n✖ Port ${PORT} is already in use.`);
    console.error('  -> Either stop the process using that port or start this app on a different port:');
    console.error(`     Set the PORT environment variable, e.g. on Windows PowerShell:`);
    console.error(`       $env:PORT=${PORT + 1}; npm start`);
    console.error('\n  To find and kill the process using the port (PowerShell):');
    console.error('       netstat -a -n -o | Select-String ":' + PORT + '"');
    console.error('       # then use: taskkill /PID <pid> /F');
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});
