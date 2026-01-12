
import React from 'react';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const { 
  LayoutDashboard: DashIcon, 
  Users: UsersIcon, 
  Factory: FactoryIcon, 
  Truck: TruckIcon2, 
  Archive: ArchiveIcon, 
  Wallet: WalletIcon, 
  HandCoins: HandIcon, 
  Truck: SupplierIcon, 
  Calculator: CalcIcon, 
  Clock: ClockIcon, 
  Menu: MenuIcon, 
  X: XIcon,
  ShieldAlert: AdminIcon,
  Globe,
  Ruler,
  Boxes
} = LucideIcons as any;

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userEmail }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isGodMode, profile } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashIcon },
    { id: 'requests', label: 'Presupuestador', icon: CalcIcon },
    { id: 'clients', label: 'Carpeta Clientes', icon: UsersIcon },
    { id: 'production', label: 'Taller / Fábrica', icon: FactoryIcon },
    { id: 'installation', label: 'Instalación', icon: TruckIcon2 },
    { id: 'archive', label: 'Historial / Archivo', icon: ArchiveIcon },
    { id: 'payments', label: 'Gestión Cobros', icon: HandIcon },
    { id: 'suppliers', label: 'Proveedores', icon: SupplierIcon },
    { id: 'accounting', label: 'Contabilidad', icon: WalletIcon },
    { id: 'attendance', label: 'Fichaje Personal', icon: ClockIcon },
  ];

  if (isGodMode) {
    menuItems.push({ id: 'saas_admin', label: 'Admin SaaS', icon: AdminIcon });
  }

  const sub = profile?.organization?.subscription;

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm"
      >
        {isOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 text-slate-500 transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col gap-0 border-b border-slate-50">
          <div className="flex items-center gap-3 px-8 h-20">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black flex-shrink-0 shadow-lg shadow-blue-500/20">A</div>
            <h1 className="text-md font-black text-slate-900 tracking-tighter uppercase leading-none">
              Arista<span className="text-blue-600">estudio</span>
            </h1>
          </div>

          {/* Selector de Ecosistema */}
          <div className="px-4 pb-4 grid grid-cols-4 gap-1.5">
            <AppTile icon={<Boxes size={14}/>} label="GEST" active tip="Gestión Comercial" />
            <AppTile icon={<Globe size={14}/>} label="VID" disabled={!sub?.has_app_vidrio} tip="Cómputo Vidrio" />
            <AppTile icon={<DashIcon size={14}/>} label="ALU" disabled={!sub?.has_app_aluminio} tip="Cómputo Aluminio" />
            <AppTile icon={<Ruler size={14}/>} label="MED" disabled={!sub?.has_app_medidor} tip="App Medidor" />
          </div>
        </div>
        
        <nav className="px-4 py-6 space-y-1 overflow-y-auto h-[calc(100vh-10rem)] custom-scrollbar">
          <p className="px-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Administración</p>
          {menuItems.map((item) => {
            const Icon = item.icon || DashIcon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-5 py-3 rounded-[1.1rem] transition-all text-left group ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 font-black' 
                    : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon size={17} className={`mr-3 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="text-[12px] font-bold tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

const AppTile = ({ icon, label, active = false, disabled = false, tip }: { icon: any, label: string, active?: boolean, disabled?: boolean, tip: string }) => (
  <div className="relative group/tile">
    <button 
      disabled={disabled}
      className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${
        active 
          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
          : disabled 
            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-40' 
            : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200 hover:text-blue-600'
      }`}
    >
      {icon}
      <span className="text-[7px] font-black">{label}</span>
    </button>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black rounded pointer-events-none opacity-0 group-hover/tile:opacity-100 transition-opacity whitespace-nowrap z-50">
      {tip} {disabled && "(Bloqueado)"}
    </div>
  </div>
);

export default Sidebar;
