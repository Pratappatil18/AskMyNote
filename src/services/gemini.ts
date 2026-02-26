import { GoogleGenAI } from "@google/genai";
import { Subject } from "../types";

const getApiKey = () => {
  // In AI Studio, it's usually process.env.GEMINI_API_KEY
  // In some Vite setups, it might be import.meta.env.VITE_GEMINI_API_KEY
  const key = (process.env as any).GEMINI_API_KEY || (process.env as any).API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  return key;
};

export const gemini = {
  async chat(message: string, subject: Subject, focusLevel: number, context: string) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Please ensure it is set in the Secrets panel of AI Studio.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let systemInstruction = `You are AskmyNote, a specialist in ${subject}. 
    Answer ONLY from the evidence provided in the context. 
    If the answer is not in the context, say "Not found in ${subject}".
    
    CRITICAL FORMATTING:
    1. Every answer must cite the source as "filename:chunk".
    2. Provide a Confidence level: [HIGH/MEDIUM/LOW].
    3. Include 3 relevant snippets from the text.
    
    ADAPTATION:
    - If focusLevel < 40: Use extremely simple words, short sentences, and basic analogies.
    - If focusLevel > 70: Provide deep technical details, complex comparisons, and advanced concepts.
    - Otherwise: Standard academic tone.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: `System: ${systemInstruction}\n\nContext:\n${context}\n\nQuestion: ${message}` }] }
      ]
    });

    return { text: response.text || "I'm sorry, I couldn't generate a response." };
  },

  async generateStudyData(subject: Subject, context: string) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Please ensure it is set in the Secrets panel of AI Studio.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Based on the following content for ${subject}, generate:
    1. 5 Multiple Choice Questions (MCQs) with 4 options each and the correct answer.
    2. 3 Short Answer Questions.
    
    Format as JSON:
    {
      "mcqs": [{"question": "", "options": ["", "", "", ""], "answer": index}],
      "short": [{"question": "", "answer": ""}]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: `Context:\n${context}\n\n${prompt}` }] }
      ],
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || "{}");
  }
};
