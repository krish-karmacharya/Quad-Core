const mongoose = require('mongoose');
const dns = require('dns');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing in .env');
  }

  if (process.env.DNS_SERVERS) {
    dns.setServers(
      process.env.DNS_SERVERS.split(',')
        .map((server) => server.trim())
        .filter(Boolean)
    );
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDB;
