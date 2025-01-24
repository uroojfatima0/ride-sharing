const Customer = require('../models/Customer');

exports.register = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error registering customer');
  }
};
