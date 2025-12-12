
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PrivacyControls from './PrivacyControls';
import { Mood } from '../types';
import { SYMPTOM_OPTIONS } from '../constants';
import { mockBackend } from '../services/mockBackend';
import { ChevronRight, Calendar, Smile, Sun, CloudRain, Frown, Zap, Meh, Activity, ShieldCheck, Sparkles, Loader2, AlertCircle, HelpCircle } from 'lucide-react';

const OnboardingFlow: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Data States
  const [cycleData, setCycleData] = useState({
      lastPeriodDate: '',
      cycleLength: 28,
      periodLength: 5
  });

  const [moodData, setMoodData] = useState<{mood: Mood | null, symptoms: string[]}>({
      mood: null,
      symptoms: []
  });

  const [profileData, setProfileData] = useState({
    dateOfBirth: '',
    gender: 'Female', // Default
  });

  // Validation Logic
  const validateCycleData = () => {
    const newErrors: {[key: string]: string} = {};
    const today = new Date();
    const selectedDate = new Date(cycleData.lastPeriodDate);

    if (!cycleData.lastPeriodDate) {
        newErrors.date = "Please select a date.";
    } else if (selectedDate > today) {
        newErrors.date = "Date cannot be in the future.";
    } else if ((today.getTime() - selectedDate.getTime()) / (1000 * 3600 * 24) > 90) {
        newErrors.date = "Date is too far in the past (>90 days).";
    }

    if (cycleData.cycleLength < 21 || cycleData.cycleLength > 45) {
        newErrors.cycleLength = "Typical cycles are 21-45 days. Please double check.";
    }

    if (cycleData.periodLength < 2 || cycleData.periodLength > 10) {
        newErrors.periodLength = "Typical periods are 2-10 days.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCycleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validateCycleData()) {
          setStep(2);
      }
  };

  const handleMoodSubmit = () => {
      setStep(3);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Basic age validation
      const birthDate = new Date(profileData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13 || age > 100) {
          setErrors({ dob: "Please enter a valid birth date (13+)." });
          return;
      }
      setErrors({});
      setStep(4);
  };

  const completeConfiguration = async () => {
      if (!user) return;
      setIsConfiguring(true);

      // simulate calculation/AI config time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 1. Save Cycle Data
      await mockBackend.cycle.saveCycle({
          userId: user.id,
          startDate: cycleData.lastPeriodDate,
          length: cycleData.cycleLength,
          periodLength: cycleData.periodLength
      });

      // 2. Save Initial Log (if provided)
      if (moodData.mood) {
          await mockBackend.logs.createLog(user.id, {
              date: new Date().toISOString().split('T')[0],
              symptoms: moodData.symptoms,
              severity: 5,
              mood: moodData.mood,
              notes: 'Initial configuration log'
          });
      }

      // 3. Update Profile
      await updateUser({ 
          ...profileData,
          isOnboardingComplete: true 
      });
      
      setIsConfiguring(false);
  };

  const toggleSymptom = (symptom: string) => {
      if (moodData.symptoms.includes(symptom)) {
          setMoodData({ ...moodData, symptoms: moodData.symptoms.filter(s => s !== symptom) });
      } else {
          setMoodData({ ...moodData, symptoms: [...moodData.symptoms, symptom] });
      }
  };

  const MoodOption = ({ m, icon: Icon, label }: { m: Mood, icon: any, label: string }) => (
    <button
      onClick={() => setMoodData({ ...moodData, mood: m })}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
        moodData.mood === m 
          ? 'bg-rose-50 border-rose-500 text-rose-600 ring-2 ring-rose-200 transform scale-105 shadow-sm' 
          : 'bg-white border-slate-100 text-slate-400 hover:border-rose-300 hover:text-rose-400'
      }`}
    >
      <Icon size={28} />
      <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
    </button>
  );

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md font-['Nunito']">
      
      {/* Modal Card */}
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-fade-in-up border-4 border-white">
        
        {/* Config Loading Overlay */}
        {isConfiguring && (
            <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 relative">
                    <Loader2 size={48} className="text-rose-500 animate-spin" />
                    <Sparkles size={24} className="text-yellow-400 absolute top-0 right-0 animate-bounce" />
                </div>
                <h2 className="text-2xl font-black text-slate-800">Configuring App...</h2>
                <p className="text-slate-500 font-bold mt-2 text-sm max-w-xs mx-auto">
                    Personalizing your dashboard phases and AI insights based on your cycle data.
                </p>
            </div>
        )}

        {/* Progress Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-2">
                 <div className="bg-rose-500 text-white p-1.5 rounded-lg">
                    <Sparkles size={16} fill="currentColor" />
                 </div>
                 <span className="text-sm font-black text-slate-700 uppercase tracking-wide">Setup Wizard</span>
             </div>
             <div className="flex gap-1">
                 {[1, 2, 3, 4].map(s => (
                     <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-rose-500' : 'w-2 bg-slate-200'}`}></div>
                 ))}
             </div>
        </div>

        <div className="p-8">
            {/* Step 1: Cycle Setup */}
            {step === 1 && (
                <div className="animate-fade-in">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Let's get in sync.</h2>
                    <p className="text-slate-500 font-bold mb-6 text-sm">To configure your dashboard, we need to know where you are in your cycle.</p>
                    
                    <form onSubmit={handleCycleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                                <Calendar size={14} /> When did your last period start?
                            </label>
                            <input 
                                type="date"
                                required
                                className={`w-full px-5 py-4 rounded-2xl border-2 bg-white text-slate-900 focus:border-rose-400 outline-none font-bold shadow-sm ${errors.date ? 'border-red-400' : 'border-rose-100'}`}
                                value={cycleData.lastPeriodDate}
                                onChange={(e) => setCycleData({...cycleData, lastPeriodDate: e.target.value})}
                            />
                            {errors.date && <p className="text-red-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.date}</p>}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                                    Cycle Length <HelpCircle size={12} className="text-slate-300"/>
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        placeholder="28"
                                        min="20" max="45"
                                        className={`w-full px-5 py-3 rounded-2xl border-2 bg-white text-slate-900 focus:border-rose-400 outline-none font-bold ${errors.cycleLength ? 'border-red-400' : 'border-slate-100'}`}
                                        value={cycleData.cycleLength}
                                        onChange={(e) => setCycleData({...cycleData, cycleLength: parseInt(e.target.value) || 0})}
                                    />
                                    <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-xs">Days</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-semibold pl-1">Days between periods</p>
                                {errors.cycleLength && <p className="text-red-500 text-xs font-bold">{errors.cycleLength}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider ml-1">Period Length</label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        placeholder="5"
                                        min="2" max="10"
                                        className={`w-full px-5 py-3 rounded-2xl border-2 bg-white text-slate-900 focus:border-rose-400 outline-none font-bold ${errors.periodLength ? 'border-red-400' : 'border-slate-100'}`}
                                        value={cycleData.periodLength}
                                        onChange={(e) => setCycleData({...cycleData, periodLength: parseInt(e.target.value) || 0})}
                                    />
                                    <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-xs">Days</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-semibold pl-1">How long it lasts</p>
                                {errors.periodLength && <p className="text-red-500 text-xs font-bold">{errors.periodLength}</p>}
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={!cycleData.lastPeriodDate}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg mt-4 hover:bg-slate-800 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200"
                        >
                            Next <ChevronRight size={18} strokeWidth={3} />
                        </button>
                    </form>
                </div>
            )}

            {/* Step 2: Health & Mood */}
            {step === 2 && (
                <div className="animate-fade-in">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">How do you feel today?</h2>
                    <p className="text-slate-500 font-bold mb-6 text-sm">We'll set this as your first log entry.</p>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="grid grid-cols-3 gap-2">
                              <MoodOption m={Mood.HAPPY} icon={Smile} label="Happy" />
                              <MoodOption m={Mood.ENERGETIC} icon={Sun} label="Energetic" />
                              <MoodOption m={Mood.TIRED} icon={CloudRain} label="Tired" />
                              <MoodOption m={Mood.SAD} icon={Frown} label="Sad" />
                              <MoodOption m={Mood.IRRITABLE} icon={Zap} label="Irritable" />
                              <MoodOption m={Mood.ANXIOUS} icon={Meh} label="Anxious" />
                            </div>
                        </div>

                        <div>
                             <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Symptoms</label>
                             <div className="flex flex-wrap gap-2">
                              {SYMPTOM_OPTIONS.slice(0, 8).map((symptom) => (
                                <button
                                  key={symptom}
                                  onClick={() => toggleSymptom(symptom)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    moodData.symptoms.includes(symptom)
                                      ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                                      : 'bg-white text-slate-500 border-2 border-slate-100 hover:border-rose-200'
                                  }`}
                                >
                                  {symptom}
                                </button>
                              ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleMoodSubmit}
                            disabled={!moodData.mood}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg mt-2 hover:bg-slate-800 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200"
                        >
                            Continue <ChevronRight size={18} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Personalization */}
            {step === 3 && (
                <div className="animate-fade-in">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Almost there.</h2>
                    <p className="text-slate-500 font-bold mb-6 text-sm">A few details to personalize your AI insights.</p>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider ml-1">Date of Birth</label>
                            <input 
                                type="date"
                                required
                                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 focus:border-rose-400 outline-none font-bold"
                                value={profileData.dateOfBirth}
                                onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                            />
                            {errors.dob && <p className="text-red-500 text-xs font-bold">{errors.dob}</p>}
                        </div>
                         <div className="space-y-2">
                            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider ml-1">Gender Identity</label>
                            <select
                                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-rose-400 outline-none bg-white font-bold text-slate-900"
                                value={profileData.gender}
                                onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                            >
                                <option value="Female">Female</option>
                                <option value="Non-binary">Non-binary</option>
                                <option value="Male">Male</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg mt-4 hover:bg-slate-800 flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl shadow-slate-200"
                        >
                            Next <ChevronRight size={18} strokeWidth={3} />
                        </button>
                    </form>
                </div>
            )}

            {/* Step 4: Privacy & Finish */}
            {step === 4 && (
                <div className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                            <ShieldCheck size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Privacy First.</h2>
                    </div>
                    <p className="text-slate-500 font-bold mb-6 text-sm">
                        Your data is encrypted. You control what is shared.
                    </p>
                    
                    <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar mb-6">
                        <PrivacyControls userId={user.id} isInOnboarding={true} />
                    </div>

                    <button 
                        onClick={completeConfiguration}
                        className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-rose-600 flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl shadow-rose-200"
                    >
                        Finish & Configure App <Activity size={20} strokeWidth={2.5} />
                    </button>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
