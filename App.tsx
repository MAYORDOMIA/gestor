
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
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
import { Zap, ShieldAlert, RefreshCw } from 'lucide-react';
import { Project, BudgetRequest, ProjectStatus } from './types';

const AppContent: React.FC = () => {
  const { session, profile, loading, logout, isGodMode } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [requests, setRequests] = useState<BudgetRequest[]>([]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-6" />
          <h2 className="text-white font-black uppercase tracking-[0.4em] text-[10px]">Cargando Arista Studio...</h2>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={() => {}} />;
  }

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleAddRequest = (req: BudgetRequest) => {
    setRequests(prev => [req, ...prev]);
  };

  const handleSendBudget = (request: BudgetRequest, finalPdf: File, clientCode: string, total: number) => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      organization_id: profile?.organization_id || 'default',
      title: request.client_name,
      status: ProjectStatus.PRESUPUESTO,
      total: total,
      client_code: clientCode,
      created_at: new Date().toISOString().split('T')[0],
      requestData: request,
      finalBudgetUrl: URL.createObjectURL(finalPdf)
    };
    setProjects(prev => [newProject, ...prev]);
    setRequests(prev => prev.filter(r => r.id !== request.id));
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userEmail={session.user.email}
      />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-12">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {activeTab.replace('_', ' ')}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
                {profile?.organization?.name || 'ADMINISTRACIÓN CENTRAL'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-900 uppercase">{session.user.email}</p>
              <div className="flex items-center justify-end gap-1.5">
                {isGodMode && <ShieldAlert size={10} className="text-rose-600" />}
                <p className={`text-[9px] font-bold uppercase tracking-widest ${isGodMode ? 'text-rose-600' : 'text-blue-600'}`}>
                  {isGodMode ? 'MODO DIOS ACTIVO' : 'Usuario Admin'}
                </p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-3 bg-white border border-slate-200 text-rose-600 rounded-2xl hover:bg-rose-50 transition-all shadow-sm"
            >
              <Zap size={20} fill="currentColor" />
            </button>
          </div>
        </header>

        <div className="animate-fadeIn">
          {activeTab === 'dashboard' && <Dashboard projects={projects} requests={requests} onUpdateProject={handleUpdateProject} />}
          {activeTab === 'saas_admin' && isGodMode && <SaaSAdmin />}
          
          {activeTab === 'requests' && (
            <ProtectedRoute module="requests">
              <BudgetRequestManager requests={requests} onAddRequest={handleAddRequest} onSendBudget={handleSendBudget} />
            </ProtectedRoute>
          )}

          {activeTab === 'clients' && <ClientProjectManager projects={projects} onUpdateProject={handleUpdateProject} />}
          
          {activeTab === 'production' && (
            <ProtectedRoute module="production">
              <ManufacturingManager projects={projects} onUpdateProject={handleUpdateProject} />
            </ProtectedRoute>
          )}

          {activeTab === 'installation' && (
            <ProtectedRoute module="installation">
              <InstallationManager projects={projects} onUpdateProject={handleUpdateProject} />
            </ProtectedRoute>
          )}

          {activeTab === 'archive' && <ArchivedManager projects={projects} />}
          {activeTab === 'payments' && <PaymentsManager projects={projects} onUpdateProject={handleUpdateProject} />}
          {activeTab === 'suppliers' && <SuppliersManager supplierDebts={[]} onAddDebt={() => {}} onUpdateDebt={() => {}} onDeleteDebt={() => {}} />}
          {activeTab === 'accounting' && <AccountingManager projects={projects} supplierDebts={[]} />}
          {activeTab === 'attendance' && <EmployeeAttendanceManager />}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
