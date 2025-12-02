import { GoogleGenAI } from "@google/genai";

// 从 Vite 环境变量里读（如果你没配 .env，这里就是 undefined）
const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
console.log("Gemini API key loaded:", apiKey);
// 只有在有 apiKey 时才初始化 AI 客户端
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!apiKey) {
  console.warn("No Gemini API key set; AI features are disabled. Using fallback messages instead.");
}

/**
 * Generates a quick sustainable fashion tip.
 */
export const getRecycleTip = async (): Promise<string> => {
  // 没有 AI 客户端时，直接返回一个固定文案，避免报错
  if (!ai) {
    return "Donate or swap clothes instead of throwing them away.";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        "Give me one short, punchy, 10-word tip about recycling clothes or sustainable fashion.",
    });
    // 不同 SDK 版本返回结构可能不一样，这里做个兜底
    // @ts-ignore
    return response.text || "Reuse, Reduce, Recycle your fashion!";
  } catch (error) {
    console.error("Error fetching tip:", error);
    return "Donate your old clothes to extend their life!";
  }
};

/**
 * Answers a "How to" question for the forum search using Gemini.
 */
export const getRepairAdvice = async (query: string): Promise<string> => {
  // 没有 AI 客户端时，返回一个简单的 fallback 文案
  if (!ai) {
    return "Try gentle hand-washing, sewing loose seams, and air-drying your clothes.";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User is asking for advice on clothing repair or maintenance: "${query}". 
      Provide a concise, step-by-step guide (max 3 steps) suitable for a forum post summary. 
      Keep it encouraging and helpful.`,
    });
    // @ts-ignore
    return (
      response.text ||
      "We couldn't generate advice at this moment. Please try searching the forum manually."
    );
  } catch (error) {
    console.error("Error fetching advice:", error);
    return "Sorry, I'm having trouble connecting to the sustainability database right now.";
  }
};

/**
 * Verifies if an image contains a specific brand logo or tag.
 */
export const verifyBrandImage = async (imageSrc: string, brandName: string): Promise<boolean> => {
  // 没有 AI 客户端时，直接走“放行”策略（你原注释里也是这样考虑的）
  if (!ai) {
    return true;
  }

  try {
    // Extract base64 data and mime type
    const base64Data = imageSrc.split(",")[1];
    const mimeType = imageSrc.split(";")[0].split(":")[1];

    if (!base64Data || !mimeType) return false;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: `Analyze this image carefully. Does it contain a visible clothing label, tag, or logo that matches the brand "${brandName}"? 
                    Ignore small text differences, focus on the brand identity.
                    Answer strictly with "YES" or "NO".`,
          },
        ],
      },
    });

    // @ts-ignore
    const text = response.text?.trim().toUpperCase();
    console.log(`AI Verification for ${brandName}: ${text}`);
    return text?.includes("YES") || false;
  } catch (error) {
    console.error("Error verifying brand:", error);
    // Fail safe: API 出问题就不拦用户
    return true;
  }
};

// import { GoogleGenAI } from "@google/genai";

// // Initialize the Gemini client
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// /**
//  * Generates a quick sustainable fashion tip.
//  */
// export const getRecycleTip = async (): Promise<string> => {
//   try {
//     const response = await ai.models.generateContent({
//       model: 'gemini-2.5-flash',
//       contents: "Give me one short, punchy, 10-word tip about recycling clothes or sustainable fashion.",
//     });
//     return response.text || "Reuse, Reduce, Recycle your fashion!";
//   } catch (error) {
//     console.error("Error fetching tip:", error);
//     return "Donate your old clothes to extend their life!";
//   }
// };

// /**
//  * Answers a "How to" question for the forum search using Gemini.
//  */
// export const getRepairAdvice = async (query: string): Promise<string> => {
//   try {
//     const response = await ai.models.generateContent({
//       model: 'gemini-2.5-flash',
//       contents: `User is asking for advice on clothing repair or maintenance: "${query}". 
//       Provide a concise, step-by-step guide (max 3 steps) suitable for a forum post summary. 
//       Keep it encouraging and helpful.`,
//     });
//     return response.text || "We couldn't generate advice at this moment. Please try searching the forum manually.";
//   } catch (error) {
//     console.error("Error fetching advice:", error);
//     return "Sorry, I'm having trouble connecting to the sustainability database right now.";
//   }
// };

// /**
//  * Verifies if an image contains a specific brand logo or tag.
//  */
// export const verifyBrandImage = async (imageSrc: string, brandName: string): Promise<boolean> => {
//   try {
//     // Extract base64 data and mime type
//     const base64Data = imageSrc.split(',')[1];
//     const mimeType = imageSrc.split(';')[0].split(':')[1];

//     if (!base64Data || !mimeType) return false;

//     const response = await ai.models.generateContent({
//         model: 'gemini-2.5-flash',
//         contents: {
//             parts: [
//                 { 
//                     inlineData: { 
//                         mimeType: mimeType, 
//                         data: base64Data 
//                     } 
//                 },
//                 { 
//                     text: `Analyze this image carefully. Does it contain a visible clothing label, tag, or logo that matches the brand "${brandName}"? 
//                     Ignore small text differences, focus on the brand identity.
//                     Answer strictly with "YES" or "NO".` 
//                 }
//             ]
//         }
//     });
    
//     const text = response.text?.trim().toUpperCase();
//     console.log(`AI Verification for ${brandName}: ${text}`);
//     return text?.includes('YES') || false;

//   } catch (error) {
//     console.error("Error verifying brand:", error);
//     // Fail safe: If AI fails, we might want to allow it or block it. 
//     // For this demo, let's return true to not block the user if API key issues exist.
//     return true; 
//   }
// };
