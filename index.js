const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();
const connectDB = require('./src/config/database');
// const connectDB = require('./config/database');
const limiter = require('./src/utils/rateLimit');
const logger = require('./src/utils/logger');
const AppError = require('./src/utils/errors');
const validators = require('./src/utils/validators');
const GroqService = require('./src/services/groq');
const { Server } = require('socket.io');
const path = require('path');

// Import routes
const speechRoutes = require('./src/routes/speech');
const chatRoutes = require('./src/routes/chat');
const healthRoutes = require('./src/routes/health');
const userRoutes = require('./src/routes/userRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const corsOptions = {
  origin: 'https://healthbuddy-x0enff.flutterflow.app', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

app.use(cors(corsOptions));
// app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(limiter);

// Routes
app.use('/api/speech', speechRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/', userRoutes);

// Define axios client - put this BEFORE socket.io connection handler
const apiClient = axios.create({
  baseURL: 'http://localhost:3001', // Use your server's port
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});
// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server);
// io.on('connection', (socket) => {
//   console.log('a user connected', socket.id);
// });
// const io = new Server(server, {
//   cors: {
//     origin: '*', // Adjust this to match your frontend's origin
//     methods: ['GET', 'POST'],
//   },
// });

// // Create a WebSocket server
// const wss = new WebSocket.Server({ server });

// Create a single instance of GroqService
const groqService = new GroqService();

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // // Handle receiving a message from the client
  socket.on('send_message', async (data) => {
    try {
      // const message = data;
      const message = typeof data === 'string' ? data : data.message;
      console.log('Send message:', data);
      if (!data) {
        throw new Error('Message data is empty');
      }

      // Ensure message is properly formatted
      if (!message) {
        return socket.emit('receive_message', {
          success: false,
          error: 'Message is required',
        });
      }

      // Use GroqService to get AI response
      // const response = await groqService.generateHealthResponse(message);

      //using api route insted to direct use of groq service
      // Call your API route instead of using Groq service directly
      console.log('Making API request with message:', message); // Debug log

      // Make API request
      const response = await apiClient.post('/api/chat/message', { message });
      
      // const response = await axios.post('/api/chat/message', message);
      console.log('API Response:', response.data); // Debug log
// Extract the content from the response and emit a simplified structure
      // const assistantMessage = response.data.response[0]?.content || '';
      // Send API response back to the client
      // socket.emit('receive_message', response.data);
      // Send response back to the client
      // socket.emit('receive_message', {
      //   success: true,
      //   messages: [
      //     {
      //       role: "user",
      //       content: message,
      //       timestamp: new Date().toISOString()
      //     },
      //     {
      //       role: "assistant",
      //       content: response
      //     }
      //   ],
      //   timestamp: new Date().toISOString(),
      // });
      socket.emit('receive_message', response.data);
    } catch (error) {
      logger.error('WebSocket error:', error.message);
      // Detailed error logging
      console.error('Detailed error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      // More specific error handling
      let errorMessage = 'Failed to process message';

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
        // Emit error message back to the client
        socket.emit('receive_message', {
          success: false,
          error: 'Failed to process message',
        });
      }
    }
  });

  // creating new socket.io code for message handeling purposes
  // Handle receiving a message from the client
  // socket.on('send_message', async (data) => {
  //   try {

  //     const { message, userId } = data;
  //     console.log('Body:', data);
  //     console.log('Send message:', message);
  //     console.log('userID', userId);

  //     if (!message || !userId) {
  //       return socket.emit('receive_message', {
  //         success: false,
  //         error: 'Message and userId are required',
  //       });
  //     }

  //     // Save user message
  //     await Message.create({
  //       userId,
  //       content: message,
  //       sender: 'user'
  //     });

  //     // Get AI response
  //     const response = await groqService.generateHealthResponse(message);

  //     // Save bot response
  //     await Message.create({
  //       userId,
  //       content: response,
  //       sender: 'bot'
  //     });

  //     // Send response back to the client
  //     socket.emit('receive_message', {
  //       success: true,
  //       response,
  //       timestamp: new Date().toISOString(),
  //     });
  //   } catch (error) {
  //     logger.error('WebSocket error:', error.message);
  //     socket.emit('receive_message', {
  //       success: false,
  //       error: 'Failed to process message',
  //     });
  //   }
  // });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

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

//testing js frontend for socket.io
app.use(express.static(path.resolve("./src/public")));

app.get('/', (req, res) => {
  // res.send('Welcome to the homepage!');
  return res.sendFile(__dirname + "/src/public/test.html");
});
// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  logger.info(`Server running on port http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});