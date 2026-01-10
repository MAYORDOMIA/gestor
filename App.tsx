
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import BudgetRequestManager from './components/BudgetRequestManager';
import ClientProjectManager from './components/ClientProjectManager';
import ManufacturingManager from './components/ManufacturingManager';
import InstallationManager from './components/InstallationManager';
import ArchivedManager from './components/ArchivedManager';
import AccountingManager from './components/AccountingManager';
import PaymentsManager from './components/PaymentsManager';
import SuppliersManager from './components/SuppliersManager';
import EmployeeAttendanceManager from './components/EmployeeAttendanceManager';
import SaaSAdmin from './components/SaaSAdmin';
import { Bell, Search, Trash2, LayoutGrid, FileText, Settings, Hammer, Monitor, Lock, RefreshCcw, ShieldAlert, Zap } from 'lucide-react';
import { BudgetRequest, Project, ProjectStatus, RequestStatus, SupplierDebt, Subscription } from './types';
import { supabase } from './services/supabase';

const INITIAL_REQUESTS: BudgetRequest[] = [
  {
    id: 'req_1',
    clientName: 'Estudio de Arquitectura Delta',
    phone: '11-5555-4444',
    email: 'obras@estudiodelta.com',
    address: 'Calle Falsa 123, CABA',
    description: 'Necesitamos presupuesto para 15 aberturas línea A30 con DVH para edificio residencial.',
    status: RequestStatus.PENDIENTE,
    createdAt: '2024-05-20',
    files: []
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState<BudgetRequest[]>(INITIAL_REQUESTS);
  const [sentProjects, setSentProjects] = useState<Project[]>([]);
  const [supplierDebts, setSupplierDebts] = useState<SupplierDebt[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoadingSub, setIsLoadingSub] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('pabloviex@live.com.ar'); // Simulación de usuario logueado

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    setIsLoadingSub(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .limit(1)
        .single();

      if (data) setSubscription(data);
    } catch (e) {
      console.error("Error validando suscripción");
    } finally {
      setIsLoadingSub(false);
    }
  };

  const hasAccess = (tab: string): boolean => {
    if (userEmail === 'pabloviex@live.com.ar') return true; 
    if (!subscription) return false;

    const gestorTabs = ['dashboard', 'clients', 'production', 'installation', 'archive', 'payments', 'suppliers', 'accounting'];
    const medidorTabs = ['attendance'];
    const cotizadorTabs = ['requests', 'ai'];

    if (gestorTabs.includes(tab)) return subscription.has_gestor;
    if (medidorTabs.includes(tab)) return subscription.has_medidor;
    if (cotizadorTabs.includes(tab)) return subscription.has_cotizador_vidrio || subscription.has_cotizador_aluminio;
    
    return true;
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setSentProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleAddRequest = (req: BudgetRequest) => setRequests([req, ...requests]);

  const handleSendBudget = (request: BudgetRequest, pdf: File, clientCode: string, total: number) => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      title: `Obra: ${request.clientName}`,
      clientId: request.id,
      status: ProjectStatus.PRESUPUESTO,
      items: [],
      createdAt: new Date().toLocaleDateString(),
      total: total,
      finalBudgetUrl: URL.createObjectURL(pdf),
      requestData: request,
      clientCode: clientCode || '',
      manufacturingData: { color: '', line: '', details: '', deliveryDate: '' },
      paymentData: { downPayment: 0, isFinalPaid: false }
    };
    setSentProjects([newProject, ...sentProjects]);
    setRequests(requests.filter(r => r.id !== request.id));
    setActiveTab('clients'); 
  };

  const renderContent = () => {
    if (!hasAccess(activeTab)) {
      return (
        <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
          <div className="bg-white p-16 rounded-[4rem] border-2 border-rose-100 shadow-[0_20px_50px_rgba(244,63,94,0.1)] text-center max-w-md">
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Lock size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Plan no Activado</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              Este módulo requiere una suscripción activa. Contacta al soporte técnico para habilitarlo.
            </p>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="px-12 py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 hover:scale-105 transition-all shadow-xl"
            >
              Regresar al Dashboard
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard projects={sentProjects} requests={requests} onUpdateProject={handleUpdateProject} />;
      case 'requests': return <BudgetRequestManager requests={requests} onAddRequest={handleAddRequest} onSendBudget={handleSendBudget} />;
      case 'ai': return <AIAssistant />;
      case 'clients': return <ClientProjectManager projects={sentProjects} onUpdateProject={handleUpdateProject} />;
      case 'production': return <ManufacturingManager projects={sentProjects} onUpdateProject={handleUpdateProject} />;
      case 'installation': return <InstallationManager projects={sentProjects} onUpdateProject={handleUpdateProject} />;
      case 'attendance': return <EmployeeAttendanceManager />;
      case 'archive': return <ArchivedManager projects={sentProjects} />;
      case 'payments': return <PaymentsManager projects={sentProjects} onUpdateProject={handleUpdateProject} />;
      case 'suppliers': return <SuppliersManager supplierDebts={supplierDebts} onAddDebt={d => setSupplierDebts([d, ...supplierDebts])} onUpdateDebt={(id, u) => setSupplierDebts(prev => prev.map(d => d.id === id ? {...d, ...u} : d))} onDeleteDebt={id => setSupplierDebts(prev => prev.filter(d => d.id !== id))} />;
      case 'accounting': return <AccountingManager projects={sentProjects} supplierDebts={supplierDebts} />;
      case 'saas-admin': return <SaaSAdmin />;
      default: return <Dashboard projects={sentProjects} requests={requests} onUpdateProject={handleUpdateProject} />;
    }
  };

  if (isLoadingSub) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={32} />
        </div>
        <p className="text-blue-400 font-black uppercase text-[11px] tracking-[0.4em] animate-pulse">Autenticando Acceso...</p>
      </div>
    </div>
  );

  const isOrgActive = subscription?.has_gestor || subscription?.has_medidor || subscription?.has_cotizador_vidrio || subscription?.has_cotizador_aluminio;
  
  if (!isOrgActive && userEmail !== 'pabloviex@live.com.ar') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A] p-6 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="bg-white p-12 lg:p-24 rounded-[5rem] border border-slate-200 shadow-[0_50px_100px_rgba(0,0,0,0.3)] text-center max-w-3xl animate-in zoom-in-95 duration-700 relative z-10">
          <div className="w-36 h-36 bg-slate-900 text-white rounded-[3.5rem] flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-blue-500/20">
            <ShieldAlert size={72} />
          </div>
          <h1 className="text-5xl font-[900] text-slate-900 tracking-tighter mb-8 leading-tight">Acceso Bloqueado por el Administrador</h1>
          <p className="text-slate-500 text-xl font-medium leading-relaxed mb-16 max-w-xl mx-auto">
            Tu suscripción a <span className="text-slate-900 font-black">ARISTA ESTUDIO</span> no se encuentra activa en este momento.
          </p>
          <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 shadow-inner group">
            <p className="text-[11px] font-[900] text-slate-400 uppercase tracking-[0.3em] mb-3 group-hover:text-blue-500 transition-colors">Departamento Comercial</p>
            <p className="text-2xl font-black text-slate-900">pabloviex@live.com.ar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-14 transition-all duration-300">
        <header className="mb-14">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-1">
              <h1 className="text-5xl font-[900] text-slate-900 tracking-tighter">Arista Studio 2</h1>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] ml-1">Professional Management Platform</p>
            </div>
            
            <div className="glass-effect px-8 py-4 rounded-[2rem] border border-white shadow-xl flex items-center gap-4 hover:border-blue-300 transition-all cursor-default group">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform"></div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Node Cluster: Online</span>
            </div>
          </div>
        </header>

        <div className="animate-fadeIn">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
