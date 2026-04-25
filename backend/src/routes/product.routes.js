const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
// Demo mode: product CRUD doesn't require JWT.

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Demo mode: allow product CRUD without JWT.
// If you want security later, re-add authenticate/isAdmin.
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;

