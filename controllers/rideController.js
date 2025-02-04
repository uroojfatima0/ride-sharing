const Ride = require('../models/Ride');
const Driver = require('../models/Driver');

exports.getCustomerRideHistory = async (req, res) => {
  try {
    const rides = await Ride.find({ customerId: req.params.customerId })
      .populate('driver', 'name email')
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching ride history' });
  }
};

exports.startRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    if (req.session.user._id.toString() !== ride.driverId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to start this ride' });
    }

    ride.status = 'in progress';
    await ride.save();
    res.json({ message: 'Ride started successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error starting ride' });
  }
};
