const rateLimit = require('express-rate-limit');
const { RATE_LIMIT } = require('../config/constants');

const limiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.'
});

module.exports = limiter;