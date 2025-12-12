
import React, { useState, useEffect } from 'react';
import { Goal } from '../types';
import { useAuth } from '../context/AuthContext';
import { mockBackend } from '../services/mockBackend';
import { Target, Plus, Droplets, Moon, Activity, Utensils, Zap, Trash2, CheckCircle2 } from 'lucide-react';

const Goals: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form
  const [name, setName] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [goalType, setGoalType] = useState<Goal['goalType']>('other');

  useEffect(() => {
    if (user) loadGoals();
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;
    setIsLoading(true);
    const data = await mockBackend.goals.getGoals(user.id);
    setGoals(data);
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!user || !name || !targetValue || !unit) return;
    
    // Simple Validation
    const val = Number(targetValue);
    if (isNaN(val) || val <= 0) {
        alert("Please enter a valid positive number for the target.");
        return;
    }

    await mockBackend.goals.createGoal(user.id, {
      name,
      targetValue: val,
      unit,
      goalType,
      startDate: new Date().toISOString()
    });
    setIsCreating(false);
    resetForm();
    loadGoals();
  };

  const resetForm = () => {
    setName('');
    setTargetValue('');
    setUnit('');
    setGoalType('other');
  };

  const handleUpdateProgress = async (id: string, current: number, delta: number) => {
    const newVal = Math.max(0, current + delta);
    await mockBackend.goals.updateProgress(id, newVal);
    loadGoals(); // optimize in real app to local update
  };

  const handleDelete = async (id: string) => {
    if(confirm('Remove this goal?')) {
        await mockBackend.goals.deleteGoal(id);
        loadGoals();
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'hydration': return <Droplets size={24} className="text-blue-500" />;
      case 'sleep': return <Moon size={24} className="text-indigo-500" />;
      case 'activity': return <Activity size={24} className="text-rose-500" />;
      case 'nutrition': return <Utensils size={24} className="text-emerald-500" />;
      default: return <Target size={24} className="text-purple-500" />;
    }
  };

  if (!user) return null;

  return (
    <div className="pb-24 md:pb-0 space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Wellness Goals</h2>
          <p className="text-slate-500 text-sm">Set targets and track your daily progress.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
        >
          {isCreating ? 'Cancel' : <><Plus size={18} /> Add Goal</>}
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-fade-in-up space-y-4">
          <div>
             <label className="text-xs font-bold text-slate-500 uppercase">Goal Name</label>
             <input
               className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 mt-1"
               placeholder="e.g. Drink Water"
               value={name}
               onChange={(e) => setName(e.target.value)}
             />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Target Amount</label>
                <input
                    type="number"
                    min="1"
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 mt-1"
                    placeholder="e.g. 2000"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Unit</label>
                <input
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 mt-1"
                    placeholder="e.g. ml, mins, steps"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                />
              </div>
          </div>
          <div>
             <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
             <div className="flex gap-2 mt-2 flex-wrap">
                {['hydration', 'activity', 'sleep', 'nutrition', 'other'].map(t => (
                    <button
                        key={t}
                        onClick={() => setGoalType(t as any)}
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${goalType === t ? 'bg-rose-50 border-rose-500 text-rose-600' : 'border-slate-200 text-slate-500'}`}
                    >
                        {t}
                    </button>
                ))}
             </div>
          </div>
          <button
              onClick={handleCreate}
              className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 mt-2"
            >
              Start Tracking
          </button>
        </div>
      )}

      <div className="space-y-4">
          {isLoading && <p className="text-center text-slate-400">Loading goals...</p>}
          {!isLoading && goals.length === 0 && !isCreating && (
              <div className="text-center py-12 bg-slate-100 rounded-3xl border border-dashed border-slate-300">
                <Target className="mx-auto text-slate-400 mb-2" size={32} />
                <p className="text-slate-500">No active goals. Set one to start thriving!</p>
              </div>
          )}
          {goals.map(goal => {
              const progress = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
              return (
                  <div key={goal.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                              <div className="bg-slate-50 p-2 rounded-xl">
                                  {getIcon(goal.goalType)}
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-900">{goal.name}</h3>
                                  <p className="text-xs text-slate-400 capitalize">{goal.goalType} Goal</p>
                              </div>
                          </div>
                          <button onClick={() => handleDelete(goal.id)} className="text-slate-300 hover:text-red-400">
                              <Trash2 size={18} />
                          </button>
                      </div>

                      <div className="mb-2 flex justify-between text-sm font-medium">
                          <span className="text-slate-600">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                          <span className="text-rose-500">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
                          <div 
                            className="bg-rose-500 h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                          ></div>
                      </div>

                      <div className="flex justify-between items-center gap-4">
                          <button 
                            onClick={() => handleUpdateProgress(goal.id, goal.currentValue, -1 * (goal.targetValue * 0.1))} // Decrease by 10% roughly
                            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 font-bold"
                          >
                            -
                          </button>
                          <div className="text-xs text-slate-400 font-medium">Log Progress</div>
                          <button 
                            onClick={() => handleUpdateProgress(goal.id, goal.currentValue, (goal.targetValue * 0.1))} // Increase by 10%
                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold flex-1 flex items-center justify-center gap-2"
                          >
                             <CheckCircle2 size={16} /> Log Activity
                          </button>
                      </div>
                  </div>
              )
          })}
      </div>
    </div>
  );
};

export default Goals;
