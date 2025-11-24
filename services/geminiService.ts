import { GoogleGenAI, Type } from "@google/genai";
import { LinkAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLinkContent = async (url: string): Promise<LinkAnalysisResult> => {
  try {
    const modelId = "gemini-2.5-flash"; // Fast model for quick UI response

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
    console.error("Gemini analysis failed:", error);
    // Fallback logic if API fails or quota exceeded
    return { title: "Liên kết mới" };
  }
};
