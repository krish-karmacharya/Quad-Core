const User = require('../models/User');
const signToken = require('../utils/token');
const httpError = require('../utils/httpError');

function cleanUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

function getBodyString(body, key) {
  const normalizedKey = Object.keys(body || {}).find((bodyKey) => bodyKey.trim() === key);
  const value = normalizedKey ? body[normalizedKey] : undefined;

  return typeof value === 'string' ? value.trim() : value;
}

function setTokenCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  res.cookie('token', token, cookieOptions);
}

async function register(req, res, next) {
  try {
    const name = getBodyString(req.body, 'name');
    const email = getBodyString(req.body, 'email');
    const password = getBodyString(req.body, 'password');

    if (!name || !email || !password) {
      throw httpError(400, 'Name, email, and password are required');
    }

    if (password.length < 8) {
      throw httpError(400, 'Password must be at least 8 characters');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw httpError(409, 'Email is already registered');
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      user: cleanUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = getBodyString(req.body, 'email');
    const password = getBodyString(req.body, 'password');

    if (!email || !password) {
      throw httpError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw httpError(401, 'Invalid email or password');
    }

    const token = signToken(user);
    setTokenCookie(res, token);

    res.json({
      success: true,
      user: cleanUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ success: true, message: 'Logged out successfully' });
}

async function me(req, res) {
  res.json({
    success: true,
    user: cleanUser(req.user)
  });
}

module.exports = { register, login, logout, me };
