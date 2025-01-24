const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await Customer.findOne({ email }) || await Driver.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Invalid credentials');
  }

  const token = jwt.sign({ id: user._id, role: user instanceof Driver ? 'driver' : 'customer' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
};
