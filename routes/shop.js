const express = require('express');

const shopController = require('../controllers/shop');
const isAuthenticated = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuthenticated, shopController.getCart);

router.post('/cart', isAuthenticated, shopController.postCart);

router.post('/cart-delete-item', isAuthenticated, shopController.postCartDeleteProduct);

router.get('/orders', isAuthenticated, shopController.getOrders);

router.get('/orders/:orderId', isAuthenticated, shopController.getInvoice)

router.get('/checkout', isAuthenticated, shopController.getCheckout);

router.post(
  '/create-checkout-session',
  isAuthenticated,
  shopController.postCreateCheckoutSession
);
  
router.get(
  '/checkout/success',
  isAuthenticated,
  shopController.getCheckoutSuccess
);

router.get(
  '/checkout/cancel',
  isAuthenticated,
  shopController.getCheckout // temp: nie chce nam się tworzyć nowego route'a
);

module.exports = router;
