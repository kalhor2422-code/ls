import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        // خط زیر برای استقرار در GitHub Pages ضروری است
        // نام ریپازیتوری شما (ls) به عنوان Base Path تنظیم شده است.
        base: '/ls/', 
        
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        define: {
            // نکته: تزریق API Key به این روش برای پروژه های کلاینت-ساید توصیه نمی شود.
            // کلید API شما در نهایت در سورس کد نهایی قابل مشاهده خواهد بود.
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});
