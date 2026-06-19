require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

async function seedAdmin() {
  await connectDB();

  const name = process.env.ADMIN_NAME || 'SmokeWatch Admin';
  const email = process.env.ADMIN_EMAIL || 'admin@smokewatch.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';

  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    existingAdmin.name = name;
    existingAdmin.role = 'admin';
    if (password) existingAdmin.password = password;
    await existingAdmin.save();
    console.log(`Admin updated: ${email}`);
  } else {
    await User.create({ name, email, password, role: 'admin' });
    console.log(`Admin created: ${email}`);
  }

  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
