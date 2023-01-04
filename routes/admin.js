const express = require('express');
const { body, check } = require('express-validator');
const multer = require('multer');
const { mkdir } = require('node:fs/promises');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `./public/images/uploads/${req.user._id}/`;

    mkdir(dir)
      .then(() => {
        cb(null, dir);
      })
      .catch((err) => {
        if (err?.code === 'EEXIST') {
          return cb(null, dir);
        }
        cb(err);
      })
  },
  filename: function (req, file, cb) {
    const [filename, extension] = file.originalname.split('.');
    const newFilename = `${filename}${Date.now()}.${extension}`;
    cb(null, newFilename);
  }
})

const fileFilter = (req, file, cb) => {
  if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
    return cb(null, true);
  }
  
  // cb(new Error('dupa sraka')); // todo: jakis bug multera, jebać
  cb(null, false); // todo: jakis bug multera, jebać
}

const imageValidator = (value, { req }) => {
  if (!req.file) {
    throw new Error('Unhandled file type');
  }
  return 'cool'; // success
}

const upload = multer({ storage: multerStorage, fileFilter });

const adminController = require('../controllers/admin');
const isAuthenticated = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuthenticated, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuthenticated, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',
  upload.single('image'),
  isAuthenticated,
  check('image')
    .custom(imageValidator),
  body('title')
    .isLength({ min: 2 })
    .withMessage('The title must be at least 2 characters long')
    .trim(),
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

router.get(
  '/edit-product/:productId',
  isAuthenticated,
  adminController.getEditProduct
);

router.post('/edit-product',
  upload.single('image'),
  isAuthenticated,
  body('title')
    .isLength({ min: 2 })
    .withMessage('The title must be at least 2 characters long')
    .trim(),
  body('price')
    .trim()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description must not be empty'),
    adminController.postEditProduct);

router.delete(
  '/delete-product',
  isAuthenticated,
  adminController.deleteProduct
);

module.exports = router;
