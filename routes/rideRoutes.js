const express = require('express');
const router = express.Router();
const { getCustomerRideHistory, startRide } = require('../controllers/rideController');

router.get('/api/customers/:customerId/rideHistory', getCustomerRideHistory);
router.post('/api/rides/:rideId/start', startRide);

module.exports = router;
