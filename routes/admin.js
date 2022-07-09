const express = require('express');

const adminController = require('../controllers/admin');
const isAuthenticated = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuthenticated, adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', isAuthenticated, adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product', isAuthenticated, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuthenticated, adminController.getEditProduct);

router.post('/edit-product', isAuthenticated, adminController.postEditProduct);
// router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', isAuthenticated, adminController.postDeleteProduct);

module.exports = router;
