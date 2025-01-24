const Ride = require('../models/Ride');

exports.requestRide = async (req, res) => {
  try {
    const ride = new Ride(req.body);
    await ride.save();
    res.json({ message: 'Ride requested successfully', ride });
  } catch (err) {
    res.status(500).send('Error requesting ride');
  }
};
