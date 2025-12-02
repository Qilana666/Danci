import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResponse, WordResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Analyze Text (Get Definition, Examples, Usage, and Image Prompt)
export const analyzeText = async (
  text: string,
  targetLang: string,
  nativeLang: string
): Promise<AnalysisResponse> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Analyze the following text: "${text}".
    Target Language: ${targetLang}
    User's Native Language: ${nativeLang}

    Provide a JSON response with the following fields:
    1. "definition": A natural language explanation in ${nativeLang}.
    2. "examples": An array of 2 objects, each with "target" (sentence in ${targetLang}) and "native" (translation in ${nativeLang}).
    3. "usageNotes": A fun, witty, conversational paragraph in ${nativeLang} explaining the culture, context, tone, synonyms, or common confusion. Write like a friend, not a textbook. Be concise but interesting.
    4. "imagePrompt": A short English description of a visual concept that represents this text, suitable for generating an illustration.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          definition: { type: Type.STRING },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                target: { type: Type.STRING },
                native: { type: Type.STRING },
              },
            },
          },
          usageNotes: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
        },
      },
    },
  });

  const jsonStr = response.text || "{}";
  return JSON.parse(jsonStr) as AnalysisResponse;
};

// 2. Generate Image
export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `A colorful, fun, flat vector illustration of: ${prompt}. Minimalist, vibrant style.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image generation failed", e);
    return null;
  }
};

// 3. Generate Speech (TTS)
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' }, // Generic energetic voice
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (e) {
    console.error("TTS failed", e);
    return null;
  }
};

// 4. Chat about the word
export const createChatSession = (initialContext: string, nativeLang: string) => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are a helpful language learning assistant. The user is asking about a specific word or phrase provided in the context. Answer in ${nativeLang}. Keep answers concise, encouraging, and helpful.`,
    },
    history: [
      {
        role: 'user',
        parts: [{ text: `Context: ${initialContext}` }]
      },
      {
        role: 'model',
        parts: [{ text: "Understood. I am ready to answer questions about this word." }]
      }
    ]
  });
};

// 5. Generate Story from Notebook
export const generateStory = async (words: WordResult[], nativeLang: string): Promise<string> => {
  const wordList = words.map(w => w.originalText).join(", ");
  const prompt = `
    Create a short, funny, and coherent story using the following words: ${wordList}.
    Write the story in the target language of the words, then provide a translation in ${nativeLang}.
    Highlight the used words in the text if possible (e.g., using **bold**).
  `;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  
  return response.text || "Could not generate story.";
};
