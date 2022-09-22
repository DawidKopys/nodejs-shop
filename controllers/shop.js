const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product
    .find()
    // .populate('userId') // is it needed?
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
      });
    })
    .catch(next);
};

exports.getProduct = (req, res, next) => {
  const { productId } = req.params;

  Product
    .findById(productId)
    .then((product) => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
      });
    })
    .catch(next);
};

exports.getIndex = (req, res, next) => {
  Product
    .find()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    })
    .catch(next);
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      // console.log('populated user:'); //dktodo: debug only
      // console.log(JSON.stringify(user, null, 2));

      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: user.cart.items,
      });
    })
    .catch(next);

};

exports.postCart = (req, res, next) => {
  const { productId } = req.body;

  req.user
    .addToCart(productId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch(next);

};

exports.postCartDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  req.user
    .removeFromCart(productId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch(next);

};

exports.postOrder = (req, res, next) => {
  req.user
    .createOrder()
    .then(() => {
      res.redirect('/orders');
    })
    .catch(next);

};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then((orders) => {
      // add virtuals (total)
      const ordersData = orders.map(
        (order) => order.toObject({ virtuals: true }));

      // console.log(JSON.stringify(ordersData, null, 2));
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: ordersData,
      });
    })
    .catch(next);

};
