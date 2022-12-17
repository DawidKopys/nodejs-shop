const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  userId: {
    type: Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;