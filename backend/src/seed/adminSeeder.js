require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function seedAdmin() {
  try {
    // Connect to database
    await connectDB();
    console.log('Database connected for admin seeding.');

    const adminEmail = 'admin@smokeplate.ai';
    const adminPassword = 'Admin@12345';
    const adminName = 'SmokePlate Admin';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin account already exists for: ${adminEmail}`);
    } else {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log(`Admin account seeded successfully: ${adminEmail}`);
    }

    // Disconnect mongoose
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
