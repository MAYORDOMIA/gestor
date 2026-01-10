
import React from 'react';
import { Clock, CheckCircle, AlertCircle, Wallet, FileText, MapPin, Calendar, Edit2, Truck, User, ArrowUpRight } from 'lucide-react';
import { Project, ProjectStatus, BudgetRequest } from '../types';

interface DashboardProps {
  projects: Project[];
  requests: BudgetRequest[];
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onNavigateToTab?: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, requests, onUpdateProject, onNavigateToTab }) => {
  const obrasActivas = projects.filter(p => p.status === ProjectStatus.PRODUCCION || p.status === ProjectStatus.INSTALACION).length;
  const presupuestosPendientes = requests.length + projects.filter(p => p.status === ProjectStatus.PRESUPUESTO).length;
  const finalizadas = projects.filter(p => p.status === ProjectStatus.FINALIZADO).length;
  const facturacionTotal = projects.reduce((acc, p) => acc + (p.total || 0), 0);

  return (
    <div className="space-y-16 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Obras Activas" value={obrasActivas.toString()} icon={<Clock size={24} className="text-blue-500" />} color="blue" />
        <StatCard title="Cotizaciones" value={presupuestosPendientes.toString()} icon={<FileText size={24} className="text-slate-500" />} color="slate" />
        <StatCard title="Entregadas" value={finalizadas.toString()} icon={<CheckCircle size={24} className="text-emerald-500" />} color="emerald" />
        <StatCard title="Capital Cartera" value={`$${(facturacionTotal / 1000000).toFixed(1)}M`} icon={<Wallet size={24} className="text-indigo-500" />} color="indigo" />
      </div>

      <div className="bg-white rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border-2 border-slate-50 overflow-hidden group">
        <div className="p-12 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/20">
          <div>
            <h3 className="text-3xl font-[900] text-slate-900 tracking-tighter mb-1">Mesa de Control</h3>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Monitoreo de proyectos en tiempo real</p>
          </div>
          <button className="p-4 bg-white border-2 border-slate-100 rounded-3xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
            <ArrowUpRight size={24} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-[11px] font-[900] text-slate-400 uppercase tracking-[0.25em] border-b-2 border-slate-50">
                <th className="px-12 py-8">Proyecto / Cliente</th>
                <th className="px-12 py-8">Localización</th>
                <th className="px-12 py-8">Estado Operativo</th>
                <th className="px-12 py-8 text-right">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {projects.concat(requests.map(r => ({ id: r.id, title: r.clientName, requestData: r, status: 'NUEVA SOLICITUD' as any } as any))).map(proj => (
                <tr key={proj.id} className="hover:bg-slate-50/80 transition-all cursor-default group/row">
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center font-black text-[15px] shadow-xl group-hover/row:scale-110 transition-transform">
                        {proj.clientCode || '??'}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-[17px] tracking-tight">{proj.requestData?.clientName || proj.title}</p>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-0.5">ID: {proj.id.split('_')[1]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-8 text-sm text-slate-500 font-bold italic">
                    {proj.requestData?.address || 'Pendiente de carga'}
                  </td>
                  <td className="px-12 py-8">
                    <span className="text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full border-2 bg-white shadow-sm inline-flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${proj.status === ProjectStatus.PRODUCCION ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                      {proj.status}
                    </span>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">S/D Programada</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => {
  const getGlow = () => {
    switch(color) {
      case 'blue': return 'group-hover:shadow-[0_20px_40px_rgba(37,99,235,0.15)]';
      case 'emerald': return 'group-hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)]';
      case 'indigo': return 'group-hover:shadow-[0_20px_40px_rgba(79,70,229,0.15)]';
      default: return 'group-hover:shadow-[0_20px_40px_rgba(15,23,42,0.15)]';
    }
  };

  return (
    <div className={`bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-xl flex items-center justify-between group hover:-translate-y-2 transition-all duration-500 ${getGlow()}`}>
      <div>
        <h4 className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-3">{title}</h4>
        <p className="text-4xl font-[900] text-slate-900 tracking-tighter leading-none">{value}</p>
      </div>
      <div className="bg-slate-50 p-6 rounded-[2rem] group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner">
        {icon}
      </div>
    </div>
  );
};

export default Dashboard;
