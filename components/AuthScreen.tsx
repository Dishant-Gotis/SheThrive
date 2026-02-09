
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flower, Heart, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Sparkles, Star } from 'lucide-react';

// Google Icon SVG Component
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, register, loginWithGoogle } = useAuth();

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

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] flex items-center justify-center p-4 relative overflow-hidden font-['Nunito']">
      {/* Cartoonish Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float delay-100"></div>
      <div className="absolute top-[40%] left-[20%] w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-pulse"></div>

      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(255,182,193,0.8)] border-4 border-white w-full max-w-5xl flex overflow-hidden max-h-[90vh] relative z-10 transition-all">
        
        {/* Left Side - Brand & Vibes */}
        <div className="hidden md:flex flex-col justify-between w-5/12 bg-gradient-to-br from-pink-400 to-rose-400 p-8 text-white relative overflow-hidden">
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
        <div className="w-full md:w-7/12 p-6 md:p-10 flex flex-col justify-center bg-white relative overflow-y-auto">
          
          <div className="mb-4">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {isLogin ? 'Welcome Back!' : 'Join the Club!'}
            </h2>
            <p className="text-slate-400 font-bold text-base mt-1">
              {isLogin 
                ? 'Lets see how you are feeling today.' 
                : 'Start your wellness journey with complete privacy.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 border-2 border-red-100 rounded-2xl flex items-center gap-2 text-sm font-bold animate-bounce">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider ml-2">First Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                    <input
                      type="text"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all font-bold placeholder:text-slate-300"
                      placeholder="Jane"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider ml-2">Last Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all font-bold placeholder:text-slate-300"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider ml-2">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all font-bold placeholder:text-slate-300"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider ml-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all font-bold placeholder:text-slate-300"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-3 rounded-2xl font-black text-base hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 mt-2"
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

          {/* Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-slate-400 font-bold text-sm">or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-2xl font-bold text-base hover:bg-slate-50 hover:border-slate-300 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3"
          >
            {isGoogleLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          {isLogin && (
             <div className="mt-3 text-center">
                 <button 
                    type="button"
                    onClick={handleDemoLogin}
                    className="text-xs font-bold text-rose-400 hover:text-rose-600 hover:underline bg-rose-50 px-3 py-1 rounded-full border border-rose-100"
                 >
                    Fill Demo Credentials (sarah@example.com)
                 </button>
             </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-slate-500 font-bold text-sm">
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
      <div className="absolute bottom-2 text-center w-full text-slate-400 text-xs font-bold opacity-60">
        <p>🔒 Secure. Private. Encrypted.</p>
      </div>
    </div>
  );
};

export default AuthScreen;
