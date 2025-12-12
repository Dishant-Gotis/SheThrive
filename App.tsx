
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import SymptomLogger from './components/SymptomLogger';
import AiInsights from './components/AiInsights';
import CycleTracker from './components/CycleTracker';
import AuthScreen from './components/AuthScreen';
import OnboardingFlow from './components/OnboardingFlow';
import ProfileSettings from './components/ProfileSettings';
import Journal from './components/Journal';
import Goals from './components/Goals';
import Reminders from './components/Reminders';
import Telehealth from './components/Telehealth';
import Library from './components/Library';
import Integrations from './components/Integrations';
import Subscription from './components/Subscription';
import GlobalAiChat from './components/GlobalAiChat';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SymptomLog, UserProfile, CycleData } from './types';
import { Loader2 } from 'lucide-react';
import { mockBackend } from './services/mockBackend';

// Authenticated App Shell
const AuthenticatedApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState<SymptomLog[]>([]); // Initialize empty, fetch later
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                // Fetch user specific cycle data and logs
                const [cData, lData] = await Promise.all([
                    mockBackend.cycle.getCycle(user.id),
                    mockBackend.logs.getLogs(user.id)
                ]);
                
                setCycleData(cData);
                setLogs(lData); // Use authentic logs only
            } catch (e) {
                console.error("Error fetching app data", e);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }
  }, [user]);

  const handleSaveLog = async (newLogData: Omit<SymptomLog, 'id'>) => {
    if (!user) return;
    const savedLog = await mockBackend.logs.createLog(user.id, newLogData);
    setLogs([savedLog, ...logs]);
  };

  if (!user) return null;

  if (loadingData || !cycleData) {
      return (
        <div className="min-h-screen bg-[#FFF0F5] flex items-center justify-center font-['Nunito']">
            <Loader2 className="animate-spin text-rose-500" size={32} />
        </div>
      );
  }

  // Convert generic User to UserProfile for backward compatibility with Dashboard
  const userProfile: UserProfile = {
    ...user,
    name: user.firstName, // Mapping for old type definition
    age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 25,
    goal: 'Track Health',
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] flex font-['Nunito'] relative overflow-hidden">
       {/* Background Ambient Blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none animate-float"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none animate-float delay-100"></div>

      {/* Navigation Sidebar/Bottom Bar */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 max-w-7xl mx-auto w-full transition-all relative z-10">
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <Dashboard 
              user={userProfile} 
              cycle={cycleData} 
              logs={logs}
              changeTab={setActiveTab} 
            />
          </div>
        )}
        
        {activeTab === 'tracker' && (
          <div className="animate-fade-in">
             <CycleTracker cycle={cycleData} />
          </div>
        )}

        {activeTab === 'log' && (
          <div className="animate-fade-in">
             <SymptomLogger onSave={handleSaveLog} />
          </div>
        )}

        {activeTab === 'telehealth' && (
          <div className="animate-fade-in">
             <Telehealth />
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="animate-fade-in">
             <Journal />
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="animate-fade-in">
             <Goals />
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="animate-fade-in">
             <Reminders />
          </div>
        )}
        
        {activeTab === 'library' && (
          <div className="animate-fade-in">
             <Library />
          </div>
        )}
        
        {activeTab === 'integrations' && (
          <div className="animate-fade-in">
             <Integrations />
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="animate-fade-in">
             <Subscription />
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="animate-fade-in">
             <AiInsights user={userProfile} cycle={cycleData} logs={logs} />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-fade-in">
             <ProfileSettings />
          </div>
        )}
      </main>

      {/* Global AI Chat Bubble */}
      <GlobalAiChat />
    </div>
  );
};

// Root Component handling Auth Logic
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FFF0F5] font-['Nunito']">
         <Loader2 className="animate-spin text-rose-500 mb-4" size={48} />
         <h1 className="text-3xl font-black text-slate-800 tracking-tight">SheThrive</h1>
         <p className="text-rose-400 font-bold text-sm mt-2">Loading your safe space...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (user && !user.isOnboardingComplete) {
    return <OnboardingFlow />;
  }

  return <AuthenticatedApp />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
