require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const port = process.env.PORT || 5000;

async function startServer() {
  try {
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
