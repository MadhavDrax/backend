const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./src/config/database');
// const connectDB = require('./config/database');
const limiter = require('./src/utils/rateLimit');
const logger = require('./src/utils/logger');
const AppError = require('./src/utils/errors');
const validators = require('./src/utils/validators');

// Import routes
const speechRoutes = require('./src/routes/speech');
const chatRoutes = require('./src/routes/chat');
const healthRoutes = require('./src/routes/health');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(limiter);

// Routes
app.use('/api/speech', speechRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/health', healthRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT,async  () => {
   await mongoose.connect(process.env.MONGODB_URI)
  logger.info(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// const mongoose = require("mongoose");

// const connect = async () => {
    
//     await mongoose.connect(`mongodb+srv://Madhav:62N3iaw79uuTBaDT@healthbuddy.nl9xi.mongodb.net/?retryWrites=true&w=majority&appName=healthbuddy`)
//     console.log("Connected to MongoDB");
// }
// connect()


