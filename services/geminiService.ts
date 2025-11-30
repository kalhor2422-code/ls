import { GoogleGenAI } from "@google/genai";
import { WheelEntry, CATEGORIES } from '../types';

// NOTE: In a real production app, you should not expose API keys in frontend code.
// For this demo, we assume process.env.API_KEY is available or we fail gracefully.
// The user will likely need to supply their own key if not using a build pipeline that injects it.

export const generateWheelAnalysis = async (
  currentEntry: WheelEntry,
  previousEntry: WheelEntry | null
): Promise<string> => {
  
  if (!process.env.API_KEY) {
    console.warn("API Key missing for Gemini.");
    return "سرویس تحلیل هوشمند در حال حاضر در دسترس نیست. لطفا کلید API را بررسی کنید.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare prompt data
  const currentScores = Object.entries(currentEntry.scores).map(([k, v]) => {
    const catName = CATEGORIES.find(c => c.id === k)?.name || k;
    return `${catName}: ${v}`;
  }).join(', ');

  let comparisonText = "این اولین ثبت کاربر است.";
  if (previousEntry) {
    const prevScores = Object.entries(previousEntry.scores).map(([k, v]) => {
        const catName = CATEGORIES.find(c => c.id === k)?.name || k;
        return `${catName}: ${v}`;
    }).join(', ');
    comparisonText = `امتیازات هفته گذشته: ${prevScores}.`;
  }

  const prompt = `
    شما یک مشاور روانشناسی و کوچ زندگی هوشمند هستید.
    اطلاعات زیر مربوط به "چرخ زندگی" یک کاربر است.
    
    امتیازات فعلی (از 1 تا 10):
    ${currentScores}
    
    تاریخچه:
    ${comparisonText}
    
    لطفاً یک تحلیل کوتاه، امیدوارکننده و کاربردی به زبان فارسی ارائه دهید.
    1. نقاط قوت را شناسایی کنید.
    2. بخشی که کمترین امتیاز را دارد شناسایی کرده و یک راهکار عملی کوچک پیشنهاد دهید.
    3. وضعیت کلی تعادل زندگی را بررسی کنید.
    
    پاسخ باید صمیمی و مستقیم خطاب به کاربر باشد. حداکثر 200 کلمه.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "خطا در دریافت پاسخ از هوش مصنوعی.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "متاسفانه مشکلی در ارتباط با هوش مصنوعی پیش آمد. لطفاً اتصال اینترنت خود را بررسی کنید.";
  }
};