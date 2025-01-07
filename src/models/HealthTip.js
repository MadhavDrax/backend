const mongoose = require('mongoose');

const healthTipSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['nutrition', 'exercise', 'mental-health', 'sleep', 'general']
  },
  tip: {
    type: String,
    required: true
  },
  source: {
    type: String,
    default: 'system'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HealthTip', healthTipSchema);