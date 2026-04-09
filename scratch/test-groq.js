
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function testGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  console.log('Testing Groq with API Key starting with:', apiKey ? apiKey.substring(0, 5) : 'MISSING');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say hello' }]
      })
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Success:', data.choices[0].message.content);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testGroq();
