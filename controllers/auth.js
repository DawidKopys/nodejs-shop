const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMsg: req.flash('error'),
    successMsg: req.flash('success'),
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        // we don't have user with this email
        console.log('WRONG EMAIL');
        req.flash('error', 'Incorrect email or password.');
        return req.session.save(() => {
          res.redirect('/login');
        });
      }

      return bcrypt
        .compare(password, user.password)
        .then((result) => {
          if (!result) {
            // wrong password
            console.log('WRONG PASSWORD');
            req.flash('error', 'Incorrect email or password.');
            return req.session.save(() => {
              res.redirect('/login');
            });
          }

          console.log(user);
          req.session.isLoggedIn = true;
          req.session.userId = user._id;
          req.session.save(() => {
            res.redirect('/');
          });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect('/');
  });
}

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
    errorMsg: req.flash('error'),
  });
}

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    req.flash('error', 'Passwords don\'t match.');
    return req.session.save(() => {
      res.redirect('/signup');
    });
  }
  
  User
    .findOne({ email: email })
    .then((user) => {
      if (user) {
        // this email is already used by another user
        console.log('THIS EMAIL IS ALREADY USED');
        req.flash('error', 'This email is already in use.');
        return req.session.save(() => {
          res.redirect('/signup');
        });
      }

      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const newUser = new User({
            email: email,
            password: hashedPassword,
            cart: {
              items: [],
            },
          });
    
          return newUser.save();
        })
        .then(() => {
          console.log('fdsafsd');
          req.flash('success', 'Sign up successful.');
          req.session.save(() => {
            res.redirect('/login');
          });
        });
    })
    .catch((err) => {
      console.log(err);
    });
}
