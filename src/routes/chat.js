// const express = require('express');
// const router = express.Router();
// const Session = require('../models/Session');
// const groqService = require('../services/groq');
// const AppError = require('../utils/errors');
// const logger = require('../utils/logger');


// router.post('/message', async (req, res, next) => {
//   try {
//     const { message, sessionId } = req.body;
//     console.log(req.body)
//     // if (!message || !sessionId) {
//     //   throw new AppError('Message and sessionId are required', 400);
//     // }
//     if(!message){
//         throw new AppError('Message and sessionId are required', 400);
//     }
//     const response = await groqService.generateHealthResponse(message);

//     await Session.findOneAndUpdate(
//       { sessionId },
//       {
//         $push: {
//           chatHistory: {
//             message,
//             response
//           }
//         }
//       },
//       { upsert: true }
//     );

//     res.json({ response });
//   } catch (error) {
//     logger.error('Chat error:', error);
//     next(error);
//   }
// =================================================================
//  second attempt
// =================================================================
// try {
//     const { message } = req.body;
    
//     if (!message) {
//       throw new AppError('Message is required', 400);
//     }

//     const response = await groqService.generateHealthResponse(message);
//     res.json({ response });
//   } catch (error) {
//     logger.error('Chat error:', error);
//     next(error);
//   }
// });
// });

// router.get('/history/:sessionId', async (req, res, next) => {
//   try {
//     const session = await Session.findOne({ sessionId: req.params.sessionId });
//     if (!session) {
//       throw new AppError('Session not found', 404);
//     }
//     res.json(session.chatHistory);
//   } catch (error) {
//     logger.error('Chat history error:', error);
//     next(error);
//   }
// });

//================================================================
// third attempt
//=================================================================

const express = require('express');
const router = express.Router();
const GroqService = require('../services/groq');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

const groqService = new GroqService();

router.post('/message', async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      throw new AppError('Message is required', 400);
    }

    const response = await groqService.generateHealthResponse(message);
    
    res.json({ 
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Chat error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    });

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        retryAfter: error.statusCode === 503 ? 30 : undefined
      });
    }

    next(error);
  }
});
router.get('/history/:sessionId', async (req, res, next) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      throw new AppError('Session not found', 404);
    }
    res.json(session.chatHistory);
  } catch (error) {
    logger.error('Chat history error:', error);
    next(error);
  }
});

module.exports = router;