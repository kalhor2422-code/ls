
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  username: string; // Used for unique identification (e.g. mobile)
  name: string;     // Full display name
  mobile: string;
  age: number;
  email: string;
  role: UserRole;
}

export interface WheelCategory {
  id: string;
  name: string;
  color: string;
}

// Colors based on the request (Pink, Blue, Yellow, Grey, Light Pink, Purple)
export const CATEGORIES: WheelCategory[] = [
  { id: 'spirituality', name: 'معنویت', color: '#ec4899' }, // Pink
  { id: 'family', name: 'خانوادگی', color: '#fbcfe8' },     // Light Pink
  { id: 'personal', name: 'فردی', color: '#d8b4fe' },       // Light Purple
  { id: 'social', name: 'اجتماعی', color: '#6b7280' },      // Grey
  { id: 'health', name: 'تندرستی', color: '#facc15' },      // Yellow
  { id: 'work', name: 'کار', color: '#2563eb' },            // Blue
];

export interface WheelEntry {
  id: string;
  userId: string;
  date: string; // ISO Date
  scores: Record<string, number>; // Category ID -> Score (1-10)
  geminiAdvice?: string;
  userEmailForPdf?: string;
}

export interface AdminSettings {
  introText: string;
  adviceTemplateLow: string; // For low average scores
  adviceTemplateHigh: string; // For high average scores
  adviceTemplateUnbalanced: string; // For lopsided wheels
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  introText: "به اپلیکیشن چرخ زندگی «مکتب کمال» خوش آمدید. این ابزار به شما کمک می‌کند تا تعادل را در جنبه‌های مختلف زندگی خود بسنجید. لطفاً به هر بخش صادقانه امتیاز دهید.",
  adviceTemplateLow: "به نظر می‌رسد در چندین جنبه نیاز به بازنگری دارید. پیشنهاد می‌کنیم روی یکی از بخش‌ها تمرکز کنید.",
  adviceTemplateHigh: "تبریک! شما تعادل خوبی در زندگی دارید. سعی کنید این روند را حفظ کنید.",
  adviceTemplateUnbalanced: "چرخ زندگی شما کمی نامتوازن است. برای حرکت روان‌تر در زندگی، باید به بخش‌های ضعیف‌تر توجه بیشتری کنید."
};
