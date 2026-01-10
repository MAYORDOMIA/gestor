
import React, { useState } from 'react';
import { Plus, Trash2, Calculator, Save, FileDown } from 'lucide-react';
import { BudgetItem } from '../types';

const BudgetManager: React.FC = () => {
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', description: 'Ventana Corrediza 2 Hojas', width: 1.5, height: 1.1, profile: 'Modena', glass: 'DVH 4/9/4', quantity: 2, unitPrice: 125000 }
  ]);

  const addItem = () => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      description: 'Nueva abertura',
      width: 1,
      height: 1,
      profile: 'Modena',
      glass: 'Float 4mm',
      quantity: 1,
      unitPrice: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const total = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold">Generador de Presupuestos</h2>
          <p className="text-slate-500">Crea cotizaciones detalladas de carpintería</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
            <FileDown size={18} />
            Exportar PDF
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
            <Save size={18} />
            Guardar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Descripción / Medidas</th>
              <th className="px-6 py-4 text-center">Cant.</th>
              <th className="px-6 py-4">Línea / Vidrio</th>
              <th className="px-6 py-4 text-right">Unitario</th>
              <th className="px-6 py-4 text-right">Subtotal</th>
              <th className="px-6 py-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <input 
                    type="text" 
                    value={item.description}
                    onChange={(e) => {}}
                    className="font-medium bg-transparent border-none outline-none focus:ring-1 ring-blue-500 rounded p-1 w-full"
                  />
                  <div className="flex gap-2 mt-1 text-slate-400 text-sm">
                    <span>{item.width}m x {item.height}m</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                   <input type="number" value={item.quantity} className="w-12 text-center border rounded p-1" readOnly />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium">{item.profile}</div>
                  <div className="text-xs text-slate-500">{item.glass}</div>
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  ${item.unitPrice.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">
                  ${(item.unitPrice * item.quantity).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-2">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 bg-slate-50/50 flex justify-center">
          <button 
            onClick={addItem}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium px-4 py-2 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-lg transition-all"
          >
            <Plus size={18} />
            Agregar Ítem
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="bg-slate-900 text-white p-6 rounded-2xl w-full sm:w-80 shadow-xl">
          <div className="flex justify-between items-center mb-2 text-slate-400 text-sm">
            <span>Subtotal</span>
            <span>${total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-4 text-slate-400 text-sm">
            <span>IVA (21%)</span>
            <span>${(total * 0.21).toLocaleString()}</span>
          </div>
          <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
            <span className="font-bold text-lg">TOTAL</span>
            <span className="font-bold text-2xl text-blue-400">${(total * 1.21).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;
