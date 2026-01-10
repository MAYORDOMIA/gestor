
import React from 'react';
import { LayoutDashboard, Users, Bot, Menu, X, ClipboardList, Factory, Truck, Archive, Wallet, HandCoins, Clock } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'requests', label: 'Pedidos / CRM', icon: Users },
    { id: 'clients', label: 'Obras Vigentes', icon: ClipboardList },
    { id: 'production', label: 'Fábrica / Taller', icon: Factory },
    { id: 'installation', label: 'Instalaciones', icon: Truck },
    { id: 'archive', label: 'Archivo Histórico', icon: Archive },
    { id: 'payments', label: 'Cobranzas', icon: HandCoins },
    { id: 'suppliers', label: 'Proveedores', icon: Truck },
    { id: 'accounting', label: 'Contabilidad', icon: Wallet },
    { id: 'ai', label: 'Asistente IA', icon: Bot },
    { id: 'attendance', label: 'Personal', icon: Clock },
  ];

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
        
        <nav className="mt-4 px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)] custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-5 py-3 rounded-2xl transition-all text-left ${
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
