
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Wallet, FileText, Plus, Building2, X, Loader2, UserPlus, ShieldCheck, Mail, Lock, Boxes, Globe, Ruler } from 'lucide-react';
import { Project, ProjectStatus, BudgetRequest, Organization } from '../types';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  projects: Project[];
  requests: BudgetRequest[];
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onNavigateToTab?: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, requests }) => {
  const { isGodMode, profile } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const sub = profile?.organization?.subscription;

  const obrasActivas = projects.filter(p => p.status === ProjectStatus.PRODUCCION || p.status === ProjectStatus.INSTALACION).length;
  const presupuestosPendientes = requests.length + projects.filter(p => p.status === ProjectStatus.PRESUPUESTO).length;
  const finalizadas = projects.filter(p => p.status === ProjectStatus.FINALIZADO).length;
  const facturacionTotal = projects.reduce((acc, p) => acc + (p.total || 0), 0);

  const fetchOrganizations = async () => {
    const { data, error } = await supabase.from('organizations').select('*').order('created_at', { ascending: false });
    if (!error && data) setOrganizations(data);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setIsCreating(true);
    try {
      const slug = newOrgName.toLowerCase().trim().replace(/\s+/g, '-');
      const { data: org, error: orgError } = await supabase.from('organizations').insert({ name: newOrgName, slug }).select().single();
      if (orgError) throw orgError;
      await supabase.from('subscriptions').insert({ organization_id: org.id });
      setNewOrgName('');
      setShowOrgModal(false);
      fetchOrganizations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Centro de Control</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Suscripción: {profile?.organization?.name || 'ADMIN'}</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-3xl border border-slate-200 shadow-sm">
          <ModuleIcon icon={<Boxes size={18}/>} label="Gestión" active />
          <ModuleIcon icon={<Globe size={18}/>} label="Vidrio" active={!!sub?.has_app_vidrio} />
          <ModuleIcon icon={<Building2 size={18}/>} label="Aluminio" active={!!sub?.has_app_aluminio} />
          <ModuleIcon icon={<Ruler size={18}/>} label="Medidor" active={!!sub?.has_app_medidor} />
          {isGodMode && (
            <button onClick={() => setShowOrgModal(true)} className="ml-4 bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg">
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Obras" value={obrasActivas.toString()} icon={<Clock size={20} className="text-blue-600" />} />
        <StatCard title="Cotizaciones" value={presupuestosPendientes.toString()} icon={<FileText size={20} className="text-slate-700" />} />
        <StatCard title="Finalizadas" value={finalizadas.toString()} icon={<CheckCircle size={20} className="text-emerald-600" />} />
        <StatCard title="Cartera" value={`$${(facturacionTotal / 1000000).toFixed(1)}M`} icon={<Wallet size={20} className="text-indigo-600" />} />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-10 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Actividad de Obras</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vista Global del Ecosistema</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
              <tr><th className="px-10 py-5">Identificación</th><th className="px-10 py-5">Ubicación</th><th className="px-10 py-5">Fase Actual</th><th className="px-10 py-5 text-right">Acción</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {projects.concat(requests.map(r => ({ id: r.id, title: r.client_name, requestData: r, status: 'SOLICITUD' as any } as any))).map(proj => (
                <tr key={proj.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-10 py-6">
                    <p className="font-black text-slate-900 text-[15px]">{proj.requestData?.client_name || proj.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{proj.client_code || 'PEDIDO'}</p>
                  </td>
                  <td className="px-10 py-6 text-sm text-slate-600 font-bold">{proj.requestData?.address || 'Pendiente'}</td>
                  <td className="px-10 py-6">
                    <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border shadow-sm ${
                      proj.status === 'FINALIZADO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      proj.status === 'SOLICITUD' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      {proj.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Abrir Carpeta</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showOrgModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 border border-slate-200">
            <h3 className="text-2xl font-black text-slate-900 uppercase mb-8">Nueva Empresa</h3>
            <form onSubmit={handleCreateOrg} className="space-y-6">
              <input required type="text" placeholder="Nombre..." className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold focus:bg-white outline-none transition-all" value={newOrgName} onChange={e => setNewOrgName(e.target.value)} />
              <button disabled={isCreating} type="submit" className="w-full py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">
                {isCreating ? <Loader2 className="animate-spin mx-auto" /> : "Registrar Empresa"}
              </button>
              <button type="button" onClick={() => setShowOrgModal(false)} className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest">Cerrar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ModuleIcon = ({ icon, label, active }: { icon: any, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${active ? 'bg-white text-slate-900 border-slate-200 shadow-sm' : 'bg-slate-50 text-slate-300 border-slate-100 opacity-50 grayscale'}`}>
    {icon}
    <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
  </div>
);

const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:border-blue-300 hover:shadow-lg">
    <div><h4 className="text-slate-600 text-[10px] font-black uppercase mb-1 tracking-widest">{title}</h4><p className="text-3xl font-black text-slate-900">{value}</p></div>
    <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">{icon}</div>
  </div>
);

export default Dashboard;
