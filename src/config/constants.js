const constants = {
    SPEECH_SERVICE: {
      DEEPGRAM: 'deepgram',
      ASSEMBLY_AI: 'assemblyai'
    },
    
    RATE_LIMIT: {
      WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutes
      MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100
    },
    
    HEALTH_TIP_CATEGORIES: [
      'nutrition',
      'exercise',
      'mental-health',
      'sleep',
      'general'
    ],
  
    MODELS: {
      GROQ: 'llama-3.3-70b-versatile'
    },
  
    API_TIMEOUT: 30000 // 30 seconds
  };
  
  module.exports = constants;