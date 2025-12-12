
import React, { useState } from 'react';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import PrivacyControls from './PrivacyControls';
import AuditLogViewer from './AuditLogViewer';
import { User as UserIcon, MapPin, Calendar, Save, LogOut } from 'lucide-react';

const ProfileSettings: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'privacy' | 'audit'>('details');
  const [formData, setFormData] = useState<Partial<User>>({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      location: user?.location || '',
      gender: user?.gender || '',
      dateOfBirth: user?.dateOfBirth || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  if (!user) return null;

  const handleSave = async () => {
      setIsSaving(true);
      setSaveMessage('');
      try {
        await updateUser(formData);
        setSaveMessage('Profile synced successfully.');
      } catch (e) {
        setSaveMessage('Failed to sync profile.');
      }
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
        <header className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
            <p className="text-slate-500">Manage your profile and privacy preferences.</p>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex border-b border-slate-100 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 py-4 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'details' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500'}`}
                >
                    Profile Details
                </button>
                <button 
                    onClick={() => setActiveTab('privacy')}
                    className={`flex-1 py-4 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'privacy' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500'}`}
                >
                    Privacy & Security
                </button>
                <button 
                    onClick={() => setActiveTab('audit')}
                    className={`flex-1 py-4 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'audit' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500'}`}
                >
                    Audit Logs
                </button>
            </div>

            <div className="p-6 md:p-8">
                {activeTab === 'details' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                                <UserIcon size={40} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{user.firstName} {user.lastName}</h3>
                                <p className="text-slate-500 text-sm">{user.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                                <input 
                                    className="w-full p-3 rounded-xl border border-slate-200" 
                                    value={formData.firstName}
                                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                                <input 
                                    className="w-full p-3 rounded-xl border border-slate-200" 
                                    value={formData.lastName}
                                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 text-slate-400" size={16} />
                                    <input 
                                        className="w-full p-3 pl-9 rounded-xl border border-slate-200" 
                                        value={formData.location}
                                        onChange={e => setFormData({...formData, location: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Birth Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3.5 text-slate-400" size={16} />
                                    <input 
                                        type="date"
                                        className="w-full p-3 pl-9 rounded-xl border border-slate-200" 
                                        value={formData.dateOfBirth}
                                        onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-between items-center border-t border-slate-100 mt-6">
                            <button 
                                onClick={logout}
                                className="text-red-500 font-medium flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                            >
                                <LogOut size={18} /> Sign Out
                            </button>
                            <div className="flex items-center gap-4">
                                {saveMessage && <span className="text-sm text-emerald-600 font-medium animate-fade-in">{saveMessage}</span>}
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-70"
                                >
                                    {isSaving ? 'Syncing...' : <><Save size={18} /> Sync Profile</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'privacy' && <PrivacyControls userId={user.id} />}
                
                {activeTab === 'audit' && <AuditLogViewer />}
            </div>
        </div>
    </div>
  );
};

export default ProfileSettings;
