const mongoose = require('mongoose');
const dns = require('dns');

async function connectDB() {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URL ||
    process.env.MONGODB_URL;

  if (!uri) {
    throw new Error(
      'Missing MongoDB URI in .env. Set MONGO_URI, MONGODB_URI, MONGO_URL, or MONGODB_URL.'
    );
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
