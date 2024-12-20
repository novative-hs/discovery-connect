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
  console.log('Received request for product with ID:', req.params.id); // Debugging line
  console.log('Request headers:', req.headers); // Log headers for debugging
  console.log('Request params:', req.params); // Log params
  console.log('Received request for product with ID:', req.params.id);
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  const query = 'SELECT * FROM products WHERE id = ?';

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'An error occurred while fetching the product' });
    }
    if (result.length === 0) {
      console.log('Product not found for ID:', id); // Debugging line
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(result[0]);
  });
};

module.exports = { fetchProducts,  getProductById };
