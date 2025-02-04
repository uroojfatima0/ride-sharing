const express = require('express');
const { register } = require('../controllers/driverController');
const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const router = express.Router();
const Driver = require('../models/Driver');  // Adjust the path based on your project structure


// Driver Registration Route
router.post('/register', register);

// Driver Dashboard Route
router.get('/dashboard/driver', async (req, res) => {
    const user = req.session.user;

    if (user && user.role === 'driver') {
        try {
            const availableRides = await Ride.find({ status: 'pending' });
            const ongoingRides = await Ride.find({
                driverId: user._id,
                status: { $in: ['accepted', 'in progress'] },
            });

            res.render('driverDashboard', {
                driverName: user.name,
                driverId: user._id,
                vehicleDetails: user.vehicleDetails,
                availableRides,
                ongoingRides,
            });
        } catch (error) {
            console.error('Error fetching rides:', error);
            res.status(500).send('Something went wrong');
        }
    } else {
        res.redirect('/login');
    }
});

// Route for Accepting Ride
router.post('/rides/:rideId/accept', async (req, res) => {
    const rideId = req.params.rideId;
    const driverId = req.body.driverId;  // Driver's ID passed via hidden input field in form

    try {
        const ride = await Ride.findByIdAndUpdate(rideId, { status: 'accepted', driverId: driverId }, { new: true });
        if (!ride) return res.status(404).send('Ride not found');

        res.redirect('/dashboard/driver');  // Redirect back to the driver dashboard
    } catch (err) {
        console.error(err);
        res.status(500).send('Error accepting ride');
    }
});

// Route to start a ride
router.post('/rides/:rideId/start', async (req, res) => {
    const rideId = req.params.rideId;

    try {
        const ride = await Ride.findByIdAndUpdate(rideId, { status: 'in progress' }, { new: true });
        if (!ride) return res.status(404).send('Ride not found');

        res.redirect('/dashboard/driver');  // Redirect back to the driver dashboard
    } catch (err) {
        console.error(err);
        res.status(500).send('Error starting ride');
    }
});

// Route to complete a ride
router.post('/rides/:rideId/complete', async (req, res) => {
    const { rideId } = req.params;

    try {
        // Find and update the ride status to 'completed' atomically
        const ride = await Ride.findOneAndUpdate(
            { _id: rideId, status: 'in progress' },
            { status: 'completed' },
            { new: true }
        );

        if (!ride) {
            return res.status(404).send('Ride not found or already completed');
        }

        // Increment driver's earnings
        await Driver.findByIdAndUpdate(ride.driverId, { $inc: { earnings: 10 } });

        res.redirect('/dashboard/driver');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error completing ride');
    }
});

// Route to view earnings
router.get('/earnings', async (req, res) => {
    const user = req.session.user;
    console.log('Session User:', user);  // Check if user object is populated correctly

    if (!user || user.role !== 'driver') {
        return res.status(401).send('Driver not logged in');
    }

    try {
        // Fetch the driver's data
        const driver = await Driver.findById(user._id);
        if (!driver) return res.status(404).send('Driver not found');

        // Fetch all rides completed by the driver (you can modify this logic to suit your database schema)
        const rides = await Ride.find({ driverId: driver._id, status: 'completed' });

        // Calculate total earnings and total rides
        const totalRides = rides.length;
        const totalEarnings = rides.length * 10;

        res.render('earnings', {
            totalRides,
            totalEarnings,
            rides,
        });
    } catch (err) {
        console.error('Error fetching earnings:', err);
        res.status(500).send('Error fetching earnings');
    }
});

module.exports = router;
