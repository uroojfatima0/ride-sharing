// models/Ride.js
const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  pickupLocation: {
    type: String,
    required: true
  },
  dropOffLocation: {
    type: String,
    required: true
  },
  ridePreferences: {
    carType: String,
    accessibility: Boolean
  },
  status: {
    type: String,
    enum: ['pending', 'driver assigned', 'in progress', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ride', rideSchema);
