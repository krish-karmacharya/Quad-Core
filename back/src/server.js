require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const validateEnv = require('./utils/validateEnv');

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    validateEnv();
    await connectDB();

    app.listen(port, () => {
      console.log(`SmokeWatch backend running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
