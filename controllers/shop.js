const path = require('node:path')
const fsPromises = require('node:fs/promises')
const fs = require('node:fs')
const Product = require('../models/product');
const Order = require('../models/order');
const { pipeline } = require('node:stream');

const PDFDocument = require('pdfkit');
const { objectToValues } = require('sqlstring');

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

exports.getInvoice = (req, res, next) => {
  const { orderId } = req.params;

  Order
    .findOne({
      _id: orderId,
      userId: req.user.id
    })
    .then((order) => {
      if (!order) {
        next(new Error('not found'))
        return
      }

      const invoiceFilename = `invoice-${order._id.toString()}.pdf`;
      const invoicePath = path.join(process.cwd(), 'invoices', invoiceFilename);

      // generating pdf invoice dynamically:
      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath)); // write to PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${invoiceFilename}"`
      );
      pdfDoc.pipe(res);                               // write to HTTP response

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      }).moveDown(1);

      let totalPrice = 0;
      for (item of order.items) {
        const { product, quantity } = item;
        totalPrice += product.price * quantity;
        pdfDoc.fontSize(14).text(`${product.title} - ${quantity} x $${product.price}`);
      }
      pdfDoc.moveDown(1)
      pdfDoc.text(`Total: $${totalPrice}`);
      pdfDoc.end();

      // reading placeholder invoice below:
      // sol1 - res.sendFile
      // res.sendFile(invoicePath, {
      //   headers: {
      //     'Content-Disposition': `attachment; filename="${invoiceFilename}"`
      //   }
      // });

      // sol2 - without res.sendFile()
      // return fsPromises
      //   .readFile(invoicePath)
      //   .then((fileData) => {
      //     res.setHeader('Content-Type', 'application/pdf');
      //     res.setHeader(
      //       'Content-Disposition',
      //       `attachment; filename="${invoiceFilename}"`
      //     );
      //     res.send(fileData);
      //   });

      // sol3, with streams
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader(
      //   'Content-Disposition',
      //   `attachment; filename="${invoiceFilename}"`
      // );
      // pipeline(
      //   fs.createReadStream(invoicePath),
      //   res,
      //   (err) => {
      //     if (err) {
      //       throw err
      //     }
      //     console.log('finished writing');
      //   }
      // )
      // ...and without stream.pipeline:
      // fs.createReadStream(invoicePath)
      //   .pipe(res)
    })
    .catch(next);
}
