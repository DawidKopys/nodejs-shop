const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.SENDGRID_SECRET_API_KEY,
  }
}));

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
          const emailMsg = {
            to: email,
            from: 'dawid.kopys95@gmail.com',
            subject: 'signup succeeded',
            html: '<h1>You successfully signed up!</h1>'
          };

          return transporter.sendMail(emailMsg);
        })
        // .catch() {} // jesli wyslanie maila sie nie powiedzie to
        // user nie bedzie mogl dokonczyc rejestracji, wypadaloby cos z tym zrobic
        // ale w sumie my tu nie mamy signup confirmation wiec wyjebane
        .then((info) => {
          console.log(info);
          req.flash('success', 'Sign up successful.');
          req.session.save(() => {
            res.redirect('/login');
          });
        })
    })
    .catch((err) => {
      console.log(err);
    });
}

exports.getPwdReset = (req, res, next) => {
  res.render('auth/pwd-reset', {
    pageTitle: 'Reset Password',
    path: '/pwd-reset',
    errorMsg: req.flash('error'),
    successMsg: req.flash('success'),
  });
}

exports.postPwdReset = (req, res, next) => {
  const { email } = req.body;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/pwd-reset');
    }

    const token = buffer.toString('hex');
    
    User
    .findOne({ email: email }) // find user record
      .then((user) => {
        if (!user) {
          req.flash('error', 'No account with that email found')
          return req.session.save(() => {
            res.redirect('/pwd-reset');
          });
        }

        user.pwdResetToken = token;
        user.pwdResetTokenExpiration = Date.now() + 3600000;

        return user
          .save()
          .then((user) => {
            const emailMsg = {
              to: email,
              from: 'dawid.kopys95@gmail.com',
              subject: 'password reset',
              html: `
                <h1>You requested password reset.</h1>
                <p>Click this <a href="http://localhost:3000/pwd-change/${user.pwdResetToken}">link</a> to set a new password.</p>  
              `
            };
  
            return transporter.sendMail(emailMsg);
          })
          .then(() => {
            req.flash('success', 'Email sent, check your inbox')
            return req.session.save(() => {
              res.redirect('/pwd-reset');
            });
          })
      })
      .catch((err) => console.log(err));
  })
}

exports.getPwdChange = (req, res, next) => {
  const { pwdResetToken } = req.params;

  console.log(pwdResetToken);

  User
    .findOne({
      pwdResetToken: pwdResetToken,
      pwdResetTokenExpiration: { $gt: Date.now() }
    })
    .then((user) => {
      res.render('auth/pwd-change', {
        pageTitle: 'Change Password',
        path: '/pwd-change',
        errorMsg: req.flash('error'),
        successMsg: req.flash('success'),
        userId: user._id,
        pwdResetToken: pwdResetToken,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.redirect('/');
    });
  }

exports.postPwdChange = (req, res, next) => {
  const {
    userId,
    pwdResetToken,
    password,
    confirmPassword
  } = req.body;

  if (password !== confirmPassword) {
    req.flash('error', 'Passwords don\'t match.');
    return req.session.save(() => {
      res.redirect(`/pwd-change/${pwdResetToken}`);
    });
  }

  User
    .findOne({
      _id: userId,
      pwdResetToken: pwdResetToken,
      pwdResetTokenExpiration: { $gt: Date.now() }
    })
    .then((user) => {
      // encrypt password
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          return [user, hashedPassword];
        });
    })
    .then(([user, hashedPassword]) => {
      // save password
      user.password = hashedPassword;
      user.pwdResetToken = undefined;
      user.pwdResetTokenExpiration = undefined;
      return user.save();
    })
    .then(() => {
      // redirect and show flash success message
      req.flash('success', 'You password has been changed.');
      return req.session.save(() => {
        res.redirect('/login');
      })
    })
    .catch((err) => console.log(err));
  }
