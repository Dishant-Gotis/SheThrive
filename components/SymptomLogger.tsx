
import React, { useState } from 'react';
import { Mood, SymptomLog } from '../types';
import { SYMPTOM_OPTIONS } from '../constants';
import { Save, Frown, Meh, Smile, Sun, CloudRain, Zap } from 'lucide-react';

interface SymptomLoggerProps {
  onSave: (log: Omit<SymptomLog, 'id'>) => void;
}

const SymptomLogger: React.FC<SymptomLoggerProps> = ({ onSave }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState(5);
  const [mood, setMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleSave = () => {
    if (!mood) return;
    onSave({
      date: new Date().toISOString().split('T')[0],
      symptoms: selectedSymptoms,
      severity,
      mood,
      notes
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    // Reset form
    setSelectedSymptoms([]);
    setSeverity(5);
    setMood(null);
    setNotes('');
  };

  const MoodOption = ({ m, icon: Icon, label }: { m: Mood, icon: any, label: string }) => (
    <button
      onClick={() => setMood(m)}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
        mood === m 
          ? 'bg-rose-50 border-rose-500 text-rose-600 ring-2 ring-rose-200' 
          : 'bg-white border-slate-200 text-slate-400 hover:border-rose-300 hover:text-rose-400'
      }`}
    >
      <Icon size={32} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-24 md:pb-0">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">How are you feeling today?</h2>
        <p className="text-slate-500">Log your symptoms to help our AI personalize your insights.</p>
      </div>

      {/* Mood Selector */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 block">Mood</label>
        <div className="grid grid-cols-3 gap-3">
          <MoodOption m={Mood.HAPPY} icon={Smile} label="Happy" />
          <MoodOption m={Mood.ENERGETIC} icon={Sun} label="Energetic" />
          <MoodOption m={Mood.TIRED} icon={CloudRain} label="Tired" />
          <MoodOption m={Mood.SAD} icon={Frown} label="Sad" />
          <MoodOption m={Mood.IRRITABLE} icon={Zap} label="Irritable" />
          <MoodOption m={Mood.ANXIOUS} icon={Meh} label="Anxious" />
        </div>
      </div>

      {/* Symptom Chips */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 block">Physical Symptoms</label>
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_OPTIONS.map((symptom) => (
            <button
              key={symptom}
              onClick={() => toggleSymptom(symptom)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedSymptoms.includes(symptom)
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      {/* Severity Slider */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <label className="text-sm font-semibold text-slate-700">Overall Intensity</label>
          <span className="text-sm font-bold text-rose-500">{severity}/10</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={severity}
          onChange={(e) => setSeverity(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
        />
        <div className="flex justify-between text-xs text-slate-400 px-1">
          <span>Mild</span>
          <span>Severe</span>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
         <label className="text-sm font-semibold text-slate-700 block">Private Notes (Encrypted)</label>
         <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else on your mind?..."
            className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 h-32 resize-none"
         />
      </div>

      <button
        onClick={handleSave}
        disabled={!mood || isSaved}
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
          isSaved 
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-900 text-white hover:bg-slate-800'
        }`}
      >
        {isSaved ? (
           <>Saved Successfully!</>
        ) : (
           <><Save size={20} /> Save Log</>
        )}
      </button>
    </div>
  );
};

export default SymptomLogger;
