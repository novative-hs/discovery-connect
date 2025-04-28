const productModel = require('../models/productModel');
const mysqlConnection = require('../config/db');

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


// Get a Single Product by ID
const getProductById = (req, res) => {
 
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  const query = 'SELECT * FROM products WHERE id = ?';

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      
      return res.status(500).json({ error: 'An error occurred while fetching the product' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(result[0]);
  });
};

module.exports = { fetchProducts,  getProductById };
