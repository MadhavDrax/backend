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
    // for debug api response
    // console.log('API Response being sent:', {
    //   success: true,
    //   response: response,
    //   messages: [
    //     {
    //       role: "user",
    //       content: message,
    //       timestamp: new Date().toISOString()
    //     },
    //     {
    //       role: "assistant",
    //       content: response,
    //       timestamp: new Date().toISOString()
    //     }
    //   ]
    // });
    res.json({ 
      success: true,
      // add this just to resolve the error in socket (for nodejs to acces message)
      response,
      // response,
      messages: [
        {
          role: "user",
          content: message,
          timestamp: new Date().toISOString()
        },
        {
          role: "bot",
          content: response,
          timestamp: new Date().toISOString()
        }
      ],
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
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({ userId })
      .sort({ timestamp: 1 })
      .lean();
    
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    logger.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history'
    });
  }
});

module.exports = router;