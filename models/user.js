const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const Order = require('../models/order');

const userSchema = new Schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  pwdResetToken: String,
  pwdResetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: { type: Types.ObjectId, required: true, ref: 'Product' },
        quantity: { type: Number, required: true },
      }
    ]
  }
});

userSchema.methods.addToCart = function(productId) {
  const cartItems = this.cart.items;
  const productInCart = cartItems.find(
    (product) => product.productId.toString() === productId
  );

  if (productInCart) {
    productInCart.quantity = productInCart.quantity + 1;
  } else {
    cartItems.push({
      productId: productId,
      quantity: 1,
    });
  }

  return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
  const newCart = {
    items: this.cart.items.filter((product) => 
        product.productId.toString() !== productId)
  }

  this.cart = newCart;
  return this.save();

  // second approach, using MongoDB funtionality
  // return User.updateOne(
  //   {
  //     _id: this._id
  //   },
  //   {
  //     $pull: {
  //       'cart.items': { productId: productId }
  //     }
  //   }
  // );
}

userSchema.methods.emptyCart = function() {
  this.cart = {
    items: []
  };

  return this.save();
}

userSchema.methods.getOrders = function() {
  return Order
    .find({ userId: this._id });
}

userSchema.methods.createOrder = function() {
  return this
    .populate('cart.items.productId', '_id title price')
    .then((user) => {
      // console.log(JSON.stringify(user, null, 2));
      const itemsData = user.cart.items.map((product) => ({
        product: { 
          productId: product.productId._id,
          title: product.productId.title,
          price: product.productId.price,
        },
        quantity: product.quantity,
      }));

      const order = new Order({
        items: itemsData,
        userId: user._id,
      });

      return order.save();
    })
    .then(() => {
      return this.emptyCart();
    });
}

const User = mongoose.model('User', userSchema);

module.exports = User;
