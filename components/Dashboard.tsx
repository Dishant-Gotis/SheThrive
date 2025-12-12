
import React, { useEffect, useState } from 'react';
import { UserProfile, CycleData, CyclePhase, Reminder, Goal, SymptomLog, Mood } from '../types';
import { Activity, Moon, Droplets, ArrowRight, ShieldCheck, Target, Bell, CheckCircle2, Sparkles, Sun, Calendar as CalendarIcon, Quote, Heart, Users, Smile, Frown, CloudRain, Zap, Meh, Thermometer } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { mockBackend } from '../services/mockBackend';
import { SYMPTOM_OPTIONS } from '../constants';

interface DashboardProps {
  user: UserProfile;
  cycle: CycleData;
  logs: SymptomLog[];
  changeTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, cycle, logs, changeTab }) => {
  const [activeReminders, setActiveReminders] = useState<Reminder[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [quickMoodLogged, setQuickMoodLogged] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    
    const loadWidgets = async () => {
        try {
            const reminders = await mockBackend.reminders.getReminders(user.id);
            setActiveReminders(reminders.filter(r => r.isActive));
            
            const goals = await mockBackend.goals.getGoals(user.id);
            setActiveGoals(goals.filter(g => g.status === 'active').slice(0, 2)); // Show top 2
        } catch (e) {
            console.error("Failed to load dashboard widgets", e);
        }
    };
    loadWidgets();
  }, [user?.id]);

  // Mock calculation for cycle day
  const today = new Date();
  const startDate = new Date(cycle.startDate);
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const dayOfCycle = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Default to day 1 if calculation fails
  
  // Determine phase roughly
  let currentPhase = CyclePhase.FOLLICULAR;
  if (dayOfCycle <= cycle.periodLength) currentPhase = CyclePhase.MENSTRUAL;
  else if (dayOfCycle >= 12 && dayOfCycle <= 16) currentPhase = CyclePhase.OVULATION;
  else if (dayOfCycle > 16) currentPhase = CyclePhase.LUTEAL;

  const chartData = [
    { name: 'Completed', value: dayOfCycle },
    { name: 'Remaining', value: Math.max(0, cycle.length - dayOfCycle) },
  ];
  const COLORS = ['#fb7185', '#fce7f3']; // rose-400, pink-100

  // Generate week dates for the calendar strip
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + i); // Start from Sunday
    return d;
  });

  const handleQuickLog = () => {
     setQuickMoodLogged(true);
     setTimeout(() => setQuickMoodLogged(false), 3000);
  };

  // Check if we have a log for today
  const todayString = new Date().toISOString().split('T')[0];
  const todaysLog = logs.find(l => l.date === todayString);
  const latestLog = logs[0]; // Assuming logs are sorted by date desc

  const getMoodIcon = (mood: Mood) => {
      switch(mood) {
          case Mood.HAPPY: return <Smile size={28} className="text-emerald-500" />;
          case Mood.SAD: return <Frown size={28} className="text-blue-500" />;
          case Mood.ENERGETIC: return <Sun size={28} className="text-amber-500" />;
          case Mood.TIRED: return <CloudRain size={28} className="text-slate-500" />;
          case Mood.IRRITABLE: return <Zap size={28} className="text-orange-500" />;
          case Mood.ANXIOUS: return <Meh size={28} className="text-purple-500" />;
          default: return <Smile size={28} className="text-slate-400" />;
      }
  }

  return (
    <div className="space-y-8 pb-24 md:pb-0 font-['Nunito']">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Hello, {user.firstName || 'Bestie'}! <span className="inline-block animate-bounce">✨</span></h2>
          <p className="text-slate-500 font-bold mt-1">Here is your private daily vibe check.</p>
        </div>
        <div className="bg-white border-2 border-rose-100 text-rose-500 px-4 py-1.5 rounded-full text-xs font-black shadow-sm flex items-center gap-1">
          <ShieldCheck size={14} fill="currentColor" /> Encrypted Mode
        </div>
      </header>

      {/* Weekly Calendar Strip */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 overflow-x-auto">
        <div className="flex justify-between min-w-[300px]">
           {weekDates.map((date, idx) => {
             const isToday = date.toDateString() === new Date().toDateString();
             const isPeriod = idx === 1 || idx === 2; // Mock logic
             return (
               <div key={idx} className={`flex flex-col items-center gap-2 p-3 rounded-2xl min-w-[3.5rem] transition-all ${isToday ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 scale-110' : 'hover:bg-slate-50'}`}>
                  <span className={`text-xs font-bold ${isToday ? 'text-rose-100' : 'text-slate-400'}`}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="text-lg font-black">{date.getDate()}</span>
                  {isPeriod && !isToday && <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>}
                  {isToday && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
               </div>
             );
           })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Hero) */}
        <div className="xl:col-span-2 space-y-6">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-rose-50 to-white rounded-[2.5rem] p-8 shadow-xl shadow-pink-100/50 border-4 border-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-pink-100/50 rounded-bl-full -mr-8 -mt-8 z-0 transition-all group-hover:scale-110"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
                <div className="text-center md:text-left">
                  <p className="text-xs font-extrabold text-rose-400 uppercase tracking-widest bg-white/50 inline-block px-3 py-1 rounded-full mb-2">Current Cycle</p>
                  <div className="flex items-baseline justify-center md:justify-start gap-2 mt-2">
                    <span className="text-7xl font-black text-slate-800 tracking-tighter">Day {dayOfCycle}</span>
                    <span className="text-slate-400 font-bold text-xl">/ {cycle.length}</span>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-rose-500 rounded-2xl text-sm font-bold border-2 border-rose-100 shadow-sm">
                    <Moon size={18} className="fill-rose-500" />
                    <span>{currentPhase} Phase</span>
                  </div>
                  <p className="mt-6 text-slate-500 font-bold text-sm max-w-sm">
                    💡 Predicted ovulation in <span className="font-black text-rose-500">3 days</span>. Energy is high! Use it for complex tasks.
                  </p>
                </div>
                
                <div className="h-40 w-40 relative flex-shrink-0">
                  <div className="absolute inset-0 flex items-center justify-center text-rose-300">
                      <Sun size={32} />
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          cornerRadius={10}
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Mood Logger OR Today's Status */}
            {todaysLog ? (
                <div className="bg-white rounded-[2.5rem] p-6 border-4 border-white shadow-lg shadow-emerald-50/50">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">Today's Vibe</h3>
                            <p className="text-slate-400 text-xs font-bold mt-1">Logged just now</p>
                        </div>
                        <button onClick={() => changeTab('log')} className="text-rose-500 text-xs font-black bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100">Edit</button>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                            {getMoodIcon(todaysLog.mood)}
                            <p className="text-center font-bold text-xs mt-2 text-slate-600">{todaysLog.mood}</p>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">Symptoms</p>
                            <div className="flex flex-wrap gap-2">
                                {todaysLog.symptoms.length > 0 ? todaysLog.symptoms.map(s => (
                                    <span key={s} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">{s}</span>
                                )) : <span className="text-slate-400 text-xs italic font-bold">No symptoms logged</span>}
                            </div>
                            {todaysLog.notes && (
                                <div className="mt-4 bg-slate-50 p-3 rounded-xl text-slate-500 text-xs italic border border-slate-100">
                                    "{todaysLog.notes}"
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] p-6 border-4 border-white shadow-lg shadow-purple-50">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-slate-800 text-lg">How are you feeling right now?</h3>
                    {quickMoodLogged && <span className="text-emerald-500 text-xs font-bold animate-fade-in flex items-center gap-1"><CheckCircle2 size={12}/> Logged!</span>}
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {['😊', '😫', '😡', '🌿'].map((emoji, i) => (
                        <button 
                        key={i} 
                        onClick={handleQuickLog}
                        className="text-3xl bg-slate-50 hover:bg-rose-50 hover:scale-110 transition-all py-4 rounded-2xl border border-slate-100"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
                </div>
            )}
        </div>

        {/* Right Column (Widgets) */}
        <div className="space-y-6">
            
            {/* Daily Wisdom Card */}
            <div className="bg-indigo-500 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
               <Quote className="absolute top-4 right-4 text-white/20" size={48} />
               <div className="relative z-10">
                  <h3 className="font-bold text-indigo-100 text-sm uppercase tracking-wider mb-2">Daily Wisdom</h3>
                  <p className="text-lg font-bold leading-relaxed">
                    "Your cycle is a vital sign, not just a monthly visitor. Listen to what your body is whispering."
                  </p>
                  <div className="mt-6 flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">ST</div>
                     <span className="text-xs font-medium text-indigo-100">SheThrive Team</span>
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-400 rounded-full blur-2xl"></div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => changeTab('log')}
                className="bg-white hover:bg-slate-50 transition-colors rounded-[2rem] p-5 text-left flex flex-col justify-between border-2 border-slate-100 shadow-sm group h-32"
              >
                <div className="bg-rose-100 w-10 h-10 rounded-full flex items-center justify-center text-rose-500">
                  <Activity size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-slate-800 font-black text-lg">Log</p>
                  <p className="text-slate-400 text-xs font-bold">Symptoms</p>
                </div>
              </button>
              
              <button 
                 onClick={() => changeTab('insights')}
                 className="bg-white hover:bg-slate-50 transition-colors rounded-[2rem] p-5 text-left flex flex-col justify-between border-2 border-slate-100 shadow-sm group h-32"
              >
                <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center text-purple-500">
                  <Sparkles size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-slate-800 font-black text-lg">Ask AI</p>
                  <p className="text-slate-400 text-xs font-bold">Insights</p>
                </div>
              </button>
            </div>

            {/* Community Pulse */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                     <Users size={16} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Community Pulse</h4>
               </div>
               <p className="text-slate-500 text-xs font-semibold">
                  <span className="text-emerald-500 font-black">1,204</span> women prioritized their wellness today. You are not alone! 💖
               </p>
            </div>
        </div>
      </div>
    
      {/* Activity & Reminders Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Goals Widget */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="font-black text-slate-800 text-lg flex items-center gap-2"><Target size={22} className="text-rose-400"/> Daily Goals</h3>
                 <button onClick={() => changeTab('goals')} className="text-xs font-bold text-slate-400 hover:text-rose-500 bg-slate-50 px-3 py-1 rounded-full">View All</button>
             </div>
             <div className="space-y-4">
                 {activeGoals && activeGoals.length > 0 ? activeGoals.map(goal => (
                     <div key={goal.id} className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-100 hover:border-rose-200 transition-colors">
                         <div>
                             <p className="text-sm font-extrabold text-slate-700">{goal.name}</p>
                             <p className="text-xs font-bold text-slate-400">{goal.currentValue} / {goal.targetValue} {goal.unit}</p>
                         </div>
                         <div className="h-10 w-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center bg-white">
                            {goal.currentValue >= goal.targetValue ? <CheckCircle2 className="text-emerald-400" size={24} /> : <div className="text-xs font-black text-rose-400">{Math.round((goal.currentValue/goal.targetValue)*100)}%</div>}
                         </div>
                     </div>
                 )) : (
                     <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 text-sm font-bold">No goals set yet.</p>
                     </div>
                 )}
             </div>
          </div>

          {/* Reminders Widget */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="font-black text-slate-800 text-lg flex items-center gap-2"><Bell size={22} className="text-purple-400"/> Reminders</h3>
                 <button onClick={() => changeTab('reminders')} className="text-xs font-bold text-slate-400 hover:text-rose-500 bg-slate-50 px-3 py-1 rounded-full">Manage</button>
             </div>
             <div className="space-y-3">
                 {activeReminders && activeReminders.length > 0 ? activeReminders.slice(0, 3).map(rem => (
                     <div key={rem.id} className="flex items-center gap-4 bg-purple-50/50 p-3 rounded-2xl border border-purple-50">
                         <div className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]"></div>
                         <div className="flex-1">
                             <p className="text-sm font-bold text-slate-700">{rem.name}</p>
                             <p className="text-xs font-bold text-purple-400">{rem.time}</p>
                         </div>
                     </div>
                 )) : (
                    <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 text-sm font-bold">No active reminders.</p>
                    </div>
                 )}
             </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
