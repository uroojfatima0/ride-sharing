const User = require('../models/User');
const Driver = require('../models/Driver');
const bcrypt = require('bcryptjs');

exports.registerCustomer = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, phone, role: 'customer' });
  await newUser.save();
  res.redirect('/login');
};

exports.registerDriver = async (req, res) => {
  const { name, email, password, phone, licensePlate, model, color } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newDriver = new Driver({ name, email, password: hashedPassword, phone, licensePlate, model, color });
    await newDriver.save();
    res.redirect('/login');
  } catch (error) {
    console.error('Error saving driver:', error.message);
    res.status(500).send('Error saving driver');
  }
};
