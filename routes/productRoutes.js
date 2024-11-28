const express = require('express');
const { fetchProducts } = require('../controller/productController');
const router = express.Router();

router.get('/products', fetchProducts);

module.exports = router;
