
import React from 'react';
import { CycleData } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, ReferenceLine } from 'recharts';
import { Calendar } from 'lucide-react';

interface CycleTrackerProps {
  cycle: CycleData;
}

const CycleTracker: React.FC<CycleTrackerProps> = ({ cycle }) => {
  // Generate data based on user's specific cycle length
  const data = Array.from({ length: cycle.length }, (_, i) => {
    const day = i + 1;
    let hormoneLevel = 20; // Baseline
    
    // Logic adapted for flexible cycle lengths
    const midPoint = Math.floor(cycle.length / 2);
    const ovulationDay = cycle.length - 14; // Approximate luteal phase is usually 14 days
    
    // Estrogen peak (Follicular)
    if (day > cycle.periodLength && day < ovulationDay) {
        hormoneLevel += (day - cycle.periodLength) * 5;
    }
    
    // Dip at ovulation
    if (day === ovulationDay) hormoneLevel = 60;
    
    // Progesterone peak (Luteal)
    if (day > ovulationDay && day < cycle.length - 2) {
        hormoneLevel = 50 + Math.sin(day) * 10;
    }
    
    return {
      day: `Day ${day}`,
      level: Math.min(100, Math.max(10, hormoneLevel)), // Clamp
      isPeriod: day <= cycle.periodLength,
      isOvulation: day === ovulationDay
    };
  });

  const ovulationDayLabel = `Day ${cycle.length - 14}`;

  return (
    <div className="pb-24 md:pb-0 space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-slate-900">Cycle Overview</h2>
         <button className="text-rose-500 font-medium text-sm flex items-center gap-1 hover:bg-rose-50 px-3 py-1 rounded-lg transition-colors">
            <Calendar size={16} /> Edit Period Dates
         </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold mb-6 text-slate-700">Hormonal Trends</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 10 }} 
                interval={Math.floor(cycle.length / 5)} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <ReferenceLine x={ovulationDayLabel} stroke="#d946ef" strokeDasharray="3 3" label={{ value: 'Ovulation', position: 'top', fill: '#d946ef', fontSize: 10 }} />
              <Bar dataKey="level" fill="#fda4af" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex gap-4 justify-center text-xs text-slate-500">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-300 rounded-full"></div> Hormonal Activity
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-fuchsia-500 rounded-full"></div> Ovulation Window
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Follicular', 'Ovulatory', 'Luteal'].map((phase, idx) => (
           <div key={phase} className={`p-4 rounded-2xl border ${idx === 0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-100 opacity-60'}`}>
              <h4 className={`font-bold ${idx === 0 ? 'text-rose-700' : 'text-slate-700'}`}>{phase} Phase</h4>
              <p className="text-xs mt-1 text-slate-500">
                 {idx === 0 ? 'Energy rising. Great time for creativity and harder workouts.' : 'Upcoming phase.'}
              </p>
           </div>
        ))}
      </div>
    </div>
  );
};

export default CycleTracker;
