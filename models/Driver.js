const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const driverSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: { type: String, default: 'driver' },
  licensePlate: String,
  model: String,
  color: String,
});

module.exports = mongoose.model('Driver', driverSchema);
