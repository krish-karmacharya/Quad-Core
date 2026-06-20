const jwt = require('jsonwebtoken');
const User = require('../models/User');
const httpError = require('../utils/httpError');

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw httpError(401, 'Authentication token missing');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw httpError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : httpError(401, 'Invalid or expired token'));
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(httpError(403, 'Admin access required'));
  }

  next();
}

module.exports = { protect, requireAdmin };
