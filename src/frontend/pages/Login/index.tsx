
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-surface p-4" dir={dir}>
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src="https://guthmi.online/wp-content/uploads/2025/11/Asset-35-1.png" 
            alt="Guthmi WA" 
            className="h-16 mb-4 object-contain"
          />
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            {t.auth.loginTitle}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.auth.emailPlaceholder}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 rtl:right-3 rtl:left-auto" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all rtl:pr-10 rtl:pl-4"
                placeholder="admin@guthmi.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.auth.passwordPlaceholder}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 rtl:right-3 rtl:left-auto" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all rtl:pr-10 rtl:pl-4"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg shadow-green-200"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {t.auth.loginButton}
                <ArrowRight size={20} className="ml-2 rtl:mr-2 rtl:ml-0" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
           Protected by Enterprise Grade Security
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
