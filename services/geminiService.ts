import { GoogleGenAI, Type } from "@google/genai";
import { LinkAnalysisResult } from "../types";

// Initialize the AI instance directly with process.env.API_KEY as per guidelines.
// This relies on the define plugin in vite.config.ts to replace the variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLinkContent = async (url: string): Promise<LinkAnalysisResult> => {
  try {
    const modelId = "gemini-2.5-flash"; 

    const prompt = `
      Analyze this URL: "${url}".
      If it is a Spotify link, extract the song name, artist, or playlist title.
      If it is another type of link, give a very short descriptive name (max 5 words).
      Return ONLY the JSON object.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A short, user-friendly title for this link.",
            },
          },
          required: ["title"],
        },
      },
    });

    const text = response.text;
    if (!text) return { title: "Liên kết không xác định" };

    const result = JSON.parse(text) as LinkAnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini analysis failed or quota exceeded:", error);
    // Graceful fallback
    return { title: "Link mới" };
  }
};