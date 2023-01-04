const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING;

const app = express();

const csrfProtection = csrf();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

store.on('error', function(error) {
  console.log('MongoDBStore error:');
  console.log(error);
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public/', express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store,
}));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use((req, res, next) => {
  if (!req.session.isLoggedIn) {
    return next();
  }

  User.findById(req.session.userId)
    .then((user) => {
      if (!user) return next();

      req.user = user;
      next();
    })
    .catch(next);
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // dktodo: ogarnij status code i zwroc odp rzecz?
  console.log('custom express error handler');
  console.error(error);
  console.log('redirecting to error page');
  res.redirect('/');
})

console.log('Connecting to MongoDB...');
mongoose
.connect(MONGODB_URI)
.then(() => {
    console.log('Connected!');
    app.listen(3000, () =>
      console.log('Server is up and running on port 3000!')
    );
  })
  .catch((err) => {
    console.log(err);
  });
