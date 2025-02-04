const express = require('express');
const { register } = require('../controllers/driverController');
const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const router = express.Router();

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

// // ✅ 1. View Available Ride Requests
// router.get('/api/drivers/:driverId/available-rides', async (req, res) => {
//     const { driverId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(driverId)) {
//         return res.status(400).json({ error: 'Invalid driver ID' });
//     }

//     try {
//         const availableRides = await Ride.find({ status: 'pending' });
//         res.status(200).json({ availableRides });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });

// // ✅ 2. Accept Ride Request
// router.post('/api/rides/:rideId/accept', async (req, res) => {
//     const { rideId } = req.params;
//     const driverId = req.session?.user?._id;

//     if (!mongoose.Types.ObjectId.isValid(rideId)) {
//         return res.status(400).json({ error: 'Invalid ride ID' });
//     }

//     try {
//         const ride = await Ride.findById(rideId);

//         if (!ride) {
//             return res.status(404).json({ error: 'Ride not found' });
//         }

//         if (ride.status !== 'pending') {
//             return res.status(400).json({ error: 'Ride has already been accepted or canceled' });
//         }

//         ride.status = 'accepted';
//         ride.driverId = driverId;
//         await ride.save();

//         res.status(200).json({ message: 'Ride accepted successfully', ride });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });

// // ✅ 3. Start Ride
// router.post('/api/rides/:rideId/start', async (req, res) => {
//     const { rideId } = req.params;
//     const driverId = req.session?.user?._id;

//     if (!mongoose.Types.ObjectId.isValid(rideId)) {
//         return res.status(400).json({ error: 'Invalid ride ID' });
//     }

//     try {
//         const ride = await Ride.findById(rideId);

//         if (!ride) {
//             return res.status(404).json({ error: 'Ride not found' });
//         }

//         if (ride.status !== 'accepted') {
//             return res.status(400).json({ error: 'Ride must be accepted before starting' });
//         }

//         ride.status = 'in progress';
//         await ride.save();

//         res.status(200).json({ message: 'Ride started successfully', ride });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });

// // ✅ 4. Complete Ride
// router.post('/api/rides/:rideId/complete', async (req, res) => {
//     const { rideId } = req.params;
//     const driverId = req.session?.user?._id;

//     if (!mongoose.Types.ObjectId.isValid(rideId)) {
//         return res.status(400).json({ error: 'Invalid ride ID' });
//     }

//     try {
//         const ride = await Ride.findById(rideId);

//         if (!ride) {
//             return res.status(404).json({ error: 'Ride not found' });
//         }

//         if (ride.status !== 'in progress') {
//             return res.status(400).json({ error: 'Ride must be in progress to be completed' });
//         }

//         ride.status = 'completed';
//         await ride.save();

//         res.status(200).json({ message: 'Ride completed successfully', ride });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });

// // ✅ 5. Earnings Summary
// router.get('/api/drivers/:driverId/earnings', async (req, res) => {
//     const { driverId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(driverId)) {
//         return res.status(400).json({ error: 'Invalid driver ID' });
//     }

//     try {
//         const rides = await Ride.find({ driverId, status: 'completed' });
//         const earnings = rides.reduce((total, ride) => total + ride.fare, 0);

//         res.status(200).json({
//             totalEarnings: earnings,
//             rideCount: rides.length,
//             earningsBreakdown: rides.map(ride => ({ fare: ride.fare, rideId: ride._id })),
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });

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
    const rideId = req.params.rideId;

    try {
        const ride = await Ride.findByIdAndUpdate(rideId, { status: 'completed' }, { new: true });
        if (!ride) return res.status(404).send('Ride not found');

        // Update the driver's earnings when a ride is completed
        await Driver.findByIdAndUpdate(ride.driverId, { $inc: { earnings: 10 } });  // Add $10 for this example

        res.redirect('/dashboard/driver');  // Redirect back to the driver dashboard
    } catch (err) {
        console.error(err);
        res.status(500).send('Error completing ride');
    }
});

// Route to view earnings
router.get('/earnings', async (req, res) => {
    const driverId = req.session.driverId;  // Assuming driver is logged in and you have their session

    try {
        const driver = await Driver.findById(driverId);
        if (!driver) return res.status(404).send('Driver not found');

        res.render('earnings', { earnings: driver.earnings });  // Assuming you're using a templating engine like EJS
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching earnings');
    }
});

module.exports = router;
