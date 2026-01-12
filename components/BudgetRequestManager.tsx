
import React, { useState, useRef } from 'react';
import { X, Upload, SendHorizontal, Hash, DollarSign, FileText, Check } from 'lucide-react';
import { BudgetRequest, RequestStatus } from '../types';

interface BudgetRequestManagerProps {
  requests: BudgetRequest[];
  onSendBudget: (request: BudgetRequest, finalPdf: File, clientCode: string, total: number) => void;
  onAddRequest: (request: BudgetRequest) => void;
}

const BudgetRequestManager: React.FC<BudgetRequestManagerProps> = ({ requests, onSendBudget, onAddRequest }) => {
  const [showSendModal, setShowSendModal] = useState<BudgetRequest | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [finalPdf, setFinalPdf] = useState<File | null>(null);
  const [clientCode, setClientCode] = useState('');
  const [budgetTotal, setBudgetTotal] = useState<string>('');
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({ client_name: '', phone: '', email: '', address: '', description: '' });

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFinalPdf(e.target.files[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.client_name) return;
    const newRequest: BudgetRequest = {
      id: `req_${Date.now()}`,
      organization_id: 'default',
      ...formData,
      status: RequestStatus.PENDIENTE,
      created_at: new Date().toISOString().split('T')[0],
      files: files.map(f => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) }))
    };
    onAddRequest(newRequest);
    setFormData({ client_name: '', phone: '', email: '', address: '', description: '' });
    setFiles([]);
  };

  const handleFinalSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (showSendModal && finalPdf) {
      onSendBudget(showSendModal, finalPdf, clientCode, Number(budgetTotal) || 0);
      setShowSendModal(null);
      setFinalPdf(null);
      setClientCode('');
      setBudgetTotal('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <input type="file" ref={pdfInputRef} hidden accept=".pdf" onChange={handlePdfChange} />
      
      <div className="lg:col-span-5">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-300 shadow-sm space-y-8">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Información del Cliente</h3>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Nombre y Apellido" 
              className="w-full px-8 py-5 bg-slate-50 border border-slate-300 rounded-[1.5rem] text-[15px] font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none transition-all"
              value={formData.client_name}
              onChange={e => setFormData({...formData, client_name: e.target.value})}
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Teléfono" 
                className="flex-1 px-8 py-5 bg-slate-50 border border-slate-300 rounded-[1.5rem] text-[15px] font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none transition-all"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
              <input 
                type="email" 
                placeholder="Email" 
                className="flex-1 px-8 py-5 bg-slate-50 border border-slate-300 rounded-[1.5rem] text-[15px] font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <input 
              type="text" 
              placeholder="Dirección de Obra" 
              className="w-full px-8 py-5 bg-slate-50 border border-slate-300 rounded-[1.5rem] text-[15px] font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none transition-all"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
            <textarea 
              rows={4}
              placeholder="Descripción del Pedido..." 
              className="w-full px-8 py-5 bg-slate-50 border border-slate-300 rounded-[1.5rem] text-[15px] font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button onClick={handleSubmit} className="w-full py-5 bg-blue-700 text-white font-black rounded-full shadow-lg hover:bg-blue-800 transition-all uppercase tracking-widest text-xs">Guardar Solicitud</button>
        </div>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <div className="flex justify-between items-center mb-6 px-4">
          <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Resumen de Partida</h3>
          <span className="bg-slate-200 text-slate-700 text-[10px] font-black px-3 py-1 rounded-full">{requests.length} ITEMS</span>
        </div>

        <div className="space-y-4">
          {requests.map((request, idx) => (
            <div key={request.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-600 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 font-black flex items-center justify-center text-xs border border-slate-200">{String(idx + 1).padStart(2, '0')}</div>
                <div>
                  <h4 className="text-[17px] font-black text-slate-900">{request.client_name}</h4>
                  <p className="text-[13px] font-bold text-slate-600 mt-1">{request.address} • PENDIENTE</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <button onClick={() => setShowSendModal(request)} className="p-3 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-700 hover:text-white transition-all shadow-sm border border-blue-100"><SendHorizontal size={20} /></button>
                <button className="p-3 text-slate-300 hover:text-red-500 transition-colors"><X size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showSendModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 border border-slate-200">
            <h3 className="text-xl font-black text-slate-900 mb-2">Enviar Presupuesto Final</h3>
            <p className="text-slate-600 text-sm mb-8 font-bold italic">Cliente: <span className="text-slate-900 font-black">{showSendModal.client_name}</span></p>
            <form onSubmit={handleFinalSend} className="space-y-6">
              <input required type="text" className="w-full px-6 py-4 rounded-2xl border border-slate-300 bg-slate-50 text-sm font-black" placeholder="Código Obra (ej: OBRA-101)" value={clientCode} onChange={e => setClientCode(e.target.value)} />
              <input required type="number" className="w-full px-6 py-4 rounded-2xl border border-slate-300 bg-slate-50 text-sm font-black" placeholder="Monto Total ($)" value={budgetTotal} onChange={e => setBudgetTotal(e.target.value)} />
              <div onClick={() => pdfInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${finalPdf ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-blue-600 bg-slate-50'}`}>
                {finalPdf ? <><Check size={28} className="text-emerald-600" /><p className="font-black text-emerald-800 text-[10px] truncate w-full px-4">{finalPdf.name}</p></> : <><Upload size={24} className="text-slate-500" /><p className="font-black text-slate-700 text-[10px] uppercase tracking-widest">Seleccionar PDF</p></>}
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowSendModal(null)} className="flex-1 py-4 bg-slate-200 text-slate-700 font-black rounded-full text-[10px] uppercase">Cancelar</button>
                <button type="submit" disabled={!finalPdf} className="flex-[2] py-4 bg-blue-700 text-white font-black rounded-full shadow-lg text-[10px] uppercase disabled:opacity-50">Confirmar y Enviar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetRequestManager;
