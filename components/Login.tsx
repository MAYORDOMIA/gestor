
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('pabloviex@live.com.ar');
  const [password, setPassword] = useState('admin654123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // AuthProvider se encargará de detectar el cambio y redirigir a AppContent
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(`Error: ${err.message || 'Credenciales inválidas'}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <div className="bg-blue-600 text-white w-20 h-20 rounded-[2.5rem] flex items-center justify-center font-black text-4xl mx-auto mb-6 shadow-2xl shadow-blue-500/40">A</div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">ARISTA STUDIO</h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-3">Módulo de Administración Central</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl p-10 lg:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email de Acceso</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  required 
                  type="email" 
                  className="w-full pl-16 pr-8 py-5 bg-slate-900/50 border border-white/5 rounded-full text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  required 
                  type="password" 
                  className="w-full pl-16 pr-8 py-5 bg-slate-900/50 border border-white/5 rounded-full text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase rounded-2xl text-center border border-rose-500/20">
                {error}
              </div>
            )}

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full py-6 bg-blue-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Entrar al Sistema <ArrowRight size={16}/></>}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
          Desarrollado por Arista Estudio • © 2024
        </p>
      </div>
    </div>
  );
};

export default Login;
