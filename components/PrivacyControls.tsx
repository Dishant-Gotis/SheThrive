
import React, { useEffect, useState } from 'react';
import { PrivacyPreferences } from '../types';
import { mockBackend } from '../services/mockBackend';
import { Shield, Eye, MapPin, BarChart3, Lock } from 'lucide-react';

interface PrivacyControlsProps {
  userId: string;
  onSave?: () => void;
  isInOnboarding?: boolean;
}

const PrivacyControls: React.FC<PrivacyControlsProps> = ({ userId, onSave, isInOnboarding = false }) => {
  const [prefs, setPrefs] = useState<PrivacyPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPrefs = async () => {
      const data = await mockBackend.user.getPrivacyPreferences(userId);
      setPrefs(data);
      setIsLoading(false);
    };
    loadPrefs();
  }, [userId]);

  const handleToggle = async (key: keyof PrivacyPreferences, val: string) => {
    if (!prefs) return;
    const newPrefs = { ...prefs, [key]: val };
    setPrefs(newPrefs);
    // In onboarding we might wait for a master "Save" button, but for granular controls we save immediately
    if (!isInOnboarding) {
        await mockBackend.user.updatePrivacyPreferences(userId, newPrefs);
    }
  };

  const handleMasterSave = async () => {
      if (prefs && onSave) {
          await mockBackend.user.updatePrivacyPreferences(userId, prefs);
          onSave();
      }
  }

  if (isLoading || !prefs) return <div className="p-4 text-center text-slate-500">Loading privacy settings...</div>;

  const Option = ({ 
    id, 
    label, 
    desc, 
    icon: Icon, 
    value, 
    onVal, 
    offVal 
  }: { 
    id: keyof PrivacyPreferences, 
    label: string, 
    desc: string, 
    icon: any, 
    value: string, 
    onVal: string, 
    offVal: string 
  }) => (
    <div className="flex items-start justify-between p-4 bg-white rounded-xl border border-slate-100 mb-4">
      <div className="flex gap-4">
        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
            <Icon size={24} />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm">{label}</h4>
          <p className="text-slate-500 text-xs mt-1 max-w-xs">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
         <button 
           onClick={() => handleToggle(id, onVal)}
           className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${value === onVal ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
         >
            Yes
         </button>
         <button 
           onClick={() => handleToggle(id, offVal)}
           className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${value === offVal ? 'bg-white shadow-sm text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}
         >
            No
         </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {!isInOnboarding && (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
              <Lock className="text-emerald-600" size={20} />
              <div>
                  <h3 className="text-emerald-900 font-bold text-sm">Zero-Trust Privacy</h3>
                  <p className="text-emerald-700 text-xs">Your data is encrypted. We cannot see your health logs.</p>
              </div>
          </div>
      )}

      <div>
        <Option 
          id="dataSharing"
          label="Data Sharing"
          desc="Share anonymized data with trusted medical partners for research?"
          icon={Eye}
          value={prefs.dataSharing}
          onVal="opt_in"
          offVal="opt_out"
        />
        <Option 
          id="marketingEmails"
          label="Marketing Comms"
          desc="Receive emails about new features and partner offers?"
          icon={BarChart3}
          value={prefs.marketingEmails}
          onVal="opt_in"
          offVal="opt_out"
        />
        <Option 
          id="locationTracking"
          label="Location Services"
          desc="Allow location access for finding nearby specialists?"
          icon={MapPin}
          value={prefs.locationTracking}
          onVal="enabled"
          offVal="disabled"
        />
        <Option 
            id="anonymizedAnalytics"
            label="App Analytics"
            desc="Help us improve SheThrive by sending anonymous usage data."
            icon={Shield}
            value={prefs.anonymizedAnalytics}
            onVal="enabled"
            offVal="disabled"
        />
      </div>

      {isInOnboarding && (
          <button 
            onClick={handleMasterSave}
            className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition-colors"
          >
              Confirm Privacy Settings
          </button>
      )}
    </div>
  );
};

export default PrivacyControls;
