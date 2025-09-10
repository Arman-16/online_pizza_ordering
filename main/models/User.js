const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: {
    type: Number,
    default: 1
  },
  img: String
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  cart: [cartItemSchema], // <-- add cart as an array of cart items
  address: String
});

const User = mongoose.model('User',userSchema);
module.exports = User;
