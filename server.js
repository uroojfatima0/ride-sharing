const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();

// Connect to MongoDB
const connect = mongoose.connect("mongodb+srv://urooj12186:_arooj123@cluster0.g4mjn.mongodb.net/rideSharing");

connect.then (() => {
  console.log("Database Connected Successfully");
}) 
.catch(() => {
  console.log("Database cannot be connected");
})

// User Schema and Model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String, // 'customer' or 'driver'
  vehicleDetails: String, // Only for drivers
});
const User = mongoose.model('User', userSchema);

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

// Middleware for sessions
app.use(
  session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
  })
);

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set views directory
app.set('views', path.join(__dirname, 'views'));

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// Customer registration route
app.get('/register/customer', (req, res) => {
  res.render('registerCustomer');
});

app.post('/customers/register', async (req, res) => {
  const { name, email, password, phone, paymentMethod } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    phone,
    role: 'customer',
  });
  await newUser.save();
  res.redirect('/login');
});

// Driver registration route
app.get('/register/driver', (req, res) => {
  res.render('registerDriver');
});

const Driver = require('./models/Driver'); // Adjust the path as necessary

app.post('/drivers/register', async (req, res) => {
  const { name, email, password, phone, licensePlate, model, color } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newDriver = new Driver({
      name,
      email,
      password: hashedPassword,
      phone,
      licensePlate,
      model,
      color,
    });

    await newDriver.save();
    res.redirect('/login');
  } catch (error) {
    console.error('Error saving driver:', error.message);
    res.status(500).send('Error saving driver');
  }
});

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // First, check if the user is a customer (in the User collection)
    let user = await User.findOne({ email });

    // If not found in User, check if it's a driver (in the Driver collection)
    if (!user) {
      user = await Driver.findOne({ email });
      // If the user is found in Driver, set role to 'driver'
      if (user) {
        user.role = 'driver'; // Set role to 'driver' if found in the Driver collection
      }
    }

    // If no user is found in both collections, return invalid credentials
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }

    // Now compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send('Invalid credentials');
    }

    // Store the user in session
    req.session.user = user;

    // Redirect based on the user's role
    if (user.role === 'customer') {
      res.redirect('/dashboard/customer');
    } else if (user.role === 'driver') {
      res.redirect('/dashboard/driver');
    } else {
      res.status(400).send('Invalid user role');
    }
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).send('Error during login');
  }
});

// Dashboard routes
app.get('/dashboard/customer', (req, res) => {
  const user = req.session.user;
  if (user && user.role === 'customer') {
    res.render('customerDashboard', { customerName: user.name, customerId: user._id });
  } else {
    res.redirect('/login');
  }
});

app.get('/dashboard/driver', (req, res) => {
  const user = req.session.user;
  if (user && user.role === 'driver') {
    res.render('driverDashboard', {
      driverName: user.name,
      driverId: user._id,
      vehicleDetails: user.vehicleDetails,
    });
  } else {
    res.redirect('/login');
  }
});

// Start the server
const PORT = process.env.PORT || 1100;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
