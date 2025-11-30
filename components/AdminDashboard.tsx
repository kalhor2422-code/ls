
import React, { useState, useEffect } from 'react';
import { User, AdminSettings, CATEGORIES } from '../types';
import { getSettings, saveSettings, getAllUsers, getAllHistory } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Save, Mail, MessageCircle, Smartphone } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'notify'>('settings');
  const [settings, setSettings] = useState<AdminSettings>(getSettings());
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    setUsers(getAllUsers());
    
    // Calculate Stats (Average scores per category across all users)
    const allEntries = getAllHistory();
    if (allEntries.length > 0) {
        const categoryTotals: Record<string, number> = {};
        const categoryCounts: Record<string, number> = {};
        
        allEntries.forEach(entry => {
            Object.entries(entry.scores).forEach(([cat, score]) => {
                categoryTotals[cat] = (categoryTotals[cat] || 0) + score;
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
        });

        const chartData = CATEGORIES.map(cat => ({
            name: cat.name,
            avg: categoryCounts[cat.id] ? (categoryTotals[cat.id] / categoryCounts[cat.id]).toFixed(1) : 0
        }));
        setStats(chartData);
    }
  }, []);

  const handleSaveSettings = () => {
    saveSettings(settings);
    alert('تنظیمات با موفقیت ذخیره شد.');
  };

  const sendFakeNotification = (type: string) => {
    alert(`پیام ${type} برای ${users.length} کاربر در صف ارسال قرار گرفت. (شبیه سازی)`);
  };

  return (
    <div className="glass dark:bg-slate-800 rounded-3xl shadow-xl p-6 md:p-8 min-h-[600px] border border-white/20 dark:border-slate-700 animate-fade-in-up">
      <h2 className="text-2xl font-black mb-8 text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-4">پنل مدیریت مکتب کمال</h2>
      
      <div className="flex flex-wrap gap-4 mb-8">
        <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-xl font-bold transition shadow-sm ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
        >
            تنظیمات عمومی
        </button>
        <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-bold transition shadow-sm ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
        >
            آمار و کاربران
        </button>
        <button 
            onClick={() => setActiveTab('notify')}
            className={`px-6 py-3 rounded-xl font-bold transition shadow-sm ${activeTab === 'notify' ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
        >
            ارسال اعلان
        </button>
      </div>

      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">متن توضیحات اولیه (صفحه اصلی)</label>
                <textarea 
                    value={settings.introText}
                    onChange={(e) => setSettings({...settings, introText: e.target.value})}
                    className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white min-h-[120px]"
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الگوی پیام برای امتیاز پایین</label>
                    <input 
                        type="text" 
                        value={settings.adviceTemplateLow}
                        onChange={(e) => setSettings({...settings, adviceTemplateLow: e.target.value})}
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الگوی پیام برای عدم تعادل</label>
                    <input 
                        type="text" 
                        value={settings.adviceTemplateUnbalanced}
                        onChange={(e) => setSettings({...settings, adviceTemplateUnbalanced: e.target.value})}
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>
            </div>

            <button 
                onClick={handleSaveSettings}
                className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20"
            >
                <Save size={20} />
                ذخیره تغییرات
            </button>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-8">
            <div className="h-80 w-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold mb-6 text-slate-700 dark:text-slate-200">میانگین امتیازات کاربران</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} />
                        <YAxis domain={[0, 10]} stroke="#64748b" tick={{fill: '#64748b'}} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="avg" fill="#3b82f6" name="میانگین" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div>
                <h3 className="text-lg font-bold mb-6 text-slate-700 dark:text-slate-200">لیست کاربران ({users.length})</h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                            <tr>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">نام کاربر</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">موبایل</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">سن</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">نقش</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ایمیل</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{u.name || u.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 dir-ltr">{u.mobile || u.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{u.age}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{u.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'notify' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button onClick={() => sendFakeNotification('پیامک')} className="flex flex-col items-center justify-center p-8 border-2 border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 transition gap-4 group">
                <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full group-hover:scale-110 transition">
                    <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">ارسال پیامک انبوه</span>
            </button>
            <button onClick={() => sendFakeNotification('واتساپ')} className="flex flex-col items-center justify-center p-8 border-2 border-slate-200 dark:border-slate-700 rounded-2xl hover:border-green-500 dark:hover:border-green-500 bg-white dark:bg-slate-900 hover:bg-green-50 dark:hover:bg-slate-800 transition gap-4 group">
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full group-hover:scale-110 transition">
                    <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-300" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">ارسال پیام واتساپ</span>
            </button>
            <button onClick={() => sendFakeNotification('ایمیل')} className="flex flex-col items-center justify-center p-8 border-2 border-slate-200 dark:border-slate-700 rounded-2xl hover:border-red-500 dark:hover:border-red-500 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-slate-800 transition gap-4 group">
                <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full group-hover:scale-110 transition">
                    <Mail className="w-8 h-8 text-red-600 dark:text-red-300" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">ارسال ایمیل خبرنامه</span>
            </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
