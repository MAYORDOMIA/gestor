
import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';
import { Search, DollarSign, CheckCircle2, AlertCircle, Calendar, User, MapPin, HandCoins, Edit2, Percent } from 'lucide-react';

interface PaymentsManagerProps {
  projects: Project[];
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
}

const PaymentsManager: React.FC<PaymentsManagerProps> = ({ projects, onUpdateProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTotalId, setEditingTotalId] = useState<string | null>(null);

  const filteredProjects = projects.filter(p => 
    p.requestData?.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.clientCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdatePayment = (id: string, downPayment: number) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      onUpdateProject(id, {
        paymentData: {
          ...(project.paymentData || { downPayment: 0, isFinalPaid: false }),
          downPayment: downPayment,
          downPaymentDate: new Date().toISOString().split('T')[0]
        }
      });
    }
  };

  const handleUpdateDiscount = (id: string, discount: number) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      onUpdateProject(id, {
        paymentData: {
          ...(project.paymentData || { downPayment: 0, isFinalPaid: false }),
          discountPercent: discount
        }
      });
    }
  };

  const handleUpdateTotal = (id: string, total: number) => {
    onUpdateProject(id, { total: total });
  };

  const handleToggleFinalPayment = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      const isPaid = !project.paymentData?.isFinalPaid;
      onUpdateProject(id, {
        paymentData: {
          ...(project.paymentData || { downPayment: 0, isFinalPaid: false }),
          isFinalPaid: isPaid,
          finalPaymentDate: isPaid ? new Date().toISOString().split('T')[0] : undefined
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pagos de Obras</h2>
          <p className="text-slate-500 text-sm">Control de anticipos y liquidación final de proyectos.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por obra o cliente..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const total = project.total || 0;
          const discountPercent = project.paymentData?.discountPercent || 0;
          const discountedTotal = total * (1 - (discountPercent / 100));
          const downPayment = project.paymentData?.downPayment || 0;
          const isFinalPaid = project.paymentData?.isFinalPaid || false;
          const balance = Math.max(0, discountedTotal - downPayment);

          return (
            <div key={project.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-400 transition-all">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-4">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                    <HandCoins size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{project.clientCode}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{project.status}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{project.requestData?.clientName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {project.requestData?.address}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col justify-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Monto Base</span>
                  {editingTotalId === project.id ? (
                    <div className="flex items-center gap-1">
                       <DollarSign size={12} className="text-slate-400" />
                       <input 
                        autoFocus
                        type="number" 
                        className="bg-white border border-blue-400 rounded px-2 py-1 text-sm font-black w-32 outline-none"
                        value={total}
                        onBlur={() => setEditingTotalId(null)}
                        onChange={(e) => handleUpdateTotal(project.id, Number(e.target.value))}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingTotalId(null)}
                       />
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2 group cursor-pointer" onClick={() => setEditingTotalId(project.id)}>
                      <span className="text-lg font-black text-slate-500 line-through">${total.toLocaleString()}</span>
                      <Edit2 size={12} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xl font-black text-slate-900 mt-1">Final: ${discountedTotal.toLocaleString()}</span>
                  )}
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Lado Anticipo y Descuento */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Percent size={10} /> Descuento
                      </label>
                      <div className="relative">
                        <input 
                          type="number"
                          className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-blue-600 outline-none focus:ring-2 ring-blue-500/20 transition-all"
                          placeholder="0"
                          value={discountPercent || ''}
                          onChange={(e) => handleUpdateDiscount(project.id, Number(e.target.value))}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <DollarSign size={10} /> Anticipo
                      </label>
                      <input 
                        type="number"
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 ring-blue-500/20 transition-all"
                        placeholder="Monto..."
                        value={downPayment || ''}
                        onChange={(e) => handleUpdatePayment(project.id, Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">Los cobros realizados se reflejan en el balance general.</p>
                </div>

                {/* Lado Saldo Final */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saldo Pendiente</label>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isFinalPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {isFinalPaid ? 'Liquidado' : 'A Cobrar'}
                    </span>
                  </div>
                  <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${isFinalPaid ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <span className="text-xs font-bold text-slate-500 block">Restante</span>
                      <span className={`text-lg font-black ${isFinalPaid ? 'text-emerald-600 line-through opacity-50' : 'text-slate-900'}`}>
                        ${balance.toLocaleString()}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleToggleFinalPayment(project.id)}
                      className={`p-3 rounded-xl transition-all ${isFinalPaid ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-400 shadow-sm'}`}
                    >
                      <CheckCircle2 size={24} />
                    </button>
                  </div>
                  {isFinalPaid && (
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                      <CheckCircle2 size={12} /> Saldo liquidado el {project.paymentData?.finalPaymentDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filteredProjects.length === 0 && (
          <div className="xl:col-span-2 py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
            <HandCoins size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-medium italic">No se encontraron obras para gestionar pagos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsManager;
