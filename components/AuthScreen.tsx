
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flower, Heart, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Sparkles, Star } from 'lucide-react';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.firstName, formData.lastName);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({ ...formData, email: 'sarah@example.com', password: 'password123' });
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] flex items-center justify-center p-4 relative overflow-hidden font-['Nunito']">
      {/* Cartoonish Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float delay-100"></div>
      <div className="absolute top-[40%] left-[20%] w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-pulse"></div>

      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(255,182,193,0.8)] border-4 border-white w-full max-w-5xl flex overflow-hidden min-h-[650px] relative z-10 transition-all">
        
        {/* Left Side - Brand & Vibes */}
        <div className="hidden md:flex flex-col justify-between w-5/12 bg-gradient-to-br from-pink-400 to-rose-400 p-12 text-white relative overflow-hidden">
           {/* Decor Icons */}
           <div className="absolute top-10 right-10 text-white/20 transform rotate-12">
              <Flower size={140} />
           </div>
           <div className="absolute bottom-20 left-10 text-white/20 transform -rotate-12">
              <Heart size={80} />
           </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-white text-rose-500 p-3 rounded-2xl shadow-lg rotate-3">
                <Flower size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-black tracking-tight drop-shadow-sm">SheThrive</h1>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl font-black leading-tight opacity-0 animate-fade-in-up">
                Your Health, <br/>
                <span className="text-yellow-200 inline-block transform -rotate-2 bg-white/10 px-2 rounded-lg">Reimagined.</span>
              </h2>
              <p className="text-pink-50 text-lg font-bold opacity-0 animate-fade-in-up delay-200 leading-relaxed">
                Join a community where your health data belongs to you. End-to-end encrypted, zero-trust architecture, and AI-driven insights.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-auto">
             <div className="flex items-center gap-3 bg-white/20 p-4 rounded-3xl backdrop-blur-md border-2 border-white/30 opacity-0 animate-fade-in-up delay-300 shadow-lg">
                <div className="bg-yellow-300 p-2 rounded-full text-rose-500">
                   <Star size={20} fill="currentColor" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-white">New Feature</p>
                  <p className="text-xs font-semibold text-pink-100">AI Mood Tracking is live!</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 md:p-14 flex flex-col justify-center bg-white relative">
          
          <div className="mb-8">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">
              {isLogin ? 'Welcome Back!' : 'Join the Club!'}
            </h2>
            <p className="text-slate-400 font-bold text-lg mt-2">
              {isLogin 
                ? 'Lets see how you are feeling today.' 
                : 'Start your wellness journey with complete privacy.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-500 border-2 border-red-100 rounded-2xl flex items-center gap-2 text-sm font-bold animate-bounce">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider ml-2">First Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-4 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={20} />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all font-bold placeholder:text-slate-300"
                      placeholder="Jane"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider ml-2">Last Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-6 py-3.5 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all font-bold placeholder:text-slate-300"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider ml-2">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-4 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={20} />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all font-bold placeholder:text-slate-300"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider ml-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-4 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={20} />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all font-bold placeholder:text-slate-300"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 mt-4"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={20} strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          {isLogin && (
             <div className="mt-4 text-center">
                 <button 
                    type="button"
                    onClick={handleDemoLogin}
                    className="text-xs font-bold text-rose-400 hover:text-rose-600 hover:underline bg-rose-50 px-3 py-1 rounded-full border border-rose-100"
                 >
                    Fill Demo Credentials (sarah@example.com)
                 </button>
             </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-slate-500 font-bold">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-rose-500 hover:text-rose-600 font-black hover:underline transition-colors"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="absolute bottom-4 text-center w-full text-slate-400 text-xs font-bold opacity-60">
        <p>🔒 Secure. Private. Encrypted.</p>
      </div>
    </div>
  );
};

export default AuthScreen;
