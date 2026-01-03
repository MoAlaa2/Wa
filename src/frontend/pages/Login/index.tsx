
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Loader2, Shield } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email);
    if (success) {
      navigate('/');
    } else {
      setError(t.auth.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4" dir={dir}>
      
      {/* Guthmi Logo - Large Gold Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Gold G Logo - SVG Recreation */}
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Main Gold Circle with cutout */}
            <defs>
              <clipPath id="gClip">
                <rect x="0" y="0" width="200" height="200"/>
              </clipPath>
            </defs>
            
            {/* Main G shape */}
            <path 
              d="M100,10 A90,90 0 1,1 100,190 A90,90 0 0,1 100,10 M100,50 A50,50 0 0,0 100,150 A50,50 0 0,0 100,50" 
              fill="#C8973A"
              fillRule="evenodd"
            />
            
            {/* Cutout for G opening */}
            <rect x="100" y="10" width="100" height="80" fill="white"/>
            
            {/* Inner white circle cutout simulation */}
            <circle cx="100" cy="100" r="45" fill="white"/>
            
            {/* Horizontal bar of G */}
            <rect x="100" y="85" width="55" height="30" rx="15" fill="white"/>
            
            {/* Three dots */}
            <circle cx="150" cy="25" r="18" fill="#C8973A"/>
            <circle cx="175" cy="55" r="12" fill="#C8973A"/>
            <circle cx="165" cy="90" r="8" fill="#C8973A"/>
          </svg>
        </div>
        
        {/* Since 1942 Text */}
        <h1 className="text-4xl font-bold text-[#C8973A] tracking-wide mt-2">
          Since 1942
        </h1>
      </div>

      {/* Login Form Card */}
      <div className="w-full max-w-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Log in to Guthmi WA
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8973A] focus:border-[#C8973A] transition-all text-sm"
                placeholder="admin@guthmi.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8973A] focus:border-[#C8973A] transition-all text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium border border-red-200">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center border border-gray-300 text-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                Log In
                <ArrowRight size={16} className="ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield size={14} />
          <span>Protected by Enterprise Grade Security</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
