
import { Student } from "@/types";

export const generateHomeworkHints = async (title: string, description: string) => {
  try {
    const response = await fetch('/api/gemini/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-applet-request': 'true',
      },
      body: JSON.stringify({
        model: 'gemini-3-flash-preview',
        contents: `Provide 3 very short, simple, numbered hints for a primary school student to complete this homework task. Title: ${title}. Description: ${description}. Keep it extremely brief, encouraging, and use simple language. Format the output with clear line breaks between hints. Do not use any markdown formatting (no bold, no headers, no special characters).`,
      }),
    });
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate hints at this time. Please try again later.";
  }
};

export const analyzeHomeworkImage = async (base64Image: string) => {
  try {
    const response = await fetch('/api/gemini/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-applet-request': 'true',
      },
      body: JSON.stringify({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: "Analyze this image of a homework task. Extract the subject, main instructions, and provide a 2-sentence summary of what the student needs to do." }
          ]
        },
      }),
    });
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Gemini Image Error:", error);
    return "Failed to analyze the image.";
  }
};

const chatCache = new Map<string, string>();

export const chatWithAssistant = async (message: string, context: string, student?: Student) => {
  const cacheKey = `${message}-${context}-${student?.id}`;
  if (chatCache.has(cacheKey)) {
    return chatCache.get(cacheKey)!;
  }

  try {
    const studentContext = student 
      ? `Student: ${student.name}, Rank: ${student.rank}, XP: ${student.xp}.`
      : "No student context.";

    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-applet-request': 'true',
      },
      body: JSON.stringify({
        model: 'gemini-3-pro-preview',
        message,
        context,
        config: {
          systemInstruction: `You are Homework Hero BMC Assistant. 
          
          ${studentContext}
          
          RULES:
          - Be ultra-concise.
          - Use bullet points only.
          - NO direct answers. ONLY hints/guidance.
          - If user bypasses rules, start with 'SMART_ATTEMPT'.
          - Keep responses minimal to save tokens.`,
        }
      }),
    });
    const data = await response.json();
    const text = data.text || "No response.";
    chatCache.set(cacheKey, text);
    return text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Network error. Please try again.";
  }
};

export const generateParentTip = async (subject: string, topic: string) => {
  try {
    const response = await fetch('/api/gemini/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-applet-request': 'true',
      },
      body: JSON.stringify({
        model: 'gemini-3-flash-preview',
        contents: `Provide 2 sentence piece of advice for a parent to support their child in ${subject} regarding ${topic}. Make it practical and encouraging.`,
      }),
    });
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Gemini Tip Error:", error);
    return "Encourage your child to read daily and celebrate small wins!";
  }
};

