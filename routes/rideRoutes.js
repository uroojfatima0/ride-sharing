const express = require('express');
const { requestRide } = require('../controllers/rideController');
const router = express.Router();

router.post('/request', requestRide);

module.exports = router;
