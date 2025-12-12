
import React, { useState, useEffect } from 'react';
import { IntegrationConnection } from '../types';
import { useAuth } from '../context/AuthContext';
import { mockBackend } from '../services/mockBackend';
import { Link, Watch, Activity, Dna, FlaskConical, Check, Plus, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

const Integrations: React.FC = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingType, setConnectingType] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadConnections();
  }, [user]);

  const loadConnections = async () => {
    if (!user) return;
    setLoading(true);
    const data = await mockBackend.integrations.getConnections(user.id);
    setConnections(data);
    setLoading(false);
  };

  const handleConnect = async (type: IntegrationConnection['sourceType']) => {
    if (!user) return;
    setConnectingType(type);
    try {
        await mockBackend.integrations.connectDevice(user.id, type);
        await loadConnections();
    } catch (e) {
        alert("Failed to connect");
    } finally {
        setConnectingType(null);
    }
  };

  const handleDisconnect = async (id: string) => {
      if(confirm('Disconnect this integration? Data syncing will stop.')) {
          await mockBackend.integrations.disconnectDevice(id);
          loadConnections();
      }
  };

  const isConnected = (type: string) => connections.find(c => c.sourceType === type);

  const IntegrationCard = ({ type, name, icon: Icon, desc }: { type: any, name: string, icon: any, desc: string }) => {
      const connection = isConnected(type);
      const isBusy = connectingType === type;

      return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${connection ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                      <Icon size={28} />
                  </div>
                  <div>
                      <h3 className="font-bold text-slate-900">{name}</h3>
                      <p className="text-sm text-slate-500 max-w-xs">{desc}</p>
                      {connection && (
                          <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1 font-medium">
                              <RefreshCw size={12} /> Last synced: {new Date(connection.lastSync!).toLocaleTimeString()}
                          </div>
                      )}
                  </div>
              </div>
              
              <div>
                  {connection ? (
                      <button 
                        onClick={() => handleDisconnect(connection.id)}
                        className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors"
                      >
                          Disconnect
                      </button>
                  ) : (
                      <button 
                        onClick={() => handleConnect(type)}
                        disabled={!!connectingType}
                        className="px-6 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                          {isBusy ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
                          Connect
                      </button>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="pb-24 md:pb-0 space-y-8">
      <div>
         <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
             <Link size={32} className="text-rose-500" /> Integrations
         </h2>
         <p className="text-slate-500 mt-2">Connect wearables and external health sources securely.</p>
      </div>

      <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide text-xs">Wearables & Apps</h3>
          <div className="grid grid-cols-1 gap-4">
              <IntegrationCard 
                type="apple_health"
                name="Apple Health"
                icon={Activity}
                desc="Sync steps, sleep, and cycle data from your iPhone."
              />
              <IntegrationCard 
                type="oura"
                name="Oura Ring"
                icon={Watch}
                desc="Import sleep stages and readiness scores."
              />
              <IntegrationCard 
                type="fitbit"
                name="Fitbit"
                icon={Watch}
                desc="Connect your Fitbit device for activity tracking."
              />
          </div>

          <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide text-xs mt-8">Genomics & Labs</h3>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-full shadow-sm text-indigo-600">
                      <Dna size={24} />
                  </div>
                  <div>
                      <h3 className="font-bold text-indigo-900">Genomic Data Upload</h3>
                      <p className="text-indigo-700 text-sm mt-1 mb-4">
                          Securely upload your raw data from 23andMe or AncestryDNA. 
                          Data is encrypted and used only for personalized insights.
                      </p>
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">
                          Upload File securely
                      </button>
                  </div>
              </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between opacity-60">
             <div className="flex items-center gap-4">
                 <div className="bg-slate-50 p-4 rounded-xl text-slate-400">
                     <FlaskConical size={28} />
                 </div>
                 <div>
                     <h3 className="font-bold text-slate-700">LabCorp Integration</h3>
                     <p className="text-sm text-slate-500">Coming soon. Import blood work results directly.</p>
                 </div>
             </div>
             <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">Soon</span>
          </div>
      </div>
    </div>
  );
};

export default Integrations;
