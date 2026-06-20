require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const port = process.env.PORT || 5005;

async function startServer() {
  try {
    // Connect to database asynchronously so that connection failures do not crash the server
    connectDB()
      .then(() => {
        console.log('Database connected successfully.');
      })
      .catch((error) => {
        console.error('Database connection failed. Express will run, but database queries will fail:', error.message);
      });

    app.listen(port, () => {
      console.log(`SmokePlate AI backend running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
  }
}

startServer();
