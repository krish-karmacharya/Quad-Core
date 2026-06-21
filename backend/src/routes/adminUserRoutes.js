const express = require('express');
const {
  getAdminUsers,
  updateUserRole,
  deleteUser,
  createUser
} = require('../controllers/adminUserController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Apply authMiddleware and adminMiddleware to all routes below
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getAdminUsers);
router.post('/', createUser);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;
