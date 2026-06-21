const User = require('../models/User');
const { formatResponse } = require('../utils/responseFormatter');

// GET /api/admin/users
const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 });

    return res.status(200).json(
      formatResponse(true, 'Users retrieved successfully', users)
    );
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/users/:id/role
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be either "admin" or "user"'
      });
    }

    // Prevent self-lockout
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Action denied. You cannot modify your own role.'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    return res.status(200).json(
      formatResponse(true, `User role updated to ${role} successfully`, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt
      })
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting oneself
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Action denied. You cannot delete your own account.'
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json(
      formatResponse(true, 'User deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'user'
    });

    return res.status(201).json(
      formatResponse(true, 'User created successfully', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminUsers,
  updateUserRole,
  deleteUser,
  createUser
};
