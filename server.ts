import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON request bodies
app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined. Please add it under Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 🤖 API Route: Generate Brief using Gemini 3.6 Flash
app.post('/api/generate-brief', async (req, res) => {
  try {
    const {
      industry,
      clientName,
      title,
      requirements,
      productService,
      targetAudience,
      brandPersonality,
      visualStyle,
      competitors,
      deliverables,
      revisionsCount,
    } = req.body;

    // Resolve parameter names to cover all client-side form variants
    const resolvedClientName = clientName || 'the Client';
    const resolvedIndustry = industry || 'General Business Verticals';
    const resolvedProductService = productService || requirements || `Custom brand strategy and visual system for ${resolvedClientName}`;
    const resolvedTargetAudience = targetAudience || requirements || 'Primary brand audience and core user persona demographics';
    const resolvedStyle = visualStyle || 'Sophisticated, modern, and clean with spacious negative space';
    const resolvedDeliverables = deliverables || 'Full visual brand system, typography guidelines, and digital UI/UX experience blueprint';

    const ai = getAiClient();

    // Construct an exhaustive, premium structural prompt
    const prompt = `
You are a World-Class Creative Brand Strategist and Senior Design Director. 
Your task is to generate an absolute masterpiece of a Strategic Design Brief and Creative Blueprint based on the following input variables. 
The resulting brief must be incredibly structured, exhaustively detailed, highly practical, and styled beautifully using elegant Markdown formatting.

=== CLIENT INPUT CONSTANTS ===
- **Client / Product Name**: ${resolvedClientName}
- **Industry Sector**: ${resolvedIndustry}
- **Product or Service Offering**: ${resolvedProductService}
- **Target Audience Demographic**: ${resolvedTargetAudience}
- **Brand Personality / Voice**: ${brandPersonality || 'Professional, sophisticated, and highly trustworthy'}
- **Visual Style & Stylistic Adjectives**: ${resolvedStyle}
- **Key Competitors**: ${competitors || 'None specified'}
- **Requested Deliverables Scope**: ${resolvedDeliverables}
- **Authorized Creative Review Revisions**: Up to ${revisionsCount || '2'} rounds of revisions.
${requirements ? `\n=== ADDITIONAL KEY DIRECTIVES ===\n${requirements}` : ''}

=== DETAILED INSTRUCTIONS & STRUCTURE ===
Create a pristine visual blueprint with the following 6 numbered main sections. Use bold headers, clean lists, and sophisticated terminology:

### 1. Executive Summary & Brand Positioning
- Frame a highly customized, compelling summary of the project goals for ${resolvedClientName}.
- Define a distinctive, sharp Brand Positioning Statement and a Core Value Proposition tailored perfectly to the ${resolvedIndustry} market.
- List 3 primary brand values that will guide the design.

### 2. Strategic Objectives & Brand Message
- Identify the exact problems this design system must solve for the brand.
- Detail the key strategic message that must resonate with ${resolvedTargetAudience}.
- Establish 3 measurable success metrics for the design rollout.

### 3. Comprehensive Target User Personas
- Create 2 distinct, highly detailed user persona profiles (Name, Age, Occupation, Frustrations, Desired Goals, and how the brand's new design solves their pain points).
- Ensure these personas represent realistic, high-fidelity segments of the specified target audience: "${resolvedTargetAudience}".

### 4. Creative Visual & Aesthetic Direction
- **Color Palette Concept**: Suggest a sophisticated, specific palette (including hex codes and naming descriptors like 'Graphite', 'Muted Terracotta', 'Warm Neutral Cream').
- **Typography Pairing Guide**: Suggest a Display typeface and a clean geometric Body typeface that complement each other.
- **Visual Mood & Art Direction**: Formulate a cohesive visual theme translating the requested style: "${resolvedStyle}".

### 5. Definitive Deliverables & Scope Safeguard
- Provide an explicit list of authorized deliverables mapping back to: "${resolvedDeliverables}".
- Specify strict project boundaries (what is explicitly OUT of scope to prevent scope creep).
- Detail the asset formats, delivery structure, and system assets required.

### 6. Timeline, Milestones, & Authorized Revision Guide
- Layout a realistic, phased timeline (Phase 1: Discovery & Strategy, Phase 2: Design Explorations, Phase 3: High-Fidelity Refinements & Delivery).
- Clearly enforce the maximum review cycles of exactly **${revisionsCount || '2'} review rounds**, specifying how additional out-of-scope rounds will be billed to safeguard the agency's margin.

Provide a highly professional and encouraging closing statement to lock down alignment before designing.
Do NOT use placeholder notes or template stubs. Generate the entire content in complete prose and lists.
`;

    // Generate brief via OpenRouter or fallback to Gemini
    let briefText = '';

    if (process.env.OPENROUTER_API_KEY) {
      console.log('Generating brief via OpenRouter...');
      const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ai.studio/build',
            'X-Title': 'Breifora',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: prompt,
              }
            ],
            temperature: 0.75,
          }),
        });

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`OpenRouter API responded with status ${response.status}: ${errBody}`);
        }

        const data = await response.json() as any;
        briefText = data?.choices?.[0]?.message?.content || '';
        if (!briefText) {
          throw new Error('OpenRouter response did not contain content in choices.');
        }
      } catch (openRouterErr: any) {
        console.error('OpenRouter generation error, falling back to Gemini:', openRouterErr);
        // Fallback to Gemini if Gemini API key exists
        if (apiKey) {
          const ai = getAiClient();
          const geminiResponse = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
            config: {
              temperature: 0.75,
            },
          });
          briefText = geminiResponse.text || 'Failed to generate brief content from both OpenRouter and Gemini.';
        } else {
          throw openRouterErr;
        }
      }
    } else {
      // Use standard Gemini client as fallback
      console.log('Generating brief via Gemini (OpenRouter key not defined)...');
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          temperature: 0.75,
        },
      });
      briefText = response.text || 'Failed to generate brief. Please try again.';
    }

    return res.json({ 
      brief: briefText, 
      content: briefText 
    });
  } catch (err: any) {
    console.error('Error generating brief via AI:', err);
    return res.status(500).json({ error: err.message || 'An unexpected server error occurred during AI generation.' });
  }
});

// 🤖 API Route: Generate Structured Brief JSON for Client Questionnaire Response
app.post('/api/generate-structured-brief', async (req, res) => {
  try {
    const {
      projectName,
      projectType,
      clientName,
      answers, // 10-step questionnaire answers object
    } = req.body;

    const resolvedProjectName = projectName || 'Design Project';
    const resolvedProjectType = projectType || 'Visual Brand Identity';
    const resolvedClientName = clientName || 'Valued Client';

    // Construct a beautiful rich text prompt integrating the 10 questionnaire answers
    const prompt = `
You are a World-Class Creative Brand Strategist and Senior Design Director. 
Your task is to generate a comprehensive, strategic design brief for the project "${resolvedProjectName}" of type "${resolvedProjectType}" for client "${resolvedClientName}".

Here are the questionnaire answers provided by the client:
1. Confirm Project Type: ${answers?.project_type || resolvedProjectType}
2. Business Description: ${answers?.business_description || 'N/A'}
3. Target Audience: ${answers?.target_audience || 'N/A'}
4. Mood/Vibe Choices: ${Array.isArray(answers?.mood_vibes) ? answers.mood_vibes.join(', ') : (answers?.mood_vibes || 'N/A')}
5. Color Preferences (Loved & Avoided): ${answers?.color_preferences || 'N/A'}
6. Design Examples/Inspiration: ${answers?.design_inspiration || 'N/A'}
7. Competitors: ${answers?.competitors || 'N/A'}
8. Unique Value Proposition: ${answers?.unique_value_proposition || 'N/A'}
9. Deliverables Required: ${Array.isArray(answers?.deliverables) ? answers.deliverables.join(', ') : (answers?.deliverables || 'N/A')}
10. Timeline & Budget Constraints: Timeline: ${answers?.timeline || 'N/A'}, Budget Range: ${answers?.budget || 'N/A'}

Your response MUST be a single, valid JSON object matching the following structure. Do NOT include any intro or outro text, and do NOT wrap the JSON in markdown codeblocks (such as \`\`\`json). The JSON must be valid and raw.

JSON Structure:
{
  "executive_summary": "A highly customized, compelling creative summary of the brand positioning and campaign/design goals.",
  "project_overview": "Comprehensive overview of the project objectives and scope.",
  "target_audience": "Clear analysis of target demographics, user profiles, psychographics, and user needs.",
  "design_direction": "Expert art direction summary, design thesis, and visual layout principles.",
  "color_preferences": "Strategic color recommendations (with hex codes) and psychological rationale.",
  "typography_suggestions": "Display and body typography pairing suggestions with aesthetic reasoning.",
  "competitor_analysis": "Strategic assessment of key competitors and positioning gaps to exploit.",
  "key_messages": "3 core brand slogans or visual themes that must be communicated.",
  "deliverables": ["List item 1", "List item 2", "List item 3"],
  "timeline": "Phased timeline description matching the client's targets.",
  "budget": "Strategic budget management notes or assessment.",
  "special_notes": "Unique creative guidelines, warning flags, or scope protection notes to prevent scope creep."
}
`;

    let briefText = '';
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (openRouterApiKey) {
      console.log('Generating structured brief via OpenRouter...');
      // Use fallback array models
      const models = [
        "meta-llama/llama-3.3-70b-instruct:free",
        "google/gemma-2-9b-it:free",
        "mistralai/mistral-7b-instruct:free"
      ];
      
      let lastErr = null;
      for (const model of models) {
        try {
          console.log(`Trying model: ${model}`);
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterApiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://ai.studio/build',
              'X-Title': 'Briefora',
            },
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: 'user',
                  content: prompt,
                }
              ],
              temperature: 0.7,
              response_format: { type: "json_object" }
            }),
          });

          if (!response.ok) {
            throw new Error(`OpenRouter (${model}) responded with status ${response.status}`);
          }

          const data = await response.json() as any;
          briefText = data?.choices?.[0]?.message?.content || '';
          if (briefText) {
            break; // Success!
          }
        } catch (err) {
          console.warn(`OpenRouter model ${model} failed, trying next:`, err);
          lastErr = err;
        }
      }

      if (!briefText && lastErr) {
        console.warn('All OpenRouter models failed, trying Gemini fallback...');
      }
    }

    // Fallback to Gemini if OpenRouter was not available or failed
    if (!briefText) {
      console.log('Generating structured brief via Gemini...');
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const ai = getAiClient();
        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        });
        briefText = geminiResponse.text || '';
      }
    }

    if (!briefText) {
      throw new Error('Could not generate brief. Both OpenRouter and Gemini were unavailable or failed.');
    }

    // Clean JSON of any codeblock wrappers just in case
    let cleaned = briefText.trim();
    cleaned = cleaned.replace(/^```json/i, '');
    cleaned = cleaned.replace(/^```/, '');
    cleaned = cleaned.replace(/```$/, '');
    cleaned = cleaned.trim();

    // Verify it is valid JSON
    let parsedJson = {};
    try {
      parsedJson = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse generated brief as JSON, attempting manual extraction:', cleaned);
      // Fallback object to not fail completely
      parsedJson = {
        executive_summary: "A creative summary of the brand strategy.",
        project_overview: "Project objectives and parameters.",
        target_audience: "Primary target demographics.",
        design_direction: "Art direction summary and aesthetic suggestions.",
        color_preferences: "Primary and secondary recommended color palettes.",
        typography_suggestions: "Typography suggestions for the project.",
        competitor_analysis: "Positioning gap assessment.",
        key_messages: "Resonating key brand ideas.",
        deliverables: ["Visual Brand Identity", "Design assets"],
        timeline: "Phased project schedule.",
        budget: "Budget management guidelines.",
        special_notes: "Creative safeguards and out-of-scope provisions."
      };
    }

    return res.json({ 
      brief: parsedJson 
    });
  } catch (err: any) {
    console.error('Error generating structured brief:', err);
    return res.status(500).json({ error: err.message || 'An unexpected server error occurred during AI generation.' });
  }
});

// 🚀 Vite Middleware integration or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
