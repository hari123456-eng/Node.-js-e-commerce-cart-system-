// run_product_controller.js
// Usage: node run_product_controller.js <seed|get|add>
// Requires MONGO_URI in .env or environment.

require('dotenv').config();
const connectDB = require('./config/db');
const ProductController = require('./controllers/productController');
const mongoose = require('mongoose');

function makeRes() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(payload) { console.log('RESPONSE', this.statusCode || 200, JSON.stringify(payload, null, 2)); return Promise.resolve(payload); },
    send(payload) { console.log('SEND', payload); return Promise.resolve(payload); }
  };
}

async function run(action) {
  // ensure MONGO_URI is set (connectDB will error if missing)
  await connectDB();

  try {
    if (action === 'seed') {
      console.log('Running seedProducts...');
      await ProductController.seedProducts({}, makeRes());
    } else if (action === 'get') {
      console.log('Running getProducts (no query)...');
      const req = { query: { page: 1, limit: 10 } };
      await ProductController.getProducts(req, makeRes());
    } else if (action === 'add') {
      console.log('Running addProduct (sample body)...');
      const req = { body: { name: 'Test Item', price: 1234, description: 'Added by harness' } };
      await ProductController.addProduct(req, makeRes());
    } else {
      console.log('Unknown action. Use: seed | get | add');
    }
  } catch (err) {
    console.error('Error running controller:', err);
  } finally {
    // close DB connection and exit
    await mongoose.connection.close();
    console.log('Done. DB connection closed.');
    process.exit(0);
  }
}

// read action from argv: node run_product_controller.js seed
const action = process.argv[2];
run(action);
