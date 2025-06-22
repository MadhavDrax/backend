const express = require('express');
const router = express.Router();
const HealthTip = require('../models/HealthTip');
const groqService = require('../services/groq');
const AppError = require('../utils/errors');
const logger = require('../utils/logger');

router.get('/tips', async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    const tips = await HealthTip.aggregate([
      { $match: query },
      { $sample: { size: 1 } }
    ]);

    if (!tips.length) {
      // Generate new tip if none exists
      // const newTip = await groqService.generateHealthTip("fitness");
      const newTip = await groqService.generateHealthTip(category);
      const healthTip = await HealthTip.create({
        category: category || 'general',
        tip: newTip,
        source: 'groq'
      });
      return res.json(healthTip);
    }

    res.json(tips[0]);
  } catch (error) {
    logger.error('Health tips error:', error);
    next(error);
  }
});

module.exports = router;