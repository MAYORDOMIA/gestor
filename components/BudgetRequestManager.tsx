
import React, { useState, useRef } from 'react';
import { Plus, Search, Upload, X, Check, Phone, Mail, MapPin, FileImage, File, SendHorizontal, Hash, DollarSign, User, FileText } from 'lucide-react';
import { BudgetRequest, RequestStatus } from '../types';

interface BudgetRequestManagerProps {
  requests: BudgetRequest[];
  onSendBudget: (request: BudgetRequest, finalPdf: File, clientCode: string, total: number) => void;
  onAddRequest: (request: BudgetRequest) => void;
}

const BudgetRequestManager: React.FC<BudgetRequestManagerProps> = ({ requests, onSendBudget, onAddRequest }) => {
  const [showModal, setShowModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState<BudgetRequest | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [finalPdf, setFinalPdf] = useState<File | null>(null);
  const [clientCode, setClientCode] = useState('');
  const [budgetTotal, setBudgetTotal] = useState<string>('');
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({ clientName: '', phone: '', email: '', address: '', description: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles([...files, ...Array.from(e.target.files)]);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFinalPdf(e.target.files[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: BudgetRequest = {
      id: `req_${Date.now()}`,
      ...formData,
      status: RequestStatus.PENDIENTE,
      createdAt: new Date().toISOString().split('T')[0],
      files: files.map(f => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) }))
    };
    onAddRequest(newRequest);
    setShowModal(false);
    setFormData({ clientName: '', phone: '', email: '', address: '', description: '' });
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
      
      {/* Formulario Cliente */}
      <div className="lg:col-span-5">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.03)] space-y-8">
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6">Información del Cliente</h3>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Nombre y Apellido" 
                  className="w-full px-8 py-5 bg-[#F8FAFC] border border-slate-100 rounded-[1.5rem] text-[15px] font-medium text-slate-600 focus:bg-white focus:border-blue-400 focus:ring-4 ring-blue-500/5 outline-none transition-all"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                />
              </div>
              <div className="sm:w-48">
                <input 
                  type="text" 
                  placeholder="Teléfono" 
                  className="w-full px-8 py-5 bg-[#F8FAFC] border border-slate-100 rounded-[1.5rem] text-[15px] font-medium text-slate-600 focus:bg-white focus:border-blue-400 outline-none transition-all"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <input 
              type="email" 
              placeholder="Correo Electrónico" 
              className="w-full px-8 py-5 bg-[#F8FAFC] border border-slate-100 rounded-[1.5rem] text-[15px] font-medium text-slate-600 focus:bg-white focus:border-blue-400 outline-none transition-all"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="Dirección de Obra" 
              className="w-full px-8 py-5 bg-[#F8FAFC] border border-slate-100 rounded-[1.5rem] text-[15px] font-medium text-slate-600 focus:bg-white focus:border-blue-400 outline-none transition-all"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
            <textarea 
              rows={4}
              placeholder="Descripción del Pedido..." 
              className="w-full px-8 py-5 bg-[#F8FAFC] border border-slate-100 rounded-[1.5rem] text-[15px] font-medium text-slate-600 focus:bg-white focus:border-blue-400 outline-none transition-all resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            onClick={handleSubmit}
            className="w-full py-5 bg-blue-600 text-white font-black rounded-full shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
          >
            Guardar Solicitud
          </button>
        </div>
      </div>

      {/* Listado Items */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex justify-between items-center mb-6 px-4">
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Resumen de Partida</h3>
          <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full">{requests.length} ITEMS</span>
        </div>

        <div className="space-y-4">
          {requests.map((request, idx) => (
            <div key={request.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] text-slate-400 font-black flex items-center justify-center text-xs">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div>
                  <h4 className="text-[17px] font-black text-slate-900">{request.clientName}</h4>
                  <p className="text-[13px] font-medium text-slate-400 mt-1">{request.address} • PENDIENTE</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setShowSendModal(request)}
                  className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  title="Finalizar y Enviar Presupuesto"
                >
                  <SendHorizontal size={20} />
                </button>
                <button className="p-3 text-slate-200 hover:text-red-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
              <p className="text-slate-300 font-black uppercase tracking-widest text-[10px]">Sin pedidos registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Enviar Presupuesto Final */}
      {showSendModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-900 mb-2">Enviar Presupuesto Final</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">Completa los datos para <span className="text-slate-900 font-bold">{showSendModal.clientName}</span></p>
            
            <form onSubmit={handleFinalSend} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Hash size={14} className="text-blue-500" /> Código Obra
                </label>
                <input 
                  required
                  type="text" 
                  className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none text-sm font-bold"
                  placeholder="Ej: OBRA-2024-001"
                  value={clientCode}
                  onChange={e => setClientCode(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <DollarSign size={14} className="text-blue-500" /> Monto Total
                </label>
                <input 
                  required
                  type="number" 
                  className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none text-sm font-black"
                  placeholder="Ej: 1500000"
                  value={budgetTotal}
                  onChange={e => setBudgetTotal(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-500" /> PDF Adjunto
                </label>
                <div 
                  onClick={() => pdfInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${finalPdf ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 hover:border-blue-400 bg-slate-50 hover:bg-white'}`}
                >
                  {finalPdf ? (
                    <>
                      <Check size={28} className="text-emerald-500" />
                      <p className="font-bold text-emerald-700 text-[10px] truncate max-w-full px-4">{finalPdf.name}</p>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className="text-slate-300" />
                      <p className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Seleccionar Archivo</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowSendModal(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-full text-[10px] uppercase tracking-widest">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={!finalPdf || !clientCode.trim() || !budgetTotal}
                  className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-full shadow-xl shadow-blue-500/20 text-[10px] uppercase tracking-widest disabled:opacity-50"
                >
                  Confirmar y Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetRequestManager;
