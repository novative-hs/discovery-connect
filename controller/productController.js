const productModel = require('../models/productModel');

const fetchProducts = (req, res) => {
  const filters = {
    Category: req.query.Category,
    category: req.query.category,
    brand: req.query.brand,
    color: req.query.color,
    priceMin: req.query.priceMin,
    priceMax: req.query.priceMax,
    sort: req.query.sort,
  };

  productModel.getProducts(filters, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Failed to load products' });
    }
    res.json({ products: results });
  });
};

module.exports = { fetchProducts };
