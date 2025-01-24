const Driver = require('../models/Driver');

exports.register = async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error registering driver');
  }
};
