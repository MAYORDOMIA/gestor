
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
import { Bell, Search, Trash2, LayoutGrid, FileText, Settings, Hammer, Monitor } from 'lucide-react';
import { BudgetRequest, Project, ProjectStatus, RequestStatus, SupplierDebt } from './types';

const INITIAL_REQUESTS: BudgetRequest[] = [
  {
    id: 'req_1',
    clientName: 'Estudio de Arquitectura Delta',
    phone: '11-5555-4444',
    email: 'obras@estudiodelta.com',
    address: 'Calle Falsa 123, CABA',
    description: 'Necesitamos presupuesto para 15 aberturas línea A30 con DVH para edificio residencial. Adjunto planos de carpintería.',
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
  const [initialEmpId, setInitialEmpId] = useState<string | null>(null);

  // Lógica para detectar escaneo de QR desde el celular
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const empId = params.get('empId');
    if (empId) {
      setInitialEmpId(empId);
      setActiveTab('attendance');
      // Limpiamos la URL para que no quede el ID ahí siempre
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleAddRequest = (req: BudgetRequest) => {
    setRequests([req, ...requests]);
  };

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
      case 'dashboard': return <Dashboard projects={sentProjects} requests={requests} onUpdateProject={handleUpdateProject} onNavigateToTab={setActiveTab} />;
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
      default: return <Dashboard projects={sentProjects} requests={requests} onUpdateProject={handleUpdateProject} onNavigateToTab={setActiveTab} />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Resumen de Actividad';
      case 'requests': return 'Nuevo Presupuesto';
      case 'ai': return 'Asistente Arista IA';
      case 'clients': return 'Carpeta de Clientes';
      case 'production': return 'Taller y Fabricación';
      case 'installation': return 'Instalación en Obra';
      case 'attendance': return 'Control de Asistencia';
      case 'archive': return 'Archivo Histórico';
      case 'payments': return 'Control de Cobros';
      case 'suppliers': return 'Deudas Proveedores';
      case 'accounting': return 'Contabilidad';
      default: return 'Panel de Control';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-12 transition-all duration-300">
        <header className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{getTitle()}</h1>
              <p className="text-slate-400 font-medium">Gestión de documentación técnica y comercial</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-[1.5rem] shadow-sm border border-slate-100">
              <button 
                onClick={() => setActiveTab('requests')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'requests' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Monitor size={14} /> Presupuesto
              </button>
              <button 
                onClick={() => setActiveTab('clients')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'clients' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <FileText size={14} /> Carpeta
              </button>
              <button 
                onClick={() => setActiveTab('production')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'production' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Hammer size={14} /> Taller
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <LayoutGrid size={14} /> Resumen
              </button>
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
