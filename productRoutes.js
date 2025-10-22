const express = require('express');
const router = express.Router();
const { getProducts, addProduct, seedProducts } = require('../controllers/productController');

router.get('/', getProducts);
router.post('/', addProduct);
router.post('/seed', seedProducts); // for seeding sample products

module.exports = router;
