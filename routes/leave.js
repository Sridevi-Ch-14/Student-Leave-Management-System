const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const { isAuthenticated,ensureAuthenticated, ensureStudent, ensureFaculty } = require('../middleware/auth');


router.get('/apply', ensureStudent, (req, res) => {
  res.render('apply-leave', { user: req.session });
});

router.post('/apply', ensureStudent, async (req, res) => {
  try {
    await Leave.create({
      student: req.session.userId,
      reason: req.body.reason,
      fromDate: req.body.fromDate,
      toDate: req.body.toDate
    });
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Leave apply error:', err);
    res.status(500).send('Failed to submit leave request');
  }
});


router.post('/delete/:id', isAuthenticated, async (req, res) => {
  try {
    const leaveId = req.params.id;

    const leave = await Leave.findOne({ _id: leaveId, student: req.session.user._id });
    if (!leave) {
      return res.status(403).send('Not allowed to delete this request.');
    }

    await Leave.findByIdAndDelete(leaveId);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error deleting leave:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;


router.get('/view', ensureFaculty, async (req, res) => {
  try {
    const requests = await Leave.find().populate('student');
    res.render('view-requests', { requests, user: req.session });
  } catch (err) {
    console.error('Error fetching leave requests:', err);
    res.status(500).send('Error loading leave requests');
  }
});


router.post('/update/:id', ensureFaculty, async (req, res) => {
  try {
    await Leave.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.redirect('/leave/view');
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).send('Failed to update leave status');
  }
});

module.exports = router;

