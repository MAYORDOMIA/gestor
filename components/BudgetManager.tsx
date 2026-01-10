
import React, { useState } from 'react';
import { Plus, Trash2, Calculator, Save, FileDown, Bot, Sparkles, Ruler } from 'lucide-react';
import { BudgetItem } from '../types';
import { askGemini } from '../services/geminiService';

const BudgetManager: React.FC = () => {
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', description: 'Ventana Corrediza 2 Hojas', width: 1.5, height: 1.1, profile: 'Modena', glass: 'DVH 4/9/4', quantity: 2, unitPrice: 125000 }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const addItem = () => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      description: 'Nueva abertura',
      width: 1.0,
      height: 1.0,
      profile: 'Modena',
      glass: 'Float 4mm',
      quantity: 1,
      unitPrice: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => setItems(items.filter(item => item.id !== id));

  const consultAI = async (item: BudgetItem) => {
    setAiLoading(true);
    const prompt = `Calcula los descuentos de corte para una ventana ${item.description} de ${item.width}x${item.height} en línea ${item.profile}. Detalla medida de hojas, marco y vidrios.`;
    const response = await askGemini(prompt);
    setAiAdvice(response);
    setAiLoading(false);
  };

  const total = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900">Cotización de Carpintería</h2>
            <p className="text-sm text-slate-400">Detalle de aberturas y cerramientos</p>
          </div>
          <div className="flex gap-2">
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 transition-colors">
              <FileDown size={20} />
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20">
              Guardar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Identificación / Medidas</th>
                <th className="px-4 py-5 text-center">Cant.</th>
                <th className="px-4 py-5">Materiales</th>
                <th className="px-4 py-5 text-right">Unitario</th>
                <th className="px-8 py-5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <input className="font-bold text-slate-800 bg-transparent outline-none focus:text-blue-600" value={item.description} onChange={() => {}} />
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-medium">
                        <Ruler size={12} /> {item.width}m x {item.height}m
                        <button onClick={() => consultAI(item)} className="ml-2 text-blue-500 hover:underline flex items-center gap-1">
                          <Sparkles size={10} /> Calcular Cortes
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6 text-center">
                    <input type="number" className="w-12 text-center bg-slate-100 rounded-lg py-1 font-bold text-sm" value={item.quantity} readOnly />
                  </td>
                  <td className="px-4 py-6">
                    <p className="text-xs font-bold text-slate-600">{item.profile}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{item.glass}</p>
                  </td>
                  <td className="px-4 py-6 text-right font-bold text-slate-400 text-sm">
                    ${item.unitPrice.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <span className="font-black text-slate-900">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                      <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-rose-300 hover:text-rose-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-6 bg-slate-50/30 flex justify-center">
            <button onClick={addItem} className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-blue-400 hover:text-blue-500 transition-all">
              <Plus size={16} /> Agregar Abertura
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/10">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Resumen de Inversión</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Subtotal</span>
              <span className="font-bold">${total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">IVA (21%)</span>
              <span className="font-bold">${(total * 0.21).toLocaleString()}</span>
            </div>
            <div className="pt-6 border-t border-white/10 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black text-blue-400 uppercase block mb-1">Total Obra</span>
                <span className="text-3xl font-black">${(total * 1.21).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-[500px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Bot size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Cálculo de Cortes</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Asistente Técnico</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 rounded-2xl p-4 text-[13px] leading-relaxed text-slate-600 italic">
            {aiLoading ? (
              <div className="flex items-center gap-2 animate-pulse">
                <Sparkles size={14} className="text-blue-500" /> Procesando medidas técnicas...
              </div>
            ) : aiAdvice ? (
              <div className="whitespace-pre-wrap">{aiAdvice}</div>
            ) : (
              "Selecciona 'Calcular Cortes' en un ítem para ver los descuentos automáticos según línea de carpintería."
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;
