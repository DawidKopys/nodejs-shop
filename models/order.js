const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const orderProductSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  productId: {
    type: Types.ObjectId,
    required: true,
  },
});

const orderSchema = new Schema({
  items: [
    {
      product: orderProductSchema,
      quantity: { type: Number, required: true },
    }
  ],
  userId: { 
    type: Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, { timestamps: true });

orderSchema.virtual('total').get(function() {
  return this.items.reduce(
    (acc, item) => acc += item.product.price * item.quantity, 0);
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
