
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { SymptomLog, UserProfile, CycleData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateHealthInsights = async (
  profile: UserProfile,
  recentLogs: SymptomLog[],
  cycle: CycleData
): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Unable to generate personalized insights.";
  }

  const prompt = `
    Act as a compassionate, expert female health assistant for an app called SheThrive.
    
    User Profile:
    - Name: ${profile.name || profile.firstName}
    - Age: ${profile.age ?? 'Unknown'}
    - Main Goal: ${profile.goal}
    
    Cycle Context:
    - Cycle Length: ${cycle.length} days
    - Last Period Start: ${cycle.startDate}
    
    Recent Symptom Logs (Last few days):
    ${JSON.stringify(recentLogs)}

    Based on this data, provide a personalized, empathetic, and scientifically grounded health insight.
    
    CRITICAL INSTRUCTION FOR DATA ANOMALIES:
    - If the user's cycle length is unusual (< 20 days or > 45 days), gently suggest consulting a healthcare provider about irregular cycles, while still offering general wellness advice.
    - If the user's age is < 13 or > 100, provide generic, safe wellness advice suitable for all ages and do not make assumptions about fertility.
    - If symptom severity is consistently 10/10, advise seeking immediate medical attention in a calm way.

    Focus on specific advice regarding nutrition, stress management, or sleep that aligns with her likely cycle phase and reported symptoms.
    Keep it concise (under 150 words). 
    
    Structure the response clearly. Do not use medical jargon without explanation. 
    IMPORTANT: This is for informational purposes only, not medical diagnosis.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a private, secure, and empathetic health wellness AI companion. You prioritize safety and flag unusual health data gently.",
        temperature: 0.7,
      }
    });

    return response.text || "Unable to generate insights at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "We are currently experiencing high traffic. Please try generating insights again later.";
  }
};

export const getChatResponse = async (
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> => {
  if (!apiKey) return "I'm sorry, I can't connect right now. Please check your API key.";

  try {
    const chat: Chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are SheThrive AI, a warm, knowledgeable, and privacy-focused female health assistant. Keep answers concise, empathetic, and helpful. If asked medical questions, provide general wellness information but always advise consulting a doctor. You can help with cycle tracking, nutrition, mental wellness, and explaining health concepts. If the user input contains harmful or unrealistic numbers, politely ask for clarification.",
        temperature: 0.7,
      },
      history: history
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "I'm having trouble thinking of a response.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting to the server. Please try again.";
  }
};
