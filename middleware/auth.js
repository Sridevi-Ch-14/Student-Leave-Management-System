// middleware/auth.js
function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    res.locals.user = req.session.user;
    return next();
  }
  res.redirect('/login');
}

function ensureStudent(req, res, next) {
  if (req.session.userId && req.session.role === 'student') {
    return next();
  }
  res.status(403).send('Access denied. Students only.');
}

function ensureFaculty(req, res, next) {
  if (req.session.userId && req.session.role === 'faculty') {
    return next();
  }
  res.status(403).send('Access denied. Faculty only.');
}

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

module.exports = {
  ensureAuthenticated,
  ensureStudent,
  ensureFaculty,
  isAuthenticated,
};
