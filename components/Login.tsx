
import React, { useState } from 'react';
import { User } from '../types.ts';
import { Lock, User as UserIcon, Loader2 } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const user = users.find(u => u.username === username.toLowerCase() && u.password === password);
      
      if (!user) {
        setError('Usuário ou senha inválidos.');
        setLoading(false);
      } else if (!user.isActive) {
        setError('Sua conta está desativada. Fale com o administrador.');
        setLoading(false);
      } else {
        onLogin(user);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-amber-900 p-8 text-center relative overflow-hidden flex flex-col items-center">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-800/50 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 mb-4">
              <div className="w-32 h-32 bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 flex items-center justify-center">
                <img 
                   src="https://api.screenshot.net/v1/get?url=https://storage.googleapis.com/pai-images/9b794158469e469795026937e0c8b665.png&width=1024" 
                   className="w-full h-full object-contain filter invert" 
                   alt="São Francisco das Chagas Logo" 
                   onError={(e) => e.currentTarget.style.display = 'none'}
                />
              </div>
            </div>
            
            <h1 className="text-3xl font-extrabold text-white relative z-10 tracking-tight">EJC</h1>
            <p className="text-amber-200 text-sm font-medium mt-1 uppercase tracking-widest relative z-10">Paróquia São Francisco das Chagas</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider pl-1">Usuário</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-600 transition-colors" />
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-0 transition-all text-slate-800 font-medium placeholder:text-slate-300"
                  placeholder="Seu usuário"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider pl-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-600 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-0 transition-all text-slate-800 font-medium placeholder:text-slate-300"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center gap-2 animate-bounce">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-amber-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-900 transition-all active:scale-[0.98] shadow-lg shadow-amber-900/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>Acessar Painel</>
              )}
            </button>

            <p className="text-center text-slate-400 text-[10px] mt-8 uppercase tracking-widest font-bold">
              Gestão de Encontreiros 2026
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
