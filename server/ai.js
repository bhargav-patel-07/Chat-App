import Together  from "together-ai";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY
});
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Round-robin state for traffic control
let llamaOrGemini = 0;

// TEXT GENERATION: Llama 70B and Gemini 1.5 Flash
export async function generateText(prompt) {
  // Alternate between Llama 70B and Gemini 1.5 Flash
  llamaOrGemini = (llamaOrGemini + 1) % 2;
  try {
    if (llamaOrGemini === 0) {
      // Use Llama 70B
      const response = await together.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
      });
      return response.choices?.[0]?.message?.content ?? "";
    } else {
      // Use Gemini 1.5 Flash
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      });
      // GoogleGenAI API may return text or candidates
      return response.text || (response.candidates?.[0]?.content?.parts?.[0]?.text ?? "");
    }
  } catch (err) {
    return `Error: ${err}`;
  }
}

// IMAGE PROCESSING: Llama Vision Free
/**
 * Generate image caption using AI
 * @param {Buffer|string} imageData - The image data as Buffer or base64 string
 * @returns {Promise<string>} The generated caption
 */
export async function generateImageCaption(imageData) {
  llamaOrGemini = (llamaOrGemini + 1) % 2;
  try {
    if (llamaOrGemini === 0) {
      // Use Llama Vision
      const response = await together.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Describe this image" },
              { type: "image_url", image_url: { url: `data:image/png;base64,${typeof imageData === 'string' ? imageData.split(',')[1] || imageData : imageData.toString('base64')}` } }
            ]
          }
        ],
        model: "meta-llama/Llama-Vision-Free"
      });
      return response.choices?.[0]?.message?.content ?? "";
    } else {
      // Use Gemini 1.5 Flash
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: "Describe this image" },
              { inlineData: { mimeType: "image/png", data: typeof imageData === "string" ? imageData.split(",")[1] : imageData.toString("base64") } }
            ]
          }
        ]
      });
      return response.text || (response.candidates?.[0]?.content?.parts?.[0]?.text ?? "");
    }
  } catch (err) {
    return `Error: ${err}`;
  }
}
