const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

const productController = require('../controllers/productController');

// public
router.get('/statistics', authenticate, isAdmin, productController.getProductStatistics);
router.get('/', productController.listProducts);
router.get('/:id', productController.getProductById);

// admin
router.post('/', authenticate, isAdmin, productController.createProduct);
router.put('/:id', authenticate, isAdmin, productController.updateProduct);
router.delete('/:id', authenticate, isAdmin, productController.deleteProduct);

module.exports = router;

