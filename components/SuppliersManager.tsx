
import React, { useState } from 'react';
import { SupplierDebt } from '../types';
import { Plus, Search, DollarSign, Calendar, Truck, Trash2, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react';

interface SuppliersManagerProps {
  supplierDebts: SupplierDebt[];
  onAddDebt: (debt: SupplierDebt) => void;
  onUpdateDebt: (id: string, updates: Partial<SupplierDebt>) => void;
  onDeleteDebt: (id: string) => void;
}

const SuppliersManager: React.FC<SuppliersManagerProps> = ({ supplierDebts, onAddDebt, onUpdateDebt, onDeleteDebt }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDebt, setNewDebt] = useState<Partial<SupplierDebt>>({
    supplierName: '',
    concept: '',
    totalAmount: 0,
    paidAmount: 0,
    dueDate: new Date().toISOString().split('T')[0],
  });

  const filteredDebts = supplierDebts.filter(d => 
    d.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.concept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const debt: SupplierDebt = {
      id: `debt_${Date.now()}`,
      supplierName: newDebt.supplierName || '',
      concept: newDebt.concept || '',
      totalAmount: Number(newDebt.totalAmount) || 0,
      paidAmount: Number(newDebt.paidAmount) || 0,
      dueDate: newDebt.dueDate || '',
      createdAt: new Date().toISOString().split('T')[0],
      isPaid: (Number(newDebt.paidAmount) || 0) >= (Number(newDebt.totalAmount) || 0)
    };
    onAddDebt(debt);
    setShowAddModal(false);
    setNewDebt({ supplierName: '', concept: '', totalAmount: 0, paidAmount: 0, dueDate: new Date().toISOString().split('T')[0] });
  };

  const handleUpdatePayment = (id: string, amount: number) => {
    const debt = supplierDebts.find(d => d.id === id);
    if (debt) {
      const newPaid = Math.min(debt.totalAmount, amount);
      onUpdateDebt(id, { paidAmount: newPaid, isPaid: newPaid >= debt.totalAmount });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Proveedores</h2>
          <p className="text-slate-500 text-sm">Control de facturas, insumos y deudas pendientes.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          Agendar Gasto/Deuda
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar proveedor o concepto..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDebts.map((debt) => {
          const progress = (debt.paidAmount / debt.totalAmount) * 100;
          const remaining = debt.totalAmount - debt.paidAmount;
          const isOverdue = new Date(debt.dueDate) < new Date() && !debt.isPaid;

          return (
            <div key={debt.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:border-blue-300 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-100 p-3 rounded-2xl text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Truck size={24} />
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${debt.isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {debt.isPaid ? 'Saldado' : 'Pendiente'}
                  </span>
                  {isOverdue && (
                    <span className="text-[8px] font-bold text-red-500 mt-1 flex items-center gap-1 uppercase">
                      <AlertTriangle size={8} /> Vencido
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 truncate">{debt.supplierName}</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">{debt.concept}</p>

              <div className="space-y-4">
                <div className="flex justify-between items-end text-sm">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase block">Total Deuda</span>
                    <span className="font-black text-slate-800">${debt.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">Pagado</span>
                    <span className="font-bold text-emerald-600">${debt.paidAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${debt.isPaid ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                    <Calendar size={12} />
                    Vence: {debt.dueDate}
                  </div>
                  <button 
                    onClick={() => onDeleteDebt(debt.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="pt-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Abonar / Actualizar Pago ($)</label>
                   <div className="flex gap-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input 
                          type="number" 
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 ring-blue-500/10 outline-none"
                          placeholder="Monto..."
                          value={debt.paidAmount}
                          onChange={(e) => handleUpdatePayment(debt.id, Number(e.target.value))}
                        />
                      </div>
                      <button 
                        disabled={debt.isPaid}
                        onClick={() => handleUpdatePayment(debt.id, debt.totalAmount)}
                        className="px-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-tight disabled:opacity-30"
                      >
                        Saldar
                      </button>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredDebts.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
            <Truck size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-medium italic">No hay registros de proveedores.</p>
          </div>
        )}
      </div>

      {/* Modal Agregar Gasto */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Agendar Deuda</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase">Nombre del Proveedor</label>
                <input required type="text" className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold" placeholder="Ej: ALUAR / VASA" value={newDebt.supplierName} onChange={e => setNewDebt({...newDebt, supplierName: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase">Concepto / Insumo</label>
                <input required type="text" className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm" placeholder="Ej: Perfiles Modena Blanco" value={newDebt.concept} onChange={e => setNewDebt({...newDebt, concept: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Monto Total</label>
                  <input required type="number" className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold" value={newDebt.totalAmount || ''} onChange={e => setNewDebt({...newDebt, totalAmount: Number(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Pago Inicial</label>
                  <input type="number" className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold" value={newDebt.paidAmount || ''} onChange={e => setNewDebt({...newDebt, paidAmount: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase">Fecha de Vencimiento</label>
                <input type="date" className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm" value={newDebt.dueDate} onChange={e => setNewDebt({...newDebt, dueDate: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase">Cancelar</button>
                <button type="submit" className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-blue-500/20">Registrar Deuda</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersManager;
