const axios = require('axios');

class AssemblyAIService {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.assemblyai.com/v2',
      headers: {
        authorization: process.env.ASSEMBLY_AI_API_KEY,
        'content-type': 'application/json',
      },
    });
  }

  async transcribe(audioUrl) {
    try {
      // Submit for transcription
      const response = await this.client.post('/transcript', {
        audio_url: audioUrl,
        language_code: 'en_us'
      });

      const transcriptId = response.data.id;

      // Poll for completion
      while (true) {
        const transcript = await this.client.get(`/transcript/${transcriptId}`);
        
        if (transcript.data.status === 'completed') {
          return transcript.data.text;
        } else if (transcript.data.status === 'error') {
          throw new Error('Transcription failed');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('AssemblyAI transcription error:', error);
      throw new Error('Speech-to-text conversion failed');
    }
  }
  async textToSpeech(text, outputFile) {
    try {
      // Submit for TTS conversion
      const response = await this.client.post('/text-to-speech', {
        text,
        voice: 'en_us', // Specify voice settings
      });

      console.log(response, "RESPONSE")

    //   const audioUrl = response.data.audio_url;

    //   // Download the audio file
    //   const audioResponse = await axios.get(audioUrl, { responseType: 'stream' });
    //   const writer = fs.createWriteStream(outputFile);
    //   audioResponse.data.pipe(writer);

    //   return new Promise((resolve, reject) => {
    //     writer.on('finish', () => {
    //       console.log(`Audio content written to file: ${outputFile}`);
    //       resolve();
    //     });
    //     writer.on('error', reject);
    //   });
    } catch (error) {
    //   console.error('Text-to-speech conversion error:', error);
      throw new Error('Text-to-speech conversion failed');
    }
  }
}


module.exports = new AssemblyAIService();