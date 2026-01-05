import { GoogleGenAI } from "@google/genai";
import { AiActionType } from '../types';

const apiKey = process.env.API_KEY || '';

let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const generateAiContent = async (
  currentText: string,
  action: AiActionType
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = getAiClient();
  
  let prompt = "";
  switch (action) {
    case AiActionType.FIX_GRAMMAR:
      prompt = `Fix the grammar and spelling of the following Markdown text. Do not add conversational filler, just return the corrected markdown:\n\n${currentText}`;
      break;
    case AiActionType.SUMMARIZE:
      prompt = `Summarize the following Markdown text into a concise paragraph. Use Markdown formatting:\n\n${currentText}`;
      break;
    case AiActionType.EXPAND:
      prompt = `Continue writing the following Markdown text logically. Maintain the style and tone. Add about 2-3 paragraphs:\n\n${currentText}`;
      break;
    case AiActionType.TONE_PROFESSIONAL:
      prompt = `Rewrite the following Markdown text to sound more professional and formal. Maintain the structure:\n\n${currentText}`;
      break;
    default:
      prompt = currentText;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content. Please check your connection or API key.");
  }
};