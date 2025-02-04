exports.ensureAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
};

exports.ensureRole = (role) => {
  return (req, res, next) => {
    if (req.session.user.role === role) {
      return next();
    }
    res.status(403).send('Forbidden');
  };
};
