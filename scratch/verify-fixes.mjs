
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function verifyFixes() {
  console.log('--- Verification Started ---');

  // 1. Verify pdf-parse import logic
  try {
    const pdfModule = await import('pdf-parse');
    const pdfParse = pdfModule.default || pdfModule;
    console.log('1. pdf-parse import verify:', typeof pdfParse === 'function' ? 'PASSED (is function)' : 'FAILED (is ' + typeof pdfParse + ')');
    
    // Test with actual dummy PDF-like buffer if possible, but just checking the type is usually enough for the import fix
  } catch (e) {
    console.error('1. pdf-parse import FAILED:', e.message);
  }

  // 2. Verify Groq connectivity
  try {
    const apiKey = process.env.GROQ_API_KEY;
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'verification test' }],
        max_tokens: 5
      })
    });
    
    if (response.ok) {
        console.log('2. Groq API connectivity: PASSED');
    } else {
        const data = await response.json();
        console.error('2. Groq API connectivity: FAILED', data.error?.message || response.statusText);
    }
  } catch (e) {
    console.error('2. Groq API connectivity: FAILED', e.message);
  }

  console.log('--- Verification Finished ---');
}

verifyFixes();
