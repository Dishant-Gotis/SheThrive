
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockBackend } from '../services/mockBackend';
import { Provider, Appointment } from '../types';
import { Search, Calendar, Video, Clock, DollarSign, X, Check, Stethoscope, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, MessageSquare } from 'lucide-react';

const Telehealth: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'directory' | 'appointments' | 'call'>('directory');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking State
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Call State
  const [activeCall, setActiveCall] = useState<Appointment | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeView]);

  const loadData = async () => {
    setLoading(true);
    const [provs, appts] = await Promise.all([
      mockBackend.telehealth.getProviders(),
      user ? mockBackend.telehealth.getAppointments(user.id) : Promise.resolve([])
    ]);
    setProviders(provs);
    setAppointments(appts.sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
    setLoading(false);
  };

  const handleBook = async () => {
    if (!user || !selectedProvider || !bookingSlot) return;
    setIsBooking(true);
    try {
      await mockBackend.telehealth.bookAppointment(user.id, selectedProvider.id, bookingSlot, bookingNotes);
      setSelectedProvider(null);
      setBookingSlot(null);
      setBookingNotes('');
      setActiveView('appointments');
      loadData();
    } catch (e) {
      alert("Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm("Are you sure you want to cancel? Refund will be processed in 3-5 days.")) {
      await mockBackend.telehealth.cancelAppointment(id);
      loadData();
    }
  };

  const handleJoinCall = async (appt: Appointment) => {
    setActiveCall(appt);
    setActiveView('call');
    // In real app, we'd use the token here to connect to Twilio
    await mockBackend.telehealth.joinVideoCall(appt.id);
  };

  const handleEndCall = () => {
    setActiveCall(null);
    setActiveView('appointments');
  };

  // --- Sub-components (Views) ---

  const DirectoryView = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search specialists, names..." 
            className="w-full pl-10 p-3 rounded-xl border border-slate-200 focus:border-rose-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">Filter</button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">Sort</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map(prov => (
          <div key={prov.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex items-start gap-4 mb-4">
              <img src={prov.imageUrl} alt={prov.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" />
              <div>
                <h3 className="font-bold text-slate-900">{prov.name}</h3>
                <p className="text-rose-500 text-sm font-medium">{prov.specialty}</p>
                <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                  <DollarSign size={12} />
                  <span>{(prov.rates.amount / 100).toFixed(2)} / session</span>
                </div>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-6 flex-1">{prov.bio}</p>
            <button 
              onClick={() => setSelectedProvider(prov)}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Check Availability
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const BookingModal = () => {
    if (!selectedProvider) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Book Appointment</h2>
            <button onClick={() => setSelectedProvider(null)} className="p-2 hover:bg-slate-100 rounded-full">
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-xl">
             <img src={selectedProvider.imageUrl} alt={selectedProvider.name} className="w-12 h-12 rounded-full object-cover" />
             <div>
                <p className="font-bold text-slate-900">{selectedProvider.name}</p>
                <p className="text-slate-500 text-sm">{selectedProvider.specialty}</p>
             </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select a Time Slot</label>
              <div className="grid grid-cols-2 gap-3">
                {selectedProvider.availableSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setBookingSlot(slot)}
                    className={`p-3 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
                      bookingSlot === slot 
                        ? 'bg-rose-50 border-rose-500 text-rose-600' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-rose-300'
                    }`}
                  >
                    <Calendar size={14} />
                    {new Date(slot).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    <span className="opacity-50">|</span>
                    {new Date(slot).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Reason for Visit (Optional)</label>
              <textarea 
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-rose-500 outline-none h-24 resize-none"
                placeholder="Briefly describe your symptoms or questions..."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
              />
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-sm text-emerald-800 flex items-start gap-2">
               <Check size={16} className="mt-0.5" />
               <p>Your consultation is end-to-end encrypted. Payment will be processed securely via Stripe.</p>
            </div>

            <button
              onClick={handleBook}
              disabled={!bookingSlot || isBooking}
              className="w-full bg-rose-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-rose-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isBooking ? 'Processing...' : `Confirm Booking • $${(selectedProvider.rates.amount / 100).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AppointmentsView = () => (
    <div className="animate-fade-in space-y-6">
      {appointments.length === 0 ? (
        <div className="text-center py-20 bg-slate-100 rounded-3xl border border-dashed border-slate-300">
           <Calendar size={48} className="mx-auto text-slate-400 mb-4" />
           <h3 className="text-xl font-bold text-slate-700">No Appointments Yet</h3>
           <p className="text-slate-500 mt-2">Book a consultation to get started with an expert.</p>
           <button 
             onClick={() => setActiveView('directory')}
             className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
           >
             Find a Provider
           </button>
        </div>
      ) : (
        appointments.map(appt => {
          const provider = providers.find(p => p.id === appt.providerId);
          if (!provider) return null;
          const isUpcoming = new Date(appt.startTime) > new Date();
          const isCancelled = appt.status === 'cancelled';

          return (
            <div key={appt.id} className={`bg-white p-6 rounded-3xl border ${isCancelled ? 'border-slate-100 opacity-60' : 'border-slate-200 shadow-sm'} flex flex-col md:flex-row gap-6 justify-between items-center`}>
               <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-16 h-16 bg-slate-100 rounded-full overflow-hidden">
                     <img src={provider.imageUrl} alt={provider.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                     <h3 className="font-bold text-slate-900 text-lg">{provider.name}</h3>
                     <p className="text-slate-500">{provider.specialty}</p>
                     <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 font-medium">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(appt.startTime).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(appt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                  </div>
               </div>

               {!isCancelled && (
                 <div className="flex gap-3 w-full md:w-auto">
                    {isUpcoming ? (
                       <button 
                          onClick={() => handleCancel(appt.id)}
                          className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors flex-1 md:flex-none"
                       >
                          Cancel
                       </button>
                    ) : null}
                    
                    <button 
                       onClick={() => handleJoinCall(appt)}
                       disabled={isCancelled} // Allow joining anytime for demo purposes
                       className="px-8 py-3 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 flex-1 md:flex-none"
                    >
                       <Video size={20} /> Join Room
                    </button>
                 </div>
               )}
               {isCancelled && <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-500 font-bold text-sm">Cancelled</div>}
            </div>
          );
        })
      )}
    </div>
  );

  const CallView = () => {
    if (!activeCall) return null;
    const provider = providers.find(p => p.id === activeCall.providerId);

    return (
      <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col animate-fade-in">
         {/* Call Header */}
         <div className="p-4 flex justify-between items-center bg-slate-800/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center font-bold">
                  {provider?.name[0]}
               </div>
               <div>
                  <h3 className="font-bold">{provider?.name}</h3>
                  <p className="text-xs text-slate-300">00:12:45 • Encrypted</p>
               </div>
            </div>
            <div className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs font-bold flex items-center gap-1">
               <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div> Live
            </div>
         </div>

         {/* Video Area */}
         <div className="flex-1 relative flex items-center justify-center p-4">
             {/* Main Provider Video (Placeholder) */}
             <div className="w-full h-full max-w-5xl bg-slate-800 rounded-3xl overflow-hidden relative shadow-2xl">
                 <img src={provider?.imageUrl} alt="Doctor" className="w-full h-full object-cover opacity-80" />
                 
                 {/* Self View (PIP) */}
                 <div className="absolute bottom-6 right-6 w-48 h-32 bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-lg">
                    {isCamOn ? (
                       <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                          <span className="text-xs text-slate-400">You</span>
                       </div>
                    ) : (
                       <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                          <VideoOff size={20} />
                       </div>
                    )}
                 </div>
             </div>
         </div>

         {/* Controls */}
         <div className="p-8 flex justify-center items-center gap-6">
             <button 
               onClick={() => setIsMicOn(!isMicOn)}
               className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 text-white'}`}
             >
                {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
             </button>
             <button 
                onClick={() => setIsCamOn(!isCamOn)}
                className={`p-4 rounded-full transition-all ${isCamOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 text-white'}`}
             >
                {isCamOn ? <VideoIcon size={24} /> : <VideoOff size={24} />}
             </button>
             <button onClick={handleEndCall} className="px-8 py-4 bg-red-500 hover:bg-red-600 rounded-full font-bold flex items-center gap-2 transition-all">
                <PhoneOff size={24} /> End Call
             </button>
             <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-full transition-all">
                <MessageSquare size={24} />
             </button>
         </div>
      </div>
    );
  };

  return (
    <div className="pb-24 md:pb-0 min-h-screen">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Stethoscope size={32} className="text-rose-500" /> Care
           </h2>
           <p className="text-slate-500">Connect with expert providers securely.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto">
           <button 
             onClick={() => setActiveView('directory')}
             className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'directory' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
           >
             Find Provider
           </button>
           <button 
             onClick={() => setActiveView('appointments')}
             className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'appointments' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
           >
             My Appointments
           </button>
        </div>
      </header>

      {loading && (
         <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Loading Telehealth services...</p>
         </div>
      )}

      {!loading && activeView === 'directory' && <DirectoryView />}
      {!loading && activeView === 'appointments' && <AppointmentsView />}
      {!loading && activeView === 'call' && <CallView />}
      
      {selectedProvider && <BookingModal />}
    </div>
  );
};

export default Telehealth;
