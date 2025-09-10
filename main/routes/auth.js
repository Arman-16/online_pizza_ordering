const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists. Please login.",
        redirect: "/login/signup.html"
      });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(200).json({
      message: "Signup successful!",
      username: newUser.username,   // send username here
      redirect: "/index.html"
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Error during signup." });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "User not found. Please signup first.",
        redirect: "/signup/login.html"
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect password.",
        redirect: "/signup/login.html"
      });
    }

    res.status(200).json({
      status: "success",
      message: "Login successful!",
      username: user.username,
      redirect: "/index.html"
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      status: "fail",
      message: "Server error during login.",
      redirect: "/signup/login.html"
    });
  }
});


// Add item to cart
router.post('/add-to-cart', async (req, res) => {
  const { username, item } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if item already exists in cart
    const existingItem = user.cart.find(cartItem => cartItem.name === item.name);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push(item);
    }

    await user.save();

    res.status(200).json({ message: "Item added to cart" });

  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// get-cart-item
router.post('/get-cart', async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ cart: user.cart || [] });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// update-cart-quantity
router.post('/update-cart-quantity', async (req, res) => {
  const { username, name, quantity } = req.body;
  const user = await User.findOne({ username });

  if (!user) return res.status(404).send("User not found");

  const item = user.cart.find(item => item.name === name);
  if (item) item.quantity = quantity;

  await user.save();
  res.send("Quantity updated");
});

// remove-from-cart
router.post('/remove-from-cart', async (req, res) => {
  const { username, name } = req.body;
  await User.updateOne({ username }, { $pull: { cart: { name } } });
  res.send("Item removed");
});

// clear-cart
router.post('/clear-cart', async (req, res) => {
  const { username } = req.body;
  await User.updateOne({ username }, { $set: { cart: [] } });
  res.send("Cart cleared");
});

// save user address
router.post('/confirm-btn', async (req, res) => {
  const { username, address } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.address = address;
    await user.save();

    res.status(200).json({ message: "Address confirmed and saved." });

  } catch (err) {
    console.error("Address save error:", err);
    res.status(500).json({ message: "Failed to save address" });
  }
});

router.post('/get-user-address', async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ address: user.address || "" });
  } catch (err) {
    console.error("Error getting address:", err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;