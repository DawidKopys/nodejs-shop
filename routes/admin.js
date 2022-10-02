const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');

const multerStorage = multer.diskStorage({
  destination: './public/images/uploads',
  filename: function (req, file, cb) {
    const [filename, extension] = file.originalname.split('.');
    const newFilename = `${filename}${Date.now()}.${extension}`;
    cb(null, newFilename);
  }
})

const upload = multer({ storage: multerStorage });

const adminController = require('../controllers/admin');
const isAuthenticated = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuthenticated, adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', isAuthenticated, adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product',
  upload.single('image'),
  isAuthenticated,
  body('title')
    .isLength({ min: 2 })
    .withMessage('The title must be at least 2 characters long')
    .trim(),
  // body('imageUrl')
  //   .trim()
  //   .isURL()
  //   .withMessage('Image URL must be a valid URL'),
  body('price')
    .trim()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description must not be empty'),
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuthenticated, adminController.getEditProduct);

router.post('/edit-product',
  isAuthenticated,
  body('title')
    .isLength({ min: 2 })
    .withMessage('The title must be at least 2 characters long')
    .trim(),
  body('imageUrl')
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('price')
    .trim()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description must not be empty'),
    adminController.postEditProduct);
// router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', isAuthenticated, adminController.postDeleteProduct);

module.exports = router;
