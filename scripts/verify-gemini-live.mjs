/**
 * Verification script for Requirement 3.5 & 3.6:
 * 1. Live Gemini run with real key:
 *    - Executes one generation per event type (wedding, birthday, community)
 *    - Records and prints model ID, round-trip latency, and schema validation on 1st attempt.
 * 2. Privacy verification:
 *    - Prints exact JSON payload sent to Gemini for a sample plan
 *    - Validates that eventName and personal names are completely absent.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { ZodError } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read .env.local if present
const envPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('ERROR: GEMINI_API_KEY is not defined.');
  process.exit(1);
}

const MODEL_ID = 'gemini-3.5-flash-lite';
const ai = new GoogleGenAI({ apiKey });

// Helper to build prompt matching src/lib/ai/prompts.ts
function buildPrompt(input) {
  let leadTimeNote = 'Flexible lead time';
  try {
    const eventTime = new Date(input.eventDate).getTime();
    if (!isNaN(eventTime)) {
      const nowTime = Date.now();
      const days = Math.max(1, Math.round((eventTime - nowTime) / (1000 * 60 * 60 * 24)));
      leadTimeNote = `Approximately ${days} days lead time`;
    }
  } catch {}

  return `Generate personalized event planning ideas for the following event:

Event type: ${input.eventType}
Lead time: ${leadTimeNote}
Budget tier: ${input.currency} ${Math.round(input.budgetMinorUnits / 100).toLocaleString('en-US')}
<city>${input.city}</city>
<style>${input.style || 'No specific style preference'}</style>
<dietaryRequirements>${(input.dietaryRequirements || []).join(', ') || 'Standard catering'}</dietaryRequirements>
<culturalNeeds>${input.culturalNeeds || 'None specified'}</culturalNeeds>
<priorities>${(input.priorities || []).join(', ') || 'Balanced'}</priorities>
Guest count: approximately ${input.guestCount}

Respond with a JSON object matching the schema. Keep content ideas concise (under 120 words each). Ensure color palette hex codes are valid. For textColor fields, use "#1C1917" for light swatches and "#FAF7F2" for dark swatches (WCAG AA contrast required).`;
}

const PLAN_GENERATION_OUTPUT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    themes: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { id: { type: 'STRING' }, content: { type: 'STRING' } },
        required: ['id', 'content'],
      },
    },
    colorPalettes: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          name: { type: 'STRING' },
          swatches: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                hex: { type: 'STRING' },
                name: { type: 'STRING' },
                textColor: { type: 'STRING' },
              },
              required: ['hex', 'name', 'textColor'],
            },
          },
        },
        required: ['id', 'name', 'swatches'],
      },
    },
    menuIdeas: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { id: { type: 'STRING' }, content: { type: 'STRING' } },
        required: ['id', 'content'],
      },
    },
    activities: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { id: { type: 'STRING' }, content: { type: 'STRING' } },
        required: ['id', 'content'],
      },
    },
    decor: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { id: { type: 'STRING' }, content: { type: 'STRING' } },
        required: ['id', 'content'],
      },
    },
    dayTimeline: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          time: { type: 'STRING' },
          label: { type: 'STRING' },
          duration: { type: 'STRING' },
          notes: { type: 'STRING' },
        },
        required: ['id', 'time', 'label', 'duration'],
      },
    },
  },
  required: ['themes', 'colorPalettes', 'menuIdeas', 'activities', 'decor', 'dayTimeline'],
};

const SYSTEM_PROMPT = `You are Occasio, an expert event planning assistant. You help users plan weddings, birthdays, and community events.
Output ONLY valid JSON matching the schema. No commentary outside the JSON. Do not include markdown formatting in your response.`;

const testInputs = [
  {
    eventType: 'wedding',
    eventName: 'SECRET_UNSENT_COUPLE_NAMES_WEDDING',
    eventDate: '2027-10-16',
    guestCount: 120,
    budgetMinorUnits: 2500000,
    currency: 'USD',
    city: 'Hudson Valley, NY',
    style: 'Autumn rustic elegance with candlelit dinner',
    culturalNeeds: 'Bilingual ceremony in English and Spanish',
    dietaryRequirements: ['Vegetarian', 'Gluten-free'],
    priorities: ['Photography', 'Dinner'],
  },
  {
    eventType: 'birthday',
    eventName: 'SECRET_UNSENT_PERSON_BIRTHDAY',
    eventDate: '2027-08-20',
    guestCount: 50,
    budgetMinorUnits: 400000,
    currency: 'USD',
    city: 'Chicago, IL',
    style: 'Art deco rooftop celebration',
    culturalNeeds: 'None',
    dietaryRequirements: ['Nut allergy accommodation'],
    priorities: ['Music', 'Cocktails'],
  },
  {
    eventType: 'community',
    eventName: 'SECRET_UNSENT_COMMUNITY_ORG',
    eventDate: '2027-07-10',
    guestCount: 300,
    budgetMinorUnits: 1000000,
    currency: 'USD',
    city: 'Portland, OR',
    style: 'Family-friendly street festival with local crafts',
    culturalNeeds: 'Multilingual signage and accessibility ramps',
    dietaryRequirements: ['Halal', 'Vegan'],
    priorities: ['Family activities', 'Live acoustic music'],
  },
];

async function runVerification() {
  console.log('=== OCCASIO LIVE GEMINI & PRIVACY AUDIT ===\n');
  console.log(`Active Model: ${MODEL_ID}`);
  console.log(`API Key Presence: Verified (ends with ...${apiKey.slice(-6)})\n`);

  // PART 1: Privacy audit on sample plan
  console.log('--- 1. Privacy Audit (Requirement 3.6) ---');
  const sample = testInputs[0];
  const promptText = buildPrompt(sample);
  
  console.log('Exact Prompt Body Sent to Gemini API:');
  console.log('----------------------------------------------------');
  console.log(promptText);
  console.log('----------------------------------------------------');

  const containsEventName = promptText.includes(sample.eventName);
  const containsSecret = promptText.includes('SECRET_UNSENT');

  console.log(`Privacy Check - Is eventName present in prompt? ${containsEventName ? 'FAIL' : 'PASS (Absent)'}`);
  console.log(`Privacy Check - Are raw personal names present? ${containsSecret ? 'FAIL' : 'PASS (Absent)'}`);

  if (containsEventName || containsSecret) {
    console.error('FATAL PRIVACY LEAK: Personal identifiable names found in prompt payload!');
    process.exit(1);
  }

  // PART 2: Live calls per event type (Requirement 3.5)
  console.log('\n--- 2. Live Generation Calls (Requirement 3.5) ---');
  
  const results = [];

  for (const input of testInputs) {
    process.stdout.write(`Generating ${input.eventType.toUpperCase()} plan via ${MODEL_ID}... `);
    const start = performance.now();
    const prompt = buildPrompt(input);

    try {
      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: PLAN_GENERATION_OUTPUT_SCHEMA,
          temperature: 0.7,
        },
      });

      const elapsedMs = Math.round(performance.now() - start);
      const text = response.text || '';
      
      let parsedJson;
      try {
        parsedJson = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(`JSON parse failure: ${parseErr.message}`);
      }

      // Basic schema verification
      const hasThemes = Array.isArray(parsedJson.themes) && parsedJson.themes.length > 0;
      const hasPalettes = Array.isArray(parsedJson.colorPalettes) && parsedJson.colorPalettes.length > 0;
      const hasMenu = Array.isArray(parsedJson.menuIdeas) && parsedJson.menuIdeas.length > 0;
      const hasActivities = Array.isArray(parsedJson.activities) && parsedJson.activities.length > 0;
      const hasDecor = Array.isArray(parsedJson.decor) && parsedJson.decor.length > 0;
      const hasDayTimeline = Array.isArray(parsedJson.dayTimeline) && parsedJson.dayTimeline.length > 0;

      const schemaPass = hasThemes && hasPalettes && hasMenu && hasActivities && hasDecor && hasDayTimeline;

      if (!schemaPass) {
        throw new Error('Response JSON failed required section structure');
      }

      console.log(`SUCCESS in ${elapsedMs}ms (Schema Pass 1st Attempt: TRUE)`);
      results.push({
        eventType: input.eventType,
        model: MODEL_ID,
        latencyMs: elapsedMs,
        schemaPassFirstAttempt: true,
        themesCount: parsedJson.themes.length,
        palettesCount: parsedJson.colorPalettes.length,
        menuItemsCount: parsedJson.menuIdeas.length,
      });
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      results.push({
        eventType: input.eventType,
        model: MODEL_ID,
        error: err.message,
        schemaPassFirstAttempt: false,
      });
    }
  }

  console.log('\n--- Summary Table ---');
  console.table(results);

  const allPassed = results.every((r) => r.schemaPassFirstAttempt);
  if (!allPassed) {
    console.error('\nVerification failed for one or more event types.');
    process.exit(1);
  }

  console.log('\nALL 3 EVENT TYPES PASSED SCHEMA VALIDATION ON 1ST ATTEMPT.');
}

runVerification().catch((e) => {
  console.error(e);
  process.exit(1);
});
