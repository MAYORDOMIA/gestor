
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciales incorrectas. Inténtalo de nuevo.');
      setLoading(false);
    } else {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="bg-blue-600 text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl mx-auto shadow-xl shadow-blue-500/20 mb-6">A</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            ARISTA <span className="text-blue-500">ESTUDIO</span>
          </h1>
          <p className="text-slate-400 font-medium mt-2 uppercase tracking-widest text-[10px]">Gestión de Aberturas & Vidrios</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_20px_60px_rgb(0,0,0,0.04)]">
          <h2 className="text-xl font-bold text-slate-900 mb-8 text-center">Bienvenido de nuevo</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="email" 
                  className="w-full pl-14 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-full text-sm font-medium outline-none focus:bg-white focus:border-blue-400 focus:ring-4 ring-blue-500/5 transition-all"
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="password" 
                  className="w-full pl-14 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-full text-sm font-medium outline-none focus:bg-white focus:border-blue-400 focus:ring-4 ring-blue-500/5 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-center text-xs font-bold text-red-500 bg-red-50 p-4 rounded-2xl border border-red-100">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Iniciar Sesión <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">¿No tienes acceso? Contacta a Pablo Viéx</p>
          </div>
        </div>

        <p className="text-center text-slate-300 text-[9px] font-bold uppercase tracking-widest mt-12">ARISTA STUDIO 2 • SISTEMA DE GESTIÓN AVANZADO</p>
      </div>
    </div>
  );
};

export default Login;
