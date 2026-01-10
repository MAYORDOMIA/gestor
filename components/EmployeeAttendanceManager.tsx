
import React, { useState, useEffect } from 'react';
import { 
  Barcode, Clock, Users, DollarSign, LogIn, LogOut, 
  Coffee, UserCheck, AlertCircle, Calendar, Plus, 
  Search, Trash2, CheckCircle, ChevronRight, QrCode,
  ArrowLeft, Smartphone, ScanLine, Keyboard, Fingerprint,
  Check, Printer, Download
} from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp_1', name: 'Carlos Rodriguez', dni: '35444111', hourlyRate: 4500, role: 'Oficial Armador' },
  { id: 'emp_2', name: 'Miguel Angel Suarez', dni: '38222999', hourlyRate: 3800, role: 'Ayudante Taller' },
  { id: 'emp_3', name: 'Roberto Gomez', dni: '32555333', hourlyRate: 5200, role: 'Instalador Senior' },
];

interface Props {
  initialEmployeeId?: string | null;
}

const EmployeeAttendanceManager: React.FC<Props> = ({ initialEmployeeId }) => {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [viewMode, setViewMode] = useState<'admin' | 'kiosk'>('admin');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({ hourlyRate: 0 });
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showCredential, setShowCredential] = useState<Employee | null>(null);

  // Efecto para cargar empleado desde URL (Deep Linking)
  useEffect(() => {
    if (initialEmployeeId) {
      const emp = employees.find(e => e.id === initialEmployeeId);
      if (emp) {
        setSelectedEmployee(emp);
        setViewMode('kiosk');
      }
    }
  }, [initialEmployeeId, employees]);

  const getTodayRecord = (empId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return records.find(r => r.employeeId === empId && r.date === today);
  };

  const handleAction = (empId: string, action: 'start' | 'breakStart' | 'breakEnd' | 'end') => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setRecords(prev => {
      const existing = prev.find(r => r.employeeId === empId && r.date === today);
      
      if (!existing) {
        if (action !== 'start') return prev;
        return [...prev, { id: `rec_${Date.now()}`, employeeId: empId, date: today, startTime: now, totalHours: 0 }];
      }

      const updated = { ...existing };
      if (action === 'breakStart') updated.breakStartTime = now;
      if (action === 'breakEnd') updated.breakEndTime = now;
      if (action === 'end') {
        updated.endTime = now;
        const startParts = updated.startTime?.split(':').map(Number) || [0,0];
        const endParts = now.split(':').map(Number);
        const startDecimal = startParts[0] + startParts[1] / 60;
        const endDecimal = endParts[0] + endParts[1] / 60;
        updated.totalHours = Math.max(0, endDecimal - startDecimal - 0.75); 
      }

      return prev.map(r => r.id === updated.id ? updated : r);
    });

    setTimeout(() => {
      setSelectedEmployee(null);
      setManualCode('');
    }, 2000);
  };

  const simulateScan = () => {
    setIsScanning(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsScanning(false);
      const randomEmp = employees[Math.floor(Math.random() * employees.length)];
      setSelectedEmployee(randomEmp);
    }, 1500);
  };

  const generateQRUrl = (empId: string) => {
    // Genera una URL real para que el celular la reconozca al escanear
    const baseUrl = window.location.origin + window.location.pathname;
    const deepLink = `${baseUrl}?empId=${empId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(deepLink)}`;
  };

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.dni === manualCode);
    if (emp) {
      setSelectedEmployee(emp);
      setErrorMsg('');
    } else {
      setErrorMsg('Código / DNI no reconocido');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const calculateSalary = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return 0;
    const totalHours = records
      .filter(r => r.employeeId === empId)
      .reduce((acc, r) => acc + r.totalHours, 0);
    return totalHours * emp.hourlyRate;
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const employee: Employee = {
      id: `emp_${Date.now()}`,
      name: newEmp.name || '',
      dni: newEmp.dni || '',
      hourlyRate: Number(newEmp.hourlyRate) || 0,
      role: newEmp.role || 'Operario'
    };
    setEmployees([...employees, employee]);
    setShowAddEmp(false);
    setNewEmp({ hourlyRate: 0 });
  };

  return (
    <div className="space-y-8">
      {/* Selector de Modo */}
      {!selectedEmployee && (
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm w-fit mx-auto lg:mx-0">
          <button 
            onClick={() => setViewMode('admin')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'admin' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Users size={16} /> Administración
          </button>
          <button 
            onClick={() => setViewMode('kiosk')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'kiosk' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Barcode size={16} /> Modo Kiosco
          </button>
        </div>
      )}

      {viewMode === 'admin' ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Planilla de Haberes</h2>
            <button 
              onClick={() => setShowAddEmp(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus size={16} /> Nuevo Personal
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">Colaborador</th>
                    <th className="px-8 py-5">QR Credencial</th>
                    <th className="px-8 py-5">Horas</th>
                    <th className="px-8 py-5 text-right">Haberes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{emp.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{emp.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <button 
                          onClick={() => setShowCredential(emp)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <QrCode size={12} /> Ver Código
                        </button>
                      </td>
                      <td className="px-8 py-5">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black">
                          {records.filter(r => r.employeeId === emp.id).reduce((acc, r) => acc + r.totalHours, 0).toFixed(1)} HS
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-slate-900">
                        ${calculateSalary(emp.id).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <DollarSign size={80} />
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Liquidación</h4>
                <p className="text-4xl font-black tracking-tight">
                  ${employees.reduce((acc, emp) => acc + calculateSalary(emp.id), 0).toLocaleString()}
                </p>
                <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center text-slate-400 text-xs italic">
                   Sincronizado con marcaciones móvil
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ayuda Técnica</h4>
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                    <Smartphone size={24} />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Entrega a cada operario su QR. Al escanearlo con su celular, podrán fichar sin necesidad de usar la terminal del taller.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto min-h-[70vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
          {!selectedEmployee ? (
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
              {/* Bloque Escáner dinámico */}
              <div 
                className="group relative bg-white p-16 rounded-[4rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center gap-10 overflow-hidden transition-all"
              >
                <div className="absolute top-0 left-0 w-full h-3 bg-blue-600"></div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Escanear para Fichar</h3>
                  <p className="text-slate-400 font-medium italic text-base">Usa tu celular para llevar el control a tu dispositivo</p>
                </div>

                <div className="relative p-8 bg-white rounded-[3.5rem] border-4 border-slate-50 shadow-inner group-hover:border-blue-100 transition-colors duration-500">
                  {/* QR Real que apunta a la App con parámetro de empId de ejemplo o general */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + window.location.pathname)}`}
                    alt="QR Principal"
                    className="w-48 h-48 opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-x-0 top-0 h-1 bg-blue-500/30 shadow-[0_0_20px_blue] animate-[scan_3s_linear_infinite] pointer-events-none"></div>
                </div>

                <div className="flex items-center gap-3 text-slate-400 px-8 py-4 bg-slate-50 rounded-2xl">
                  <ScanLine size={20} className="animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Escáner de Planta Activo</span>
                </div>
              </div>

              {/* Acceso Manual */}
              <div className="flex flex-col gap-6">
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8 flex-1">
                  <div className="text-center lg:text-left">
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Acceso Manual</h4>
                    <p className="text-slate-400 text-sm font-medium mt-1">Ingresa tu DNI para abrir tu ficha</p>
                  </div>

                  <form onSubmit={handleManualEntry} className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="DNI Operario..."
                        className={`w-full px-8 py-6 bg-slate-50 border rounded-[2rem] text-2xl font-black tracking-widest text-center outline-none transition-all ${errorMsg ? 'border-red-400 bg-red-50 text-red-600' : 'border-slate-100 focus:bg-white focus:border-blue-500'}`}
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                      />
                      <Keyboard className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                    </div>
                    {errorMsg && <p className="text-center text-xs font-black text-red-500 uppercase tracking-widest">{errorMsg}</p>}
                    <button 
                      type="submit"
                      className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Identificarme
                    </button>
                  </form>

                  <div className="pt-8 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center mb-4">O selecciona de la lista rápida</p>
                    <div className="grid grid-cols-2 gap-3">
                      {employees.map(emp => (
                        <button 
                          key={emp.id}
                          onClick={() => setSelectedEmployee(emp)}
                          className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left hover:border-blue-400 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:text-blue-600 transition-colors">
                            {emp.name.charAt(0)}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-slate-800 text-[13px] truncate">{emp.name.split(' ')[0]}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* MICRO-PÁGINA DE MARCADO */
            <div className="w-full max-w-4xl bg-slate-900 p-12 lg:p-16 rounded-[4.5rem] text-white space-y-12 lg:space-y-16 shadow-2xl animate-in slide-in-from-bottom-12 duration-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                <Clock size={300} />
              </div>

              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="relative">
                   <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[3.5rem] bg-blue-600 flex items-center justify-center text-4xl lg:text-5xl font-black shadow-2xl shadow-blue-500/20 ring-4 ring-white/10">
                    {selectedEmployee.name.charAt(0)}
                  </div>
                </div>
                <div className="text-center md:text-left space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-blue-400">
                    <Fingerprint size={16} />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">Sesión de Planta Identificada</span>
                  </div>
                  <h3 className="text-4xl lg:text-5xl font-black tracking-tight">{selectedEmployee.name}</h3>
                  <p className="text-slate-400 text-sm font-medium">{selectedEmployee.role} • DNI: {selectedEmployee.dni}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 relative z-10">
                <BigAttendanceButton label="Entrada" icon={<LogIn size={32} />} color="emerald" time={getTodayRecord(selectedEmployee.id)?.startTime} onClick={() => handleAction(selectedEmployee.id, 'start')} />
                <BigAttendanceButton label="Salida" icon={<LogOut size={32} />} color="rose" time={getTodayRecord(selectedEmployee.id)?.endTime} onClick={() => handleAction(selectedEmployee.id, 'end')} />
                <BigAttendanceButton label="Descanso" icon={<Coffee size={32} />} color="amber" time={getTodayRecord(selectedEmployee.id)?.breakStartTime} onClick={() => handleAction(selectedEmployee.id, 'breakStart')} />
                <BigAttendanceButton label="Regreso" icon={<Clock size={32} />} color="indigo" time={getTodayRecord(selectedEmployee.id)?.breakEndTime} onClick={() => handleAction(selectedEmployee.id, 'breakEnd')} />
              </div>

              <div className="flex flex-col items-center gap-6 relative z-10">
                <button 
                  onClick={() => { setSelectedEmployee(null); setManualCode(''); }}
                  className="flex items-center gap-3 text-slate-400 hover:text-white transition-all text-sm font-black uppercase tracking-[0.2em] px-12 py-5 rounded-[2rem] border border-white/10 hover:bg-white/5"
                >
                  <ArrowLeft size={18} /> Salir / Cambiar Operario
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Credencial Digital (Para Administrador) */}
      {showCredential && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] w-full max-w-sm shadow-2xl p-12 text-center animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-8">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Credencial Digital</span>
               <button onClick={() => setShowCredential(null)} className="text-slate-300 hover:text-slate-900"><Trash2 size={20} /></button>
             </div>
             <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black mx-auto mb-4">
                {showCredential.name.charAt(0)}
             </div>
             <h3 className="text-2xl font-black text-slate-900">{showCredential.name}</h3>
             <p className="text-sm font-medium text-slate-400 mb-8">{showCredential.role}</p>
             
             <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 mb-8 inline-block mx-auto">
               <img src={generateQRUrl(showCredential.id)} alt="QR Personal" className="w-48 h-48 rounded-xl" />
             </div>

             <div className="flex gap-3">
               <button className="flex-1 py-4 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                 <Printer size={14} /> Imprimir
               </button>
               <button className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                 <Download size={14} /> Digital
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Empleado */}
      {showAddEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Nuevo Colaborador</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</label>
                <input required type="text" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl text-sm font-bold" value={newEmp.name || ''} onChange={e => setNewEmp({...newEmp, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DNI / Código</label>
                  <input required type="text" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl text-sm" value={newEmp.dni || ''} onChange={e => setNewEmp({...newEmp, dni: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Hora ($)</label>
                  <input required type="number" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl text-sm font-black" value={newEmp.hourlyRate || ''} onChange={e => setNewEmp({...newEmp, hourlyRate: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Puesto / Función</label>
                <input required type="text" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl text-sm" value={newEmp.role || ''} onChange={e => setNewEmp({...newEmp, role: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddEmp(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-full font-black text-[10px] uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0.1; }
          50% { transform: translateY(200px); opacity: 0.8; }
          100% { transform: translateY(0); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};

const BigAttendanceButton = ({ label, icon, color, time, onClick }: { label: string, icon: React.ReactNode, color: string, time?: string, onClick: () => void }) => {
  const [marked, setMarked] = useState(false);

  const handleClick = () => {
    if (time) return;
    setMarked(true);
    onClick();
  };

  const colorStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600 hover:text-white',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-600 hover:text-white',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-600 hover:text-white',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600 hover:text-white',
  }[color as 'emerald' | 'rose' | 'amber' | 'indigo'] || 'bg-white/5 text-slate-400';

  const isCompleted = marked || !!time;

  return (
    <button 
      disabled={isCompleted}
      onClick={handleClick}
      className={`relative h-48 lg:h-64 p-6 lg:p-8 rounded-[3rem] flex flex-col items-center justify-center gap-4 lg:gap-6 border transition-all duration-500 shadow-2xl group overflow-hidden ${isCompleted ? 'bg-emerald-600 text-white border-emerald-400 scale-95' : colorStyles}`}
    >
      {isCompleted && (
        <div className="absolute inset-0 bg-emerald-600 flex flex-col items-center justify-center animate-in zoom-in fade-in duration-500">
           <Check size={32} className="text-white mb-2" />
           <span className="text-lg font-black">{time || 'OK'}</span>
        </div>
      )}
      <div className="group-hover:scale-125 transition-transform duration-500">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
};

export default EmployeeAttendanceManager;
