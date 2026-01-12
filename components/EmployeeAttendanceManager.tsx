
import React, { useState, useEffect } from 'react';
import { 
  Barcode, Clock, Users, DollarSign, LogIn, LogOut, 
  Coffee, UserCheck, AlertCircle, Calendar, Plus, 
  Search, Trash2, CheckCircle, ChevronRight, QrCode,
  ArrowLeft, Smartphone, ScanLine, Keyboard, Fingerprint,
  Check, Printer, Download, Loader2
} from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp_1', organization_id: 'org_1', name: 'Carlos Rodriguez', dni: '35444111', hourly_rate: 4500, role: 'Oficial Armador' },
  { id: 'emp_2', organization_id: 'org_1', name: 'Miguel Angel Suarez', dni: '38222999', hourly_rate: 3800, role: 'Ayudante Taller' },
  { id: 'emp_3', organization_id: 'org_1', name: 'Roberto Gomez', dni: '32555333', hourly_rate: 5200, role: 'Instalador Senior' },
];

const EmployeeAttendanceManager: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [viewMode, setViewMode] = useState<'admin' | 'kiosk'>('admin');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({ hourly_rate: 0 });
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showCredential, setShowCredential] = useState<Employee | null>(null);

  const getTodayRecord = (empId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return records.find(r => r.employee_id === empId && r.date === today);
  };

  const handleAction = (empId: string, action: 'start' | 'breakStart' | 'breakEnd' | 'end') => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setRecords(prev => {
      const existing = prev.find(r => r.employee_id === empId && r.date === today);
      
      if (!existing) {
        if (action !== 'start') return prev;
        return [...prev, { 
          id: `rec_${Date.now()}`, 
          organization_id: 'org_1', 
          employee_id: empId, 
          date: today, 
          start_time: now, 
          total_hours: 0 
        }];
      }

      const updated = { ...existing };
      if (action === 'breakStart') updated.break_start = now;
      if (action === 'breakEnd') updated.break_end = now;
      if (action === 'end') {
        updated.end_time = now;
        const startParts = updated.start_time?.split(':').map(Number) || [0,0];
        const endParts = now.split(':').map(Number);
        const startDecimal = startParts[0] + startParts[1] / 60;
        const endDecimal = endParts[0] + endParts[1] / 60;
        updated.total_hours = Math.max(0, endDecimal - startDecimal - 0.75); 
      }

      return prev.map(r => r.id === updated.id ? updated : r);
    });

    setTimeout(() => {
      setSelectedEmployee(null);
      setManualCode('');
    }, 2000);
  };

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.dni === manualCode);
    if (emp) {
      setSelectedEmployee(emp);
      setErrorMsg('');
    } else {
      setErrorMsg('DNI no reconocido');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const calculateSalary = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return 0;
    const totalHours = records
      .filter(r => r.employee_id === empId)
      .reduce((acc, r) => acc + r.total_hours, 0);
    return totalHours * emp.hourly_rate;
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const employee: Employee = {
      id: `emp_${Date.now()}`,
      organization_id: 'org_1',
      name: newEmp.name || '',
      dni: newEmp.dni || '',
      hourly_rate: Number(newEmp.hourly_rate) || 0,
      role: newEmp.role || 'Operario'
    };
    setEmployees([...employees, employee]);
    setShowAddEmp(false);
    setNewEmp({ hourly_rate: 0 });
  };

  return (
    <div className="space-y-8">
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

      {viewMode === 'admin' ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Planilla de Haberes</h2>
            <button 
              onClick={() => setShowAddEmp(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-all"
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
                          {records.filter(r => r.employee_id === emp.id).reduce((acc, r) => acc + r.total_hours, 0).toFixed(1)} HS
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
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Liquidación</h4>
                <p className="text-4xl font-black tracking-tight">
                  ${employees.reduce((acc, emp) => acc + calculateSalary(emp.id), 0).toLocaleString()}
                </p>
                <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center text-slate-400 text-xs italic">
                   Sincronizado con marcaciones
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto min-h-[60vh] flex items-center justify-center">
          {!selectedEmployee ? (
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl w-full text-center">
              <h3 className="text-3xl font-black text-slate-900 mb-8">Terminal de Fichaje</h3>
              <form onSubmit={handleManualEntry} className="max-w-sm mx-auto space-y-4">
                <input 
                  type="text"
                  placeholder="Ingresa tu DNI..."
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-xl font-black text-center outline-none focus:border-blue-500 transition-all"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
                {errorMsg && <p className="text-rose-500 text-xs font-bold uppercase">{errorMsg}</p>}
                <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl">Identificarme</button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 text-white p-12 rounded-[4rem] w-full max-w-2xl text-center space-y-8 animate-in zoom-in-95">
              <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-4xl font-black mx-auto shadow-2xl shadow-blue-500/20">
                {selectedEmployee.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-3xl font-black">{selectedEmployee.name}</h3>
                <p className="text-blue-400 font-bold uppercase tracking-widest text-xs mt-2">{selectedEmployee.role}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleAction(selectedEmployee.id, 'start')} className="py-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-blue-600 transition-all">
                  <LogIn className="mx-auto mb-2" />
                  <span className="text-[10px] font-black uppercase">Entrada</span>
                </button>
                <button onClick={() => handleAction(selectedEmployee.id, 'end')} className="py-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-rose-600 transition-all">
                  <LogOut className="mx-auto mb-2" />
                  <span className="text-[10px] font-black uppercase">Salida</span>
                </button>
              </div>
              <button onClick={() => setSelectedEmployee(null)} className="text-slate-500 text-xs font-bold uppercase tracking-widest pt-4">Cancelar</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendanceManager;
