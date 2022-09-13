const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login',
  body('email')
    .isEmail()
    .withMessage('Please, enter a valid email')
    .normalizeEmail({ gmail_remove_subaddress: false }),
  body(
      'password',
      'Please enter a password with only numbers and text and at least 3 characters'
    )
      .isLength({ min: 3 })
      .isAlphanumeric(),
  authController.postLogin);

router.get('/signup', authController.getSignup);

router.post('/signup',
  body('email')
    .isEmail()
    .withMessage('Please, enter a valid email')
    .custom((value) => {
      return User
        .findOne({ email: value})
        .then((user) => {
          if (user) {
            return Promise.reject('This email is already in use')
          }
        })
    })
    .normalizeEmail({ gmail_remove_subaddress: false }),
  body(
    'password',
    'Please enter a password with only numbers and text and at least 3 characters'
  )
    .isLength({ min: 3 })
    .isAlphanumeric(),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/pwd-reset', authController.getPwdReset);

router.post('/pwd-reset', authController.postPwdReset);

router.get('/pwd-change/:pwdResetToken', authController.getPwdChange);

router.post('/pwd-change', authController.postPwdChange);

module.exports = router;
