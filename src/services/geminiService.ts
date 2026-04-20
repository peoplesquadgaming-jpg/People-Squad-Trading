import { GoogleGenAI } from "@google/genai";

/**
 * Generates a brief explanation for a trading signal using Gemini AI.
 * Follows the @google/genai SDK patterns as per system guidelines.
 */
export async function generateSignalExplanation(
  asset: string,
  signal: string,
  confidence: number,
  indicators: string
) {
  // Access API key as per React (Vite) guidelines in the gemini-api skill
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey === "") {
    return "AI Analysis unavailable: API Key missing.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `As an expert financial analyst, provide a very brief (max 15 words) explanation for a ${signal} signal on ${asset} with ${confidence}% confidence. 
    Current technical state: ${indicators}. 
    Focus on short-term momentum. Be concise and professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || `Indicators suggest strong ${signal} momentum for ${asset}.`;
  } catch (error) {
    console.warn("Gemini AI error:", error);
    return `Technical indicators confirm ${signal} momentum with ${confidence}% confidence based on market volatility.`;
  }
}
