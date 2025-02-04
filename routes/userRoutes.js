const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { registerCustomer, registerDriver } = require('../controllers/userController');
const Ride = require('../models/Ride');
const Driver = require('../models/Driver');

// Customer Registration Route
router.get('/register/customer', (req, res) => {
    res.render('registerCustomer');
});

router.post('/customers/register', registerCustomer);

// Driver Registration Route
router.get('/register/driver', (req, res) => {
    res.render('registerDriver');
});

router.post('/drivers/register', registerDriver);

// Customer Dashboard Route
router.get('/dashboard/customer', async (req, res) => {
    const user = req.session.user;

    if (user && user.role === 'customer') {
        try {
            // Fetch ongoing rides
            const ongoingRide = await Ride.findOne({
                customerId: user._id,
                status: { $in: ['accepted', 'in progress', 'pending'] },
            });

            // Fetch completed rides
            const completedRides = await Ride.find({
                customerId: user._id,
                status: 'completed',
            }).sort({ createdAt: -1 }); // Sort completed rides by the most recent

            let driver = null;
            if (ongoingRide && ongoingRide.status !== 'completed') {
                driver = await Driver.findById(ongoingRide.driverId);
            }

            res.render('customerDashboard', {
                customerName: user.name,
                customerId: user._id,
                ongoingRide,
                driver,
                completedRides,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Something went wrong');
        }
    } else {
        res.redirect('/login');
    }
});


// ✅ 1. Request a Ride
router.post('/api/rides/request', async (req, res) => {
    const customerId = req.session?.user?._id; // Get customer ID from session

    if (!customerId) {
        return res.status(400).json({ error: 'User is not logged in' });
    }

    try {
        const { pickupLocation, dropOffLocation, ridePreferences } = req.body;

        if (!pickupLocation || !dropOffLocation) {
            return res.status(400).json({ error: 'Pickup and drop-off locations are required' });
        }

        const newRide = new Ride({
            customerId,
            pickupLocation,
            dropOffLocation,
            ridePreferences,
            status: 'pending',
        });

        await newRide.save();
        res.status(201).json({ message: 'Ride requested successfully', ride: newRide });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// ✅ 2. Track Ride Status
router.get('/api/rides/:rideId/status', async (req, res) => {
    const { rideId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(rideId)) {
        return res.status(400).json({ error: 'Invalid ride ID' });
    }

    try {
        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        res.status(200).json({ status: ride.status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// ✅ 3. Cancel Ride
router.post('/api/rides/:rideId/cancel', async (req, res) => {
    const { rideId } = req.params;
    const customerId = req.session?.user?._id;

    if (!mongoose.Types.ObjectId.isValid(rideId)) {
        return res.status(400).json({ error: 'Invalid ride ID' });
    }

    try {
        const ride = await Ride.findOne({ _id: rideId, customerId });

        if (!ride) {
            return res.status(404).json({ error: 'Ride not found or not authorized' });
        }

        if (ride.status !== 'pending') {
            return res.status(400).json({ error: 'Ride cannot be canceled after a driver is assigned' });
        }

        ride.status = 'canceled';
        await ride.save();

        res.status(200).json({ message: 'Ride canceled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// ✅ 4. Ride History
router.get('/api/customers/:customerId/ride-history', async (req, res) => {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
    }

    try {
        const rides = await Ride.find({ customerId }).sort({ createdAt: -1 });
        res.status(200).json({ rides });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;
