const axios = require('axios');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');

class GroqService {
// //   constructor() {
// //     this.client = axios.create({
// //       baseURL: 'https://api.groq.com/v1',
// //       headers: {
// //         'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
// //         'Content-Type': 'application/json'
// //       }
// //     });
// //   }

// //   async generateHealthResponse(prompt) {
// //     try {
// //       const response = await this.client.post('/chat/completions', {
// //         model: 'llama-3.3-70b-versatile',
// //         messages: [
// //           {
// //             role: 'system',
// //             content: 'You are a knowledgeable health assistant providing accurate, helpful health advice.'
// //           },
// //           {
// //             role: 'user',
// //             content: prompt
// //           }
// //         ],
// //         temperature: 0.7,
// //         max_tokens: 500
// //       });

// //       return response.data.choices[0].message.content;
// //     } catch (error) {
// //       console.error('Groq API error:', error);
// //       throw new Error('Failed to generate health response');
// //     }
// //   }
// //============================================================================
// //second attempt 
    constructor() {
      this.client = axios.create({
        baseURL: 'https://api.groq.com/openai/v1',  // Changed from '/v1' to '/openai/v1'
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    }
  
    async generateHealthResponse(prompt) {
      try {
        const response = await this.client.post('/chat/completions', {
          model: 'mixtral-8x7b-32768',  // Changed from 'llama-3.3-70b-versatile'
          messages: [
            {
              role: 'system',
              content: 'You are a knowledgeable health assistant providing accurate, helpful health advice.'
            },
            {
              role: 'user',
              content: prompt,
              // side: left
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        });
  
        return response.data.choices[0].message;
      } catch (error) {
        console.error('Groq API error:', error.response?.data || error.message);
        throw new Error('Failed to generate health response');
      }
    }
  

  async generateHealthTip(category) {
    const categoryPrompts = {
      nutrition: 'Generate a helpful nutrition tip for healthy eating.',
      exercise: 'Generate a practical exercise tip for staying active.',
      'mental-health': 'Generate a supportive mental health tip for well-being.',
      sleep: 'Generate a useful tip for better sleep habits.',
      general: 'Generate a general health and wellness tip.'
    };

    const prompt = categoryPrompts[category] || categoryPrompts.general;
    return this.generateHealthResponse(prompt);
  }
}

module.exports = GroqService;