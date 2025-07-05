// middlewares/role.js

const permit = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
};

const permitAll = (req, res, next) => {
  next();
};

// ✅ Correct export
module.exports = {
  permit,
  permitAll
};
