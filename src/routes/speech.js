// const express = require('express');
// const router = express.Router();
// const deepgramService = require('../services/deepgram');
// const assemblyaiService = require('../services/assemblyai');
// const AppError = require('../utils/errors');
// const logger = require('../utils/logger');

// router.post('/transcribe', async (req, res, next) => {
//   try {
//     const { audioData, service = 'deepgram' } = req.body;

//     if (!audioData) {
//       throw new AppError('Audio data is required', 400);
//     }

//     let transcription;
//     if (service === 'deepgram') {
//       transcription = await deepgramService.transcribe(audioData);
//     } else if (service === 'assemblyai') {
//       transcription = await assemblyaiService.transcribe(audioData);
//     } else {
//       throw new AppError('Invalid speech service specified', 400);
//     }

//     res.json({ text: transcription });
//   } catch (error) {
//     logger.error('Speech transcription error:', error);
//     next(error);
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const deepgramService = require('../services/deepgram');
const assemblyaiService = require('../services/assemblyai');
const AppError = require('../utils/errors');
const logger = require('../utils/logger');

router.post('/transcribe', async (req, res, next) => {
  try {
    const { audioData, service = 'assemblyai' } = req.body;

    if (!audioData) {
      throw new AppError('Audio data is required', 400);
    }

    // Validate audioData format
    if (typeof audioData !== 'string') {
      throw new AppError('Audio data must be a base64 string', 400);
    }

    let transcription;
    try {
    //   if (service === 'deepgram') {
    //     transcription = await deepgramService.transcribe(audioData);
    //   } else 
      if (service === 'assemblyai') {
        transcription = await assemblyaiService.transcribe(audioData);
      } else {
        throw new AppError('Invalid speech service specified', 400);
      }
    } catch (error) {
      logger.error(`Transcription error with ${service}:`, error);
      throw new AppError(`Transcription failed: ${error.message}`, 500);
    }

    res.json({ text: transcription });
  } catch (error) {
    logger.error('Speech transcription error:', error);
    next(error);
  }
});

// Text-to-Speech Route
router.post('/tts', async (req, res, next) => {
    try {
      const { text, outputFile } = req.body;
  
      if (!text) {
        throw new AppError('Text is required for TTS', 400);
      }
  
      // Set a default output file if not provided
      const outputFilePath = outputFile || './public/output.mp3';
  
      // Convert text to speech using AssemblyAI
      try {
        await assemblyaiService.textToSpeech(text, outputFilePath);
      } catch (error) {
        logger.error('Text-to-Speech error:', error);
        throw new AppError(`TTS failed: ${error.message}`, 500);
      }
  
      res.json({ message: 'TTS completed successfully', outputFile: outputFilePath });
    } catch (error) {
      logger.error('Text-to-Speech API error:', error);
      next(error);
    }
  });


module.exports = router;