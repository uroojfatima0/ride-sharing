const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String, // 'customer' or 'driver'
  vehicleDetails: String, // Only for drivers
});

module.exports = mongoose.model('User', userSchema);
