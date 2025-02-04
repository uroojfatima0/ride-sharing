const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const userRoutes = require('./routes/userRoutes');
const { ensureAuthenticated } = require('./middlewares/auth');
const driverRoutes = require('./routes/driverRoutes');  

const app = express();

// Connect to MongoDB
const connect = mongoose.connect("mongodb+srv://urooj12186:_arooj123@cluster0.g4mjn.mongodb.net/rideSharing");

connect.then (() => {
  console.log("Database Connected Successfully");
}) 
.catch(() => {
  console.log("Database cannot be connected");
})

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'yourSecretKey', resave: false, saveUninitialized: true }));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// Setup session (if using sessions)
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Routes
app.use(authRoutes);
app.use(userRoutes);
app.use('/customerDashboard', userRoutes); 
app.use(driverRoutes);
app.use('/driverDashboard', driverRoutes); 
app.use('/api/rides', userRoutes);
app.use('/rides/:id/accept', driverRoutes);
app.use(rideRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
