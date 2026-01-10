
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
import Login from './components/Login';
import { Bell, Search, Trash2, LayoutGrid, FileText, Settings, Hammer, Monitor, LogOut } from 'lucide-react';
import { BudgetRequest, Project, ProjectStatus, RequestStatus, SupplierDebt, Profile } from './types';
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
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState<BudgetRequest[]>(INITIAL_REQUESTS);
  const [sentProjects, setSentProjects] = useState<Project[]>([]);
  const [supplierDebts, setSupplierDebts] = useState<SupplierDebt[]>([]);
  const [initialEmpId, setInitialEmpId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) setProfile(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-pulse bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black">A</div>
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={() => {}} />;
  }

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

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setSentProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleAddDebt = (debt: SupplierDebt) => setSupplierDebts([debt, ...supplierDebts]);
  const handleUpdateDebt = (id: string, updates: Partial<SupplierDebt>) => {
    setSupplierDebts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };
  const handleDeleteDebt = (id: string) => setSupplierDebts(prev => prev.filter(d => d.id !== id));

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard projects={sentProjects} requests={requests} onUpdateProject={handleUpdateProject} />;
      case 'requests': return <BudgetRequestManager requests={requests} onAddRequest={handleAddRequest} onSendBudget={handleSendBudget} />;
      case 'ai': return <AIAssistant />;
      case 'clients': return <ClientProjectManager projects={sentProjects} onUpdateProject={handleUpdateProject} />;
      case 'production': return <ManufacturingManager projects={sentProjects} onUpdateProject={handleUpdateProject} />;
      case 'installation': return <InstallationManager projects={sentProjects} onUpdateProject={handleUpdateProject} />;
      case 'attendance': return <EmployeeAttendanceManager initialEmployeeId={initialEmpId} />;
      case 'archive': return <ArchivedManager projects={sentProjects} />;
      case 'payments': return <PaymentsManager projects={sentProjects} onUpdateProject={handleUpdateProject} />;
      case 'suppliers': return <SuppliersManager supplierDebts={supplierDebts} onAddDebt={handleAddDebt} onUpdateDebt={handleUpdateDebt} onDeleteDebt={handleDeleteDebt} />;
      case 'accounting': return <AccountingManager projects={sentProjects} supplierDebts={supplierDebts} />;
      case 'saas-admin': return profile?.role === 'super_admin' ? <SaaSAdmin /> : <Dashboard projects={sentProjects} requests={requests} onUpdateProject={handleUpdateProject} />;
      default: return <Dashboard projects={sentProjects} requests={requests} onUpdateProject={handleUpdateProject} />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Resumen de Actividad';
      case 'saas-admin': return 'Panel Control Pablo';
      case 'requests': return 'Nuevo Presupuesto';
      case 'ai': return 'Asistente Arista IA';
      case 'clients': return 'Carpeta de Clientes';
      case 'production': return 'Taller y Fabricación';
      default: return 'Carpintería de Aluminio';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-12 transition-all duration-300">
        <header className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{getTitle()}</h1>
              <p className="text-slate-400 font-medium">Empresa: {profile?.organization_id ? 'Gestión Activa' : 'Arista Master System'}</p>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-[1.5rem] shadow-sm border border-slate-100">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <LayoutGrid size={14} /> Inicio
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <LogOut size={14} /> Salir
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
