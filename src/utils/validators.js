const { ValidationError } = require('./errors');

const validators = {
  validateAudioFormat: (audioData) => {
    // Add audio format validation logic
    if (!audioData || !Buffer.isBuffer(audioData)) {
      throw new ValidationError('Invalid audio format');
    }
  },

  validateSessionId: (sessionId) => {
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 10) {
      throw new ValidationError('Invalid session ID');
    }
  },

  validateMessage: (message) => {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new ValidationError('Message cannot be empty');
    }
    if (message.length > 500) {
      throw new ValidationError('Message too long (max 500 characters)');
    }
  },

  validateCategory: (category, validCategories) => {
    if (category && !validCategories.includes(category)) {
      throw new ValidationError('Invalid category');
    }
  }
};

module.exports = validators;