const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

// All cart routes require authentication; user id is taken from the JWT
router.post('/add', auth, cartController.addToCart);
router.get('/', auth, cartController.getCart); // GET /api/cart?userId can be omitted; uses token
router.put('/update', auth, cartController.updateItem);
router.delete('/remove', auth, cartController.removeItem);
router.post('/checkout', auth, cartController.checkout);

module.exports = router;

