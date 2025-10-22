const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

/**
 * POST /api/cart/add
 * body: { userId, productId, quantity }
 */
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;
    if (!userId || !productId) return res.status(400).json({ error: 'userId and productId required' });
    const qty = parseInt(quantity) > 0 ? parseInt(quantity) : 1;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < qty) return res.status(400).json({ error: 'Not enough stock' });

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], total: 0 });
    }

    const idx = cart.items.findIndex(i => i.productId === productId);
    if (idx > -1) {
      cart.items[idx].quantity += qty;
    } else {
      cart.items.push({ productId, quantity: qty });
    }

    // compute total by fetching current prices
    let total = 0;
    for (let it of cart.items) {
      const prod = await Product.findById(it.productId);
      total += (prod ? prod.price : 0) * it.quantity;
    }
    cart.total = total;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/cart/:userId
 */
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.json({ items: [], total: 0 });
    // Expand product details
    const itemsDetailed = await Promise.all(cart.items.map(async it => {
      const p = await Product.findById(it.productId);
      return {
        productId: it.productId,
        quantity: it.quantity,
        name: p ? p.name : 'Deleted product',
        price: p ? p.price : 0,
        image: p ? p.image : '/images/no-image.png'
      };
    }));
    res.json({ items: itemsDetailed, total: cart.total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/cart/update
 * body: { userId, productId, quantity }
 */
exports.updateItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId) return res.status(400).json({ error: 'userId and productId required' });
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) return res.status(400).json({ error: 'Quantity must be >= 1' });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const idx = cart.items.findIndex(i => i.productId === productId);
    if (idx === -1) return res.status(404).json({ error: 'Item not in cart' });

    cart.items[idx].quantity = qty;

    // recalc total
    let total = 0;
    for (let it of cart.items) {
      const p = await Product.findById(it.productId);
      total += (p ? p.price : 0) * it.quantity;
    }
    cart.total = total;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/cart/remove
 * body: { userId, productId }
 */
exports.removeItem = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) return res.status(400).json({ error: 'userId and productId required' });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter(i => i.productId !== productId);

    // recalc total
    let total = 0;
    for (let it of cart.items) {
      const p = await Product.findById(it.productId);
      total += (p ? p.price : 0) * it.quantity;
    }
    cart.total = total;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/cart/checkout
 * body: { userId }
 * This simple checkout reduces stock and clears the cart.
 */
exports.checkout = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) return res.status(400).json({ error: 'Cart empty' });

    // verify stock and reduce
    for (let it of cart.items) {
      const prod = await Product.findById(it.productId);
      if (!prod) return res.status(400).json({ error: `Product ${it.productId} not found` });
      if (prod.stock < it.quantity) return res.status(400).json({ error: `Insufficient stock for ${prod.name}` });
    }

    for (let it of cart.items) {
      const prod = await Product.findById(it.productId);
      prod.stock -= it.quantity;
      await prod.save();
    }

    // Here you would create an Order in production. For MVP we clear the cart.
    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.json({ message: 'Checkout successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
