
import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { registerUser, logoutUser, getCurrentUser } from './services/storageService';
import { User } from './types';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { LogOut, User as UserIcon, Moon, Sun, Heart, CheckCircle } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  
  // Lead Generation Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    age: '',
    email: ''
  });
  
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    
    // Check system preference or local storage
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.email || !formData.age) return;
    
    const registeredUser = registerUser({
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        age: parseInt(formData.age)
    });
    
    setUser(registeredUser);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setFormData({ name: '', mobile: '', age: '', email: '' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="absolute top-4 left-4">
             <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-slate-800 dark:text-white hover:bg-white/30 transition">
                {darkMode ? <Sun size={24} /> : <Moon size={24} />}
             </button>
        </div>
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-white/20 animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">مکتب کمال</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">به اپلیکیشن چرخ زندگی خوش آمدید</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">نام و نام خانوادگی</label>
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="مثال: علی محمدی"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">شماره موبایل</label>
                    <input
                        type="tel"
                        required
                        value={formData.mobile}
                        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        placeholder="0912..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">سن</label>
                    <input
                        type="number"
                        required
                        min="10"
                        max="100"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        placeholder="مثال: 30"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ایمیل</label>
                <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="example@mail.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                />
            </div>

            <button
                type="submit"
                className="w-full mt-4 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
                <span>شروع ارزیابی</span>
                <CheckCircle size={20} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Router>
        <div className="min-h-screen flex flex-col font-sans selection:bg-pink-500 selection:text-white">
            {/* Header */}
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md rotate-3 hover:rotate-0 transition">
                            <span className="text-white font-bold text-xl">M</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-800 dark:text-white leading-none">مکتب کمال</span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">چرخ زندگی</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 md:gap-4">
                        <button 
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="hidden md:flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
                            <UserIcon size={18} />
                            <span className="text-sm font-bold truncate max-w-[150px]">{user.name}</span>
                        </div>
                        
                        <button 
                            onClick={handleLogout}
                            className="text-white bg-red-500 hover:bg-red-600 p-2.5 rounded-full transition shadow-md shadow-red-200 dark:shadow-none"
                            title="خروج"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
                {user.role === 'ADMIN' ? (
                    <AdminDashboard />
                ) : (
                    <UserDashboard user={user} />
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 mt-auto transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center">
                    <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        © {new Date().getFullYear()} تمامی حقوق محفوظ است.
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm">
                        <span>توسعه توسط واحد IT مکتب کمال</span>
                        <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" />
                    </div>
                </div>
            </footer>
        </div>
    </Router>
  );
};

export default App;
