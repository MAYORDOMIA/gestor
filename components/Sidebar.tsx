
import { ShieldCheck, LayoutDashboard, Users, Bot, Factory, Truck, Archive, Wallet, HandCoins, TruckIcon, Calculator, Clock, Menu, X, Lock, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Subscription } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [sub, setSub] = useState<Subscription | null>(null);
  const userEmail = 'pabloviex@live.com.ar'; // En producción esto vendría del contexto de auth

  useEffect(() => {
    const fetchSub = async () => {
      const { data } = await supabase.from('subscriptions').select('*').limit(1).single();
      if (data) setSub(data);
    };
    fetchSub();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard, module: 'has_gestor' },
    { id: 'requests', label: 'PRESUPUESTADOR', icon: Calculator, module: 'has_cotizador_vidrio' },
    { id: 'clients', label: 'CARPETA CLIENTES', icon: Users, module: 'has_gestor' },
    { id: 'production', label: 'TALLER / FÁBRICA', icon: Factory, module: 'has_gestor' },
    { id: 'installation', label: 'INSTALACIÓN', icon: Truck, module: 'has_gestor' },
    { id: 'archive', label: 'HISTORIAL / ARCHIVO', icon: Archive, module: 'has_gestor' },
    { id: 'payments', label: 'GESTIÓN COBROS', icon: HandCoins, module: 'has_gestor' },
    { id: 'suppliers', label: 'PROVEEDORES', icon: TruckIcon, module: 'has_gestor' },
    { id: 'accounting', label: 'CONTABILIDAD', icon: Wallet, module: 'has_gestor' },
    { id: 'ai', label: 'ASISTENTE IA', icon: Bot, module: 'has_cotizador_vidrio' },
    { id: 'attendance', label: 'ASISTENCIA', icon: Clock, module: 'has_medidor' },
    { id: 'saas-admin', label: 'GESTOR SAAS', icon: ShieldCheck, module: 'is_admin', onlyAdmin: true },
  ];

  const checkModule = (item: any) => {
    if (item.onlyAdmin && userEmail !== 'pabloviex@live.com.ar') return false;
    if (item.module === 'is_admin') return true; 
    if (!sub) return false;
    return (sub as any)[item.module];
  };

  return (
    <>
      {/* Mobile Toggle - Remarcado */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-white/20 active:scale-90 transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r-2 border-slate-100 text-slate-600 transition-all duration-500 ease-in-out shadow-[10px_0_40px_rgba(0,0,0,0.04)] transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo Section - Remarcado */}
        <div className="flex items-center gap-3 px-8 h-28 border-b-2 border-slate-50 bg-slate-50/30">
          <div className="bg-slate-900 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-lg shadow-slate-900/20">
            A2
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">
              ARISTA <span className="text-blue-600">STUDIO</span>
            </h1>
            <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] mt-1">SISTEMA DE CONTROL</p>
          </div>
        </div>
        
        {/* Navigation Menu - Remarcado */}
        <nav className="mt-6 px-4 pb-20 space-y-1.5 overflow-y-auto h-[calc(100vh-7rem)] custom-scrollbar">
          {menuItems.map((item) => {
            if (item.onlyAdmin && userEmail !== 'pabloviex@live.com.ar') return null;
            
            const Icon = item.icon;
            const isAvailable = checkModule(item);
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                disabled={!isAvailable && item.module !== 'is_admin'}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`group relative flex items-center justify-between w-full px-5 py-4 rounded-2xl transition-all duration-300 text-left overflow-hidden ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-[0_10px_25px_rgba(15,23,42,0.2)] scale-[1.02]' 
                    : isAvailable 
                      ? 'hover:bg-slate-50 text-slate-500 hover:text-slate-900 hover:translate-x-1' 
                      : 'opacity-40 grayscale cursor-not-allowed'
                }`}
              >
                {/* Active Marker */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 animate-pulse"></div>
                )}

                <div className="flex items-center relative z-10">
                  <Icon 
                    size={20} 
                    className={`mr-4 transition-transform duration-500 ${
                      isActive ? 'scale-110 text-blue-400' : 'group-hover:scale-110'
                    }`} 
                  />
                  <span className={`text-[11px] tracking-[0.1em] font-black transition-colors ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`}>
                    {item.label}
                  </span>
                </div>

                <div className="relative z-10">
                  {!isAvailable ? (
                    <Lock size={14} className="text-slate-300" />
                  ) : (
                    <ChevronRight 
                      size={14} 
                      className={`transition-all duration-300 ${
                        isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-40 group-hover:translate-x-0'
                      }`} 
                    />
                  )}
                </div>

                {/* Background Sparkle Effect for Active */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent pointer-events-none"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
