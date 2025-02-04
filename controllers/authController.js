const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Driver = require('../models/Driver');
const express = require('express');
const session = require('express-session');
const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,  // Make sure SESSION_SECRET is defined in your environment variables
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },  // Adjust settings as needed
}));


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email }) || await Driver.findOne({ email });

    if (!user) {
      return res.status(401).send('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('Invalid credentials');
    }

    req.session.user = user;
    if (user.role === 'customer') {
      return res.redirect('/dashboard/customer');
    } else if (user.role === 'driver') {
      return res.redirect('/dashboard/driver');
    } else {
      return res.status(400).send('Invalid user role');
    }
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).send('Error during login');
  }
};
