const Product = require('../models/productModel');

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const query = q ? { name: { $regex: q, $options: 'i' } } : {};

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/products
exports.addProduct = async (req, res) => {
  try {
    const p = new Product(req.body);
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /api/products/seed
exports.seedProducts = async (req, res) => {
  try {
    const products = [
      {
        name: "Wireless Headphones",
        price: 1999,
        description: "Bluetooth 5.0 headphones with noise cancellation.",
        image: "/images/headphones.jpg"
      },
      {
        name: "Smart Watch",
        price: 2999,
        description: "Fitness tracker with heart-rate monitoring.",
        image: "/images/watch.jpg"
      },
      {
        name: "Gaming Mouse",
        price: 1499,
        description: "RGB backlit mouse with high DPI.",
        image: "/images/mouse.jpg"
      },
      {
        name: "Laptop Bag",
        price: 999,
        description: "Water-resistant bag with padded compartments.",
        image: "/images/bag.jpg"
      }
    ];

    await Product.deleteMany();
    await Product.insertMany(products);

    res.json({ message: "Sample products added successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error seeding products", error });
  }
};
