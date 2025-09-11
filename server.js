require('dotenv').config()                              //11-09-2025 ADDED//

const express = require('express');
const helmet = require('helmet');                      //11-09-2025 ADDED//
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

// Helmet with CSP for security (inline scripts blocked)       //11-09-2025 ADDED//
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      },
    },
  })
);     

const PORT = process.env.PORT || 5000;              //11-09-2025 ADDED//
const MONGO_URI = process.env.MONGO_URI;           //11-09-2025 ADDED//

// MongoDB Connection
mongoose.connect(MONGO_URI)                      //11-09-2025 ADDED//
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// Routes
const authRoutes = require('./main/routes/auth');
app.use('/api/auth', authRoutes);


// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, "public")));


// Serve login.html for the homepage route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));

});

// Serve login2(singup.html).html for the homepage route
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));

});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
