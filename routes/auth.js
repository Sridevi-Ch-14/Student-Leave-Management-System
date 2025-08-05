const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { ensureAuthenticated } = require('../middleware/auth');
const Leave = require('../models/Leave');

router.get('/', (req, res) => {
  res.render('home'); 
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id;
      req.session.role = user.role;
      req.session.user = user;  

      if (user.role === 'student') {
        res.redirect('/dashboard');
      } else if (user.role === 'faculty') {
        res.redirect('/leave/view');
      } else {
        res.redirect('/login'); 
      }

    } else {
      res.send('Invalid username or password');
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Internal server error');
  }
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = new User({ username, password, role });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send('Registration failed');
  }
});

router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    let leaves = [];
    if (user.role === 'student') {
      leaves = await Leave.find({ student: user._id }).sort({ createdAt: -1 });
    }

    res.render('dashboard', { user, leaves }); 
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).send('Unable to load dashboard');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Error logging out.');
    }
    res.redirect('/login');
  });
});

module.exports = router;
