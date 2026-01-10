
import { ShieldCheck, LayoutDashboard, Users, Bot, Factory, Truck, Archive, Wallet, HandCoins, TruckIcon, Calculator, Clock, Menu, X } from 'lucide-react';
import React from 'react';
import { UserRole, Profile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: Profile | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, profile }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin_empresa', 'empleado'] },
    { id: 'requests', label: 'Presupuestador', icon: Calculator, roles: ['super_admin', 'admin_empresa'] },
    { id: 'clients', label: 'Carpeta Clientes', icon: Users, roles: ['super_admin', 'admin_empresa'] },
    { id: 'production', label: 'Taller / Fábrica', icon: Factory, roles: ['super_admin', 'admin_empresa', 'empleado'] },
    { id: 'installation', label: 'Instalación', icon: Truck, roles: ['super_admin', 'admin_empresa', 'empleado'] },
    { id: 'archive', label: 'Historial / Archivo', icon: Archive, roles: ['super_admin', 'admin_empresa'] },
    { id: 'payments', label: 'Gestión Cobros', icon: HandCoins, roles: ['super_admin', 'admin_empresa'] },
    { id: 'suppliers', label: 'Proveedores', icon: TruckIcon, roles: ['super_admin', 'admin_empresa'] },
    { id: 'accounting', label: 'Contabilidad', icon: Wallet, roles: ['super_admin', 'admin_empresa'] },
    { id: 'ai', label: 'Asistente IA', icon: Bot, roles: ['super_admin', 'admin_empresa', 'empleado'] },
    { id: 'attendance', label: 'Asistencia', icon: Clock, roles: ['super_admin', 'admin_empresa', 'empleado'] },
    { id: 'saas-admin', label: 'Control Pablo', icon: ShieldCheck, roles: ['super_admin'] },
  ];

  const filteredItems = menuItems.filter(item => profile && item.roles.includes(profile.role));

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 text-slate-600 transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 px-8 h-24">
          <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black flex-shrink-0">A</div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">
            ARISTA <span className="text-blue-500 font-medium">ESTUDIO</span>
          </h1>
        </div>

        <div className="px-8 mb-6">
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Usuario</p>
            <p className="text-xs font-bold text-slate-900 truncate">{profile?.full_name || 'Usuario'}</p>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{profile?.role}</span>
          </div>
        </div>
        
        <nav className="px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-5 py-3.5 rounded-2xl transition-all text-left ${
                  activeTab === item.id 
                    ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' 
                    : 'hover:bg-slate-50 text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon size={18} className="mr-3 flex-shrink-0" />
                <span className="text-[13px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
