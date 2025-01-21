const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    // This will store Firebase UID
  },
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

// Create indexes for better query performance
messageSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema);