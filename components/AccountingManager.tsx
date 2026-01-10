
import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus, Search, Filter, Download, ArrowUpRight, ArrowDownLeft, Calendar, HandCoins, Truck } from 'lucide-react';
import { Transaction, TransactionType, Project, SupplierDebt } from '../types';

interface AccountingManagerProps {
  projects: Project[];
  supplierDebts: SupplierDebt[];
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2024-05-15', description: 'Pago Inicial Obra Delta', category: 'Venta', amount: 250000, type: TransactionType.INGRESO },
  { id: 't2', date: '2024-05-16', description: 'Compra Perfiles Aluar A30', category: 'Materiales', amount: 180000, type: TransactionType.EGRESO },
  { id: 't3', date: '2024-05-17', description: 'Servicio de Vidriería VASA', category: 'Materiales', amount: 45000, type: TransactionType.EGRESO },
  { id: 't4', date: '2024-05-18', description: 'Pago Final Residencia Gomez', category: 'Venta', amount: 500000, type: TransactionType.INGRESO },
  { id: 't5', date: '2024-05-19', description: 'Sueldos Taller - Quincena', category: 'Mano de Obra', amount: 120000, type: TransactionType.EGRESO },
];

const AccountingManager: React.FC<AccountingManagerProps> = ({ projects, supplierDebts }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: TransactionType.EGRESO,
    date: new Date().toISOString().split('T')[0],
    category: 'Venta'
  });

  const projectIncomes = projects.reduce((acc, p) => {
    const total = p.total || 0;
    const discountPercent = p.paymentData?.discountPercent || 0;
    const discountedTotal = total * (1 - (discountPercent / 100));
    const downPayment = p.paymentData?.downPayment || 0;
    const finalPayment = p.paymentData?.isFinalPaid ? Math.max(0, discountedTotal - downPayment) : 0;
    return acc + downPayment + finalPayment;
  }, 0);

  // Calcular egresos por pagos a proveedores
  const supplierExpenses = supplierDebts.reduce((acc, d) => acc + d.paidAmount, 0);
  
  // Calcular deuda total pendiente con proveedores (Informativo)
  const outstandingDebt = supplierDebts.reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0);

  const manualIncomes = transactions
    .filter(t => t.type === TransactionType.INGRESO)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = manualIncomes + projectIncomes;

  const manualExpenses = transactions
    .filter(t => t.type === TransactionType.EGRESO)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = manualExpenses + supplierExpenses;

  const balance = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const transaction: Transaction = {
      id: `t_${Date.now()}`,
      date: newTransaction.date || '',
      description: newTransaction.description || '',
      category: newTransaction.category || '',
      amount: Number(newTransaction.amount) || 0,
      type: newTransaction.type as TransactionType
    };
    setTransactions([transaction, ...transactions]);
    setShowAddModal(false);
    setNewTransaction({ type: TransactionType.EGRESO, date: new Date().toISOString().split('T')[0], category: 'Venta' });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Ingresos" 
          amount={totalIncome} 
          icon={<TrendingUp size={20} className="text-emerald-500" />} 
          color="emerald" 
          percentage="Sincronizado"
          extraInfo={`${projectIncomes > 0 ? `+$${projectIncomes.toLocaleString()} de obras` : ''}`}
        />
        <SummaryCard 
          title="Total Egresos" 
          amount={totalExpense} 
          icon={<TrendingDown size={20} className="text-rose-500" />} 
          color="rose" 
          percentage="Sincronizado"
          extraInfo={`${supplierExpenses > 0 ? `-$${supplierExpenses.toLocaleString()} a prov.` : ''}`}
        />
        <SummaryCard 
          title="Deuda Prov." 
          amount={outstandingDebt} 
          icon={<Truck size={20} className="text-amber-500" />} 
          color="amber" 
          percentage="Por pagar"
        />
        <SummaryCard 
          title="Balance Neto" 
          amount={balance} 
          icon={<Wallet size={20} className="text-blue-500" />} 
          color="blue" 
          percentage="En curso"
        />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">Movimientos de Caja</h3>
            <p className="text-sm text-slate-500">Registro unificado de transacciones</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar movimiento..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
            >
              <Plus size={18} />
              Nueva Transacción
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-4">Fecha</th>
                <th className="px-8 py-4">Descripción / Categoría</th>
                <th className="px-8 py-4">Tipo</th>
                <th className="px-8 py-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projectIncomes > 0 && (
                <tr className="bg-emerald-50/20 italic">
                   <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                      <HandCoins size={14} /> HOY
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-emerald-900 underline decoration-dotted decoration-emerald-300">Ingresos Totales por Obras</p>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">Sincronizado Automático</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200">
                      <ArrowUpRight size={12} /> INGRESO
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-sm text-emerald-600">
                    +${projectIncomes.toLocaleString()}
                  </td>
                </tr>
              )}

              {supplierExpenses > 0 && (
                <tr className="bg-rose-50/20 italic">
                   <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                      <Truck size={14} /> HOY
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-rose-900 underline decoration-dotted decoration-rose-300">Pagos Realizados a Proveedores</p>
                    <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest mt-0.5">Sincronizado Automático</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-rose-100 text-rose-700 border-rose-200">
                      <ArrowDownLeft size={12} /> EGRESO
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-sm text-rose-700">
                    -${supplierExpenses.toLocaleString()}
                  </td>
                </tr>
              )}
              
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 text-xs font-medium text-slate-600">
                    {t.date}
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-900">{t.description}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{t.category}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                      t.type === TransactionType.INGRESO 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {t.type === TransactionType.INGRESO ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                      {t.type}
                    </span>
                  </td>
                  <td className={`px-8 py-5 text-right font-black text-sm ${
                    t.type === TransactionType.INGRESO ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {t.type === TransactionType.INGRESO ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Nueva Transacción</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setNewTransaction({...newTransaction, type: TransactionType.INGRESO})} className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${newTransaction.type === TransactionType.INGRESO ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>Ingreso</button>
                <button type="button" onClick={() => setNewTransaction({...newTransaction, type: TransactionType.EGRESO})} className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${newTransaction.type === TransactionType.EGRESO ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>Egreso</button>
              </div>
              <input required type="text" className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm" placeholder="Descripción" value={newTransaction.description || ''} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold" placeholder="Monto" value={newTransaction.amount || ''} onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})} />
                <select className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm" value={newTransaction.category || ''} onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}>
                  <option value="Venta">Venta</option>
                  <option value="Materiales">Materiales</option>
                  <option value="Mano de Obra">Sueldos</option>
                  <option value="Impuestos">Impuestos</option>
                </select>
              </div>
              <input type="date" className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm" value={newTransaction.date} onChange={e => setNewTransaction({...newTransaction, date: e.target.value})} />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs">CANCELAR</button>
                <button type="submit" className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-slate-900/20">GUARDAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, amount, icon, color, percentage, extraInfo }: { title: string, amount: number, icon: React.ReactNode, color: string, percentage: string, extraInfo?: string }) => {
  const getColors = () => {
    switch(color) {
      case 'emerald': return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600' };
      case 'rose': return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600' };
      case 'amber': return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600' };
      default: return { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' };
    }
  };
  const colors = getColors();

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className={`p-3 rounded-2xl ${colors.bg} ${colors.border}`}>
          {icon}
        </div>
        <div className="text-right">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} block`}>{percentage}</span>
          {extraInfo && <span className="text-[9px] font-bold text-slate-400 mt-1 block">{extraInfo}</span>}
        </div>
      </div>
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
      <p className="text-2xl font-black mt-2 text-slate-900">${amount.toLocaleString()}</p>
    </div>
  );
};

export default AccountingManager;
