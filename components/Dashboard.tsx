
import React from 'react';
import { Clock, CheckCircle, AlertCircle, Wallet, FileText, MapPin, Calendar, Edit2, Truck, User } from 'lucide-react';
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
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Obras" value={obrasActivas.toString()} icon={<Clock size={20} className="text-blue-500" />} color="blue" />
        <StatCard title="Cotizaciones" value={presupuestosPendientes.toString()} icon={<FileText size={20} className="text-slate-500" />} color="slate" />
        <StatCard title="Entregadas" value={finalizadas.toString()} icon={<CheckCircle size={20} className="text-emerald-500" />} color="emerald" />
        <StatCard title="Cartera" value={`$${(facturacionTotal / 1000000).toFixed(1)}M`} icon={<Wallet size={20} className="text-indigo-500" />} color="indigo" />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Seguimiento de Obra</h3>
            <p className="text-slate-400 font-medium mt-1">Doble clic para gestionar los detalles técnicos</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-10 py-5">Identificación</th>
                <th className="px-10 py-5">Ubicación</th>
                <th className="px-10 py-5">Etapa Actual</th>
                <th className="px-10 py-5 text-right">Programación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {projects.concat(requests.map(r => ({ id: r.id, title: r.clientName, requestData: r, status: 'PEDIDO' as any } as any))).map(proj => (
                <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">
                        {proj.clientCode || '??'}
                      </div>
                      <p className="font-bold text-slate-800 text-[15px]">{proj.requestData?.clientName || proj.title}</p>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-sm text-slate-400 font-medium">
                    {proj.requestData?.address || 'S/D'}
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-black uppercase px-3 py-1.5 rounded-full border bg-white text-slate-600 border-slate-200">
                      {proj.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className="text-xs font-bold text-slate-300">Pendiente de fecha</span>
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

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center justify-between group hover:-translate-y-1 transition-all">
    <div>
      <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-3xl font-black text-slate-900">{value}</p>
    </div>
    <div className="bg-[#F8FAFC] p-4 rounded-[1.5rem] group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
      {icon}
    </div>
  </div>
);

export default Dashboard;
