import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

async function listModels() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  let apiKey = '';
  for (const line of envContent.split('\n')) {
    if (line.startsWith('GEMINI_API_KEY=')) {
      apiKey = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
  }

  const ai = new GoogleGenAI({ apiKey });
  const pager = await ai.models.list();
  const allModels = [];
  const imageModels = [];
  
  for await (const m of pager) {
    allModels.push(m.name);
    if (m.name.toLowerCase().includes('imagen') || m.name.toLowerCase().includes('image')) {
      imageModels.push({ name: m.name, displayName: m.displayName });
    }
  }

  console.log('Total models listed:', allModels.length);
  console.log('Image / Imagen models found:', imageModels);
  console.log('Sample model names:', allModels.slice(0, 10));
}

listModels().catch(console.error);

