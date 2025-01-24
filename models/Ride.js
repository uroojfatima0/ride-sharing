const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  pickupLocation: String,
  dropOffLocation: String,
  status: { type: String, default: 'pending' }, // pending, assigned, in_progress, completed, canceled
  fare: Number,
});

module.exports = mongoose.model('Ride', rideSchema);
