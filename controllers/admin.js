const path = require('node:path')
const fs = require('node:fs/promises')
const Product = require('../models/product');
const { validationResult } = require('express-validator');
const deleteFile = require('../util/file')

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    fieldsWithValidationErrors: [],
    product: {
      title: '',
      price: null,
      description: ''
    }
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;
  const { userId } = req.session;

  // Finds the validation errors in this request and wraps
  // ... them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400)
      .render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        errorMsg: errors.array()[0].msg,
        fieldsWithValidationErrors: 
          errors.array().map((error) => error.param),
        product: {
          title,
          price,
          description
        }
      });
  }

  const imagePath = image.path;
  const product = new Product({
    title,
    price,
    description,
    imagePath: `/${imagePath}`,
    userId,
  });

  product
    .save()
    .then(() => {
      return res.redirect('/admin/products');
    })
    .catch(next)
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  const { productId } = req.params;

  if (!editMode) return res.redirect('/');

  Product.findById(productId)
    .then((product) => {
      if (!product) return res.redirect('/');

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        fieldsWithValidationErrors: [],
      });
    })
    .catch(next);

};

exports.postEditProduct = (req, res, next) => {
  const {
    productId,
    title,
    price,
    description,
  } = req.body;
  const image = req.file;

  // Finds the validation errors in this request and wraps
  // ... them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(400)
      .render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: true,
        errorMsg: errors.array()[0].msg,
        fieldsWithValidationErrors:
          errors.array().map((error) => error.param),
        product: {
          title,
          price,
          description,
          _id: productId
        }
      });
  }

  Product
    // .findById(productId) // only creator of the product can edit it
    .findOne({
      _id: productId,
      userId: req.user.id
    })
    .then((product) => {
      let imagePath;
      if (image?.path) {
        imagePath = `/${image?.path}`;
        // remove old file
        const currentImagePath = path.join(process.cwd(), product.imagePath)
        deleteFile(currentImagePath)
      } else {
        imagePath = product.imagePath;
      }
      
      product.title = title;
      product.price = price;
      product.description = description;
      product.imagePath = imagePath;
      return product.save();
    })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(next);
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId:  req.user._id})
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch(next);

};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  Product
    .findOneAndDelete({
      _id: productId,
      userId: req.user.id // only creator of the product can delete it
    })
    .then((product) => {
      const imagePath = path.join(process.cwd(), product.imagePath)
      deleteFile(imagePath)
      res.redirect('/admin/products');
    })
    .catch(next);

};
