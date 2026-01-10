
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
import { Hammer, LayoutGrid } from 'lucide-react';
import { BudgetRequest, Project, ProjectStatus, RequestStatus, SupplierDebt } from './types';

const INITIAL_REQUESTS: BudgetRequest[] = [
  {
    id: 'req_1',
    clientName: 'Estudio Delta - Obra Palermo',
    phone: '11-5555-4444',
    email: 'obras@estudiodelta.com',
    address: 'Calle Falsa 123, CABA',
    description: '15 aberturas línea A30 con DVH para edificio residencial.',
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const empId = params.get('empId');
    if (empId) {
      setInitialEmpId(empId);
      setActiveTab('attendance');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
      manufacturingData: { 
        color: '', 
        line: '', 
        details: '', 
        deliveryDate: '',
        tasks: [
          { id: 'task_materials', label: 'Compra de materiales', isCompleted: false, notes: '' },
          { id: 'task_glass', label: 'Vidrios', isCompleted: false, notes: '' },
          { id: 'task_aluminum', label: 'Aluminio', isCompleted: false, notes: '' },
          { id: 'task_installation', label: 'Colocación', isCompleted: false, notes: '' },
        ],
        workshopLogs: []
      },
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
      case 'dashboard': return 'Panel de Control';
      case 'requests': return 'Pedidos y CRM';
      case 'ai': return 'Asistente IA Arista';
      case 'clients': return 'Obras Vigentes';
      case 'production': return 'Fábrica / Taller';
      case 'installation': return 'Montaje e Instalación';
      case 'attendance': return 'Personal y Asistencia';
      case 'archive': return 'Archivo Histórico';
      case 'payments': return 'Gestión de Cobros';
      case 'suppliers': return 'Proveedores e Insumos';
      case 'accounting': return 'Estado Contable';
      default: return 'Panel de Control';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 transition-all duration-300">
        <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{getTitle()}</h1>
            <p className="text-slate-400 font-medium mt-1">Gestión técnica de aberturas de aluminio</p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            {[
              { id: 'production', icon: Hammer, label: 'Taller' },
              { id: 'dashboard', icon: LayoutGrid, label: 'Resumen' }
            ].map(btn => (
              <button 
                key={btn.id}
                onClick={() => setActiveTab(btn.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === btn.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <btn.icon size={14} /> {btn.label}
              </button>
            ))}
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
