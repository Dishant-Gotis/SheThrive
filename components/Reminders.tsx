
import React, { useState, useEffect } from 'react';
import { Reminder } from '../types';
import { useAuth } from '../context/AuthContext';
import { mockBackend } from '../services/mockBackend';
import { Bell, Plus, Clock, Pill, Trash2, Check } from 'lucide-react';

const Reminders: React.FC = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [frequency, setFrequency] = useState<Reminder['frequency']>('daily');
  const [dosage, setDosage] = useState('');

  useEffect(() => {
    if (user) loadReminders();
  }, [user]);

  const loadReminders = async () => {
    if (!user) return;
    setIsLoading(true);
    const data = await mockBackend.reminders.getReminders(user.id);
    setReminders(data);
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!user || !name || !time) return;
    await mockBackend.reminders.createReminder(user.id, {
      name,
      time,
      frequency,
      dosage,
      isActive: true
    });
    setIsCreating(false);
    setName('');
    setTime('');
    setDosage('');
    loadReminders();
  };

  const handleToggle = async (id: string) => {
    await mockBackend.reminders.toggleActive(id);
    loadReminders();
  };

  const handleDelete = async (id: string) => {
    if(confirm('Delete this reminder?')) {
        await mockBackend.reminders.deleteReminder(id);
        loadReminders();
    }
  };

  if (!user) return null;

  return (
    <div className="pb-24 md:pb-0 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reminders</h2>
          <p className="text-slate-500 text-sm">Medications & Supplements.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
        >
          {isCreating ? 'Cancel' : <><Plus size={18} /> Add</>}
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-fade-in-up space-y-4">
           <div>
             <label className="text-xs font-bold text-slate-500 uppercase">Item Name</label>
             <input
               className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 mt-1"
               placeholder="e.g. Vitamin D"
               value={name}
               onChange={(e) => setName(e.target.value)}
             />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Time</label>
                 <input
                   type="time"
                   className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 mt-1"
                   value={time}
                   onChange={(e) => setTime(e.target.value)}
                 />
              </div>
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Dosage (Optional)</label>
                 <input
                   className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 mt-1"
                   placeholder="e.g. 500mg"
                   value={dosage}
                   onChange={(e) => setDosage(e.target.value)}
                 />
              </div>
           </div>
           <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Frequency</label>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 mt-1 bg-white text-slate-900"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
              >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="specific_days">Specific Days</option>
              </select>
           </div>
           <button
              onClick={handleCreate}
              className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 mt-2"
            >
              Set Reminder
          </button>
        </div>
      )}

      <div className="space-y-3">
         {isLoading && <p className="text-center text-slate-400">Loading reminders...</p>}
         {!isLoading && reminders.length === 0 && !isCreating && (
              <div className="text-center py-12 bg-slate-100 rounded-3xl border border-dashed border-slate-300">
                <Bell className="mx-auto text-slate-400 mb-2" size={32} />
                <p className="text-slate-500">No active reminders.</p>
              </div>
          )}
          {reminders.map(reminder => (
              <div key={reminder.id} className={`flex items-center justify-between p-4 rounded-2xl border ${reminder.isActive ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
                  <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${reminder.isActive ? 'bg-purple-100 text-purple-600' : 'bg-slate-200 text-slate-500'}`}>
                          <Pill size={24} />
                      </div>
                      <div>
                          <h4 className={`font-bold ${reminder.isActive ? 'text-slate-900' : 'text-slate-500'}`}>{reminder.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <Clock size={12} />
                              <span>{reminder.time}</span>
                              {reminder.dosage && <span>• {reminder.dosage}</span>}
                              <span className="capitalize">• {reminder.frequency}</span>
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <button onClick={() => handleDelete(reminder.id)} className="text-slate-300 hover:text-red-400">
                          <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggle(reminder.id)}
                        className={`w-12 h-7 rounded-full transition-colors relative flex items-center ${reminder.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform absolute left-1 ${reminder.isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default Reminders;
