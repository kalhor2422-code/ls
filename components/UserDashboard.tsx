
import React, { useState, useEffect } from 'react';
import { User, CATEGORIES, WheelEntry } from '../types';
import { getSettings, getUserHistory, saveWheelEntry } from '../services/storageService';
import { generateWheelAnalysis } from '../services/geminiService';
import WheelCanvas from './WheelCanvas';
import { Play, RotateCcw, Sparkles, TrendingUp, Share2, Download, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface UserDashboardProps {
  user: User;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [step, setStep] = useState<'intro' | 'rating' | 'animating' | 'result'>('intro');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [history, setHistory] = useState<WheelEntry[]>([]);
  const [geminiAdvice, setGeminiAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [emailForPdf, setEmailForPdf] = useState(user.email || '');
  const [pdfSent, setPdfSent] = useState(false);
  
  const settings = getSettings();

  useEffect(() => {
    setHistory(getUserHistory(user.id));
    
    // Initialize empty scores
    const initialScores: Record<string, number> = {};
    CATEGORIES.forEach(c => initialScores[c.id] = 5); // Default 5
    setScores(initialScores);
  }, [user.id]);

  const handleScoreChange = (val: number) => {
    if (selectedCategory) {
      setScores(prev => ({ ...prev, [selectedCategory]: val }));
    }
  };

  const startSimulation = () => {
    setStep('animating');
    setTimeout(() => {
      finishSimulation();
    }, 4000); // 3s roll + buffer
  };

  const finishSimulation = async () => {
    setStep('result');
    
    const previousEntry = history.length > 0 ? history[0] : null;
    const entry: WheelEntry = {
      id: crypto.randomUUID(),
      userId: user.id,
      date: new Date().toISOString(),
      scores: scores
    };

    setLoadingAdvice(true);
    // Include user name in prompt context via services if needed, currently passing entry.
    const advice = await generateWheelAnalysis(entry, previousEntry);
    setGeminiAdvice(advice);
    setLoadingAdvice(false);
    
    entry.geminiAdvice = advice;
    saveWheelEntry(entry);
    setHistory(prev => [entry, ...prev]);
  };

  const handleSendPdf = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailForPdf) {
        setPdfSent(true);
        // Simulate API call
        setTimeout(() => {
             alert(`فایل PDF نتایج به آدرس ${emailForPdf} ارسال شد.`);
             setPdfSent(false);
        }, 1500);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: `چرخ زندگی ${user.name}`,
                text: 'من چرخ زندگی خودم رو در اپلیکیشن مکتب کمال ساختم! شما هم امتحان کنید.',
                url: window.location.href
            });
        } catch (err) {
            console.error(err);
        }
    } else {
        alert("لینک کپی شد (شبیه‌سازی)");
    }
  };

  // Helper to get text based on standard deviation
  const getResultText = () => {
    const values = Object.values(scores) as number[];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev > 2) return settings.adviceTemplateUnbalanced;
    if (mean < 5) return settings.adviceTemplateLow;
    return settings.adviceTemplateHigh;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in-up">
      
      {/* Step 1: Intro */}
      {step === 'intro' && (
        <div className="glass dark:bg-slate-800/80 p-8 md:p-12 rounded-3xl shadow-2xl text-center space-y-8 border border-white/20 dark:border-slate-700">
          <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900 rounded-2xl mb-2">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-300" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 leading-tight">
             سلام {user.name} عزیز، <br/>
             به چرخ زندگی مکتب کمال خوش آمدید
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed whitespace-pre-wrap max-w-2xl mx-auto">
            {settings.introText}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {CATEGORIES.map(cat => (
                <div key={cat.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{backgroundColor: cat.color}}></div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{cat.name}</span>
                </div>
            ))}
          </div>

          <button 
            onClick={() => setStep('rating')}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-2xl font-bold text-xl transition shadow-xl hover:shadow-blue-500/30 flex items-center gap-3 mx-auto"
          >
            شروع ارزیابی
            <ArrowRight className="group-hover:translate-x-[-4px] transition-transform" />
          </button>
        </div>
      )}

      {/* Step 2: Rating */}
      {step === 'rating' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="glass dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700 order-2 lg:order-1">
             <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">امتیاز دهی</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-8">روی هر بخش از چرخ کلیک کنید و با استفاده از اهرم زیر، به خودتان امتیاز دهید.</p>
             
             {selectedCategory ? (
                <div className="bg-white dark:bg-slate-700 p-8 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-600 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full" style={{backgroundColor: CATEGORIES.find(c => c.id === selectedCategory)?.color}}></div>
                            <span className="font-extrabold text-xl text-slate-800 dark:text-white">
                                {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                            </span>
                        </div>
                        <span className="text-3xl font-black text-slate-800 dark:text-white">{scores[selectedCategory]}</span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        step="1"
                        value={scores[selectedCategory]}
                        onChange={(e) => handleScoreChange(parseInt(e.target.value))}
                        className="w-full h-3 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-sm font-medium text-slate-400 mt-4">
                        <span>ضعیف (۱)</span>
                        <span>عالی (۱۰)</span>
                    </div>
                </div>
             ) : (
                <div className="h-40 flex flex-col gap-3 items-center justify-center bg-slate-50 dark:bg-slate-700/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400">
                    <span className="text-4xl">👆</span>
                    <span>برای ثبت امتیاز، روی نمودار کلیک کنید</span>
                </div>
             )}

             <button 
                onClick={startSimulation}
                className="w-full mt-8 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg transition shadow-lg flex justify-center items-center gap-2"
             >
                <Play size={20} fill="currentColor" />
                ترسیم چرخ زندگی
             </button>
          </div>

          <div className="flex justify-center order-1 lg:order-2 p-4">
            <WheelCanvas 
                scores={scores} 
                width={400} 
                height={400} 
                interactive={true} 
                onSectionClick={setSelectedCategory} 
            />
          </div>
        </div>
      )}

      {/* Step 3: Animating */}
      {step === 'animating' && (
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-12 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200">در حال آنالیز تعادل زندگی شما...</h2>
            <div className="w-full overflow-hidden py-16 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent relative">
                 <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-300 dark:bg-slate-600"></div>
                 <WheelCanvas scores={scores} width={250} height={250} animating={true} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 animate-pulse font-medium">{user.name} عزیز، لطفاً صبر کنید</p>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 'result' && (
        <div className="space-y-8 animate-fade-in-up">
            <div className="glass dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 bg-amber-400 text-amber-900 font-bold rounded-bl-2xl shadow-md z-10">
                    مکتب کمال
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Sparkles className="text-yellow-500 fill-yellow-500" />
                        کارنامه چرخ زندگی {user.name}
                    </h2>
                    <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 px-4 py-2 rounded-xl font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 transition"
                    >
                        <Share2 size={18} />
                        اشتراک گذاری
                    </button>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-2xl mb-8 border border-blue-100 dark:border-blue-800">
                    <p className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-2">وضعیت کلی:</p>
                    <p className="text-blue-800 dark:text-blue-200 leading-relaxed">{getResultText()}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-8">
                     <div className="md:col-span-1 flex justify-center">
                         <WheelCanvas scores={scores} width={250} height={250} />
                     </div>
                     <div className="md:col-span-2 prose prose-slate dark:prose-invert max-w-none">
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">💡 تحلیل هوشمند و پیشنهادات (Gemini AI)</h3>
                        {loadingAdvice ? (
                            <div className="flex flex-col gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line shadow-inner">
                                {geminiAdvice}
                            </div>
                        )}
                    </div>
                </div>

                {/* Email PDF Section */}
                <div className="bg-slate-100 dark:bg-slate-700/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-600 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                        <div className="p-3 bg-white dark:bg-slate-600 rounded-full shadow-sm">
                            <Download size={24} className="text-red-500" />
                        </div>
                        <div>
                            <p className="font-bold">دریافت فایل PDF نتایج</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">تحلیل کامل را در ایمیل خود دریافت کنید</p>
                        </div>
                    </div>
                    <form onSubmit={handleSendPdf} className="flex gap-2 w-full md:w-auto">
                        <input 
                            type="email" 
                            required
                            placeholder="آدرس ایمیل شما" 
                            value={emailForPdf}
                            onChange={(e) => setEmailForPdf(e.target.value)}
                            className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                            style={{direction: 'ltr'}}
                        />
                        <button disabled={pdfSent} className="bg-slate-800 dark:bg-white dark:text-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 min-w-[100px]">
                            {pdfSent ? 'ارسال شد' : 'ارسال'}
                        </button>
                    </form>
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={() => setStep('rating')} 
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium px-4 py-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                        <RotateCcw size={18} />
                        ارزیابی مجدد
                    </button>
                </div>
            </div>

            {history.length > 1 && (
                <div className="glass dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-white/20 dark:border-slate-700">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                        <TrendingUp size={20} className="text-green-500" />
                        روند پیشرفت شما
                    </h3>
                    <div className="h-72">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history.slice(0, 5).reverse().map(h => ({
                                date: new Date(h.date).toLocaleDateString('fa-IR'),
                                avg: ((Object.values(h.scores) as number[]).reduce((a, b) => a + b, 0) / 6).toFixed(1)
                            }))}>
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis domain={[0, 10]} stroke="#94a3b8" />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={4} dot={{r: 6, fill:'#3b82f6', strokeWidth:2, stroke:'#fff'}} name="میانگین کل" />
                            </LineChart>
                         </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
