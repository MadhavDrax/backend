// const { Deepgram } = require('@deepgram/sdk');

// class DeepgramService {
//   constructor() {
//     this.deepgram = new Deepgram({
//       apiKey: process.env.DEEPGRAM_API_KEY
//     });
//   }

//   async transcribe(audioData) {
//     try {
//       // Convert base64 to Buffer if audioData is base64
//       const audioBuffer = Buffer.from(audioData, 'base64');

//       // Create a source object with the buffer and mimetype
//       const source = {
//         buffer: audioBuffer,
//         mimetype: 'audio/wav'  // Adjust based on your actual audio format
//       };

//       const options = {
//         smart_format: true,
//         model: 'general',
//         language: 'en-US'
//       };

//       const response = await this.deepgram.listen.prerecorded.transcribeFile(source, options);
      
//       return response.result.channels[0].alternatives[0].transcript;
//     } catch (error) {
//       console.error('Deepgram transcription error:', error);
//       throw new Error(`Speech-to-text conversion failed: ${error.message}`);
//     }
//   }
// }

// module.exports = new DeepgramService();