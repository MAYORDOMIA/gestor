
import React, { useState, useRef } from 'react';
import { Project, WorkshopLog, ProductionStatus, ManufacturingTask, ProjectStatus } from '../types';
import { 
  Phone, MapPin, Hash, Palette, Layers, Info, 
  Upload, FileText, CheckCircle, Download, X, Search, 
  Factory, Edit3, Eye, AlertCircle, Check, Send, 
  Clock, Plus, MessageSquare, ChevronDown, ClipboardCheck, Truck
} from 'lucide-react';

interface ManufacturingManagerProps {
  projects: Project[];
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
}

const ManufacturingManager: React.FC<ManufacturingManagerProps> = ({ projects, onUpdateProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [schedulingInstallation, setSchedulingInstallation] = useState<Project | null>(null);
  const [installationData, setInstallationData] = useState({ scheduledDate: '', teamName: '' });
  const [newLog, setNewLog] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadType, setActiveUploadType] = useState<'materials' | 'optimization' | null>(null);

  const filteredProjects = projects.filter(p => 
    p.status === ProjectStatus.PRODUCCION && 
    (p.requestData?.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || p.clientCode?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (project: Project) => {
    if (!project.manufacturingData?.tasks) {
      const defaultTasks: ManufacturingTask[] = [
        { id: 'task_materials', label: 'Compra de materiales', isCompleted: false, notes: '' },
        { id: 'task_glass', label: 'Vidrios', isCompleted: false, notes: '' },
        { id: 'task_aluminum', label: 'Aluminio', isCompleted: false, notes: '' },
        { id: 'task_installation', label: 'Colocación', isCompleted: false, notes: '' },
      ];
      const updatedData = { ...project.manufacturingData, tasks: defaultTasks };
      onUpdateProject(project.id, { manufacturingData: updatedData });
      setEditingProject({ ...project, manufacturingData: updatedData });
    } else {
      setEditingProject(project);
    }
    setNewLog('');
  };

  const handleCloseModal = () => {
    setEditingProject(null);
    setActiveUploadType(null);
  };

  const updateManufacturingField = (field: string, value: any) => {
    if (!editingProject) return;
    const updatedData = {
      ...editingProject.manufacturingData,
      [field]: value
    };
    onUpdateProject(editingProject.id, { manufacturingData: updatedData });
    setEditingProject({ ...editingProject, manufacturingData: updatedData });
  };

  const handleStatusChange = (id: string, status: ProductionStatus) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      const updatedData = {
        ...project.manufacturingData,
        productionStatus: status
      };
      onUpdateProject(id, { manufacturingData: updatedData });
      if (editingProject?.id === id) {
        setEditingProject({ ...editingProject, manufacturingData: updatedData });
      }
    }
  };

  const handleToggleTask = (taskId: string) => {
    if (!editingProject || !editingProject.manufacturingData?.tasks) return;
    const updatedTasks = editingProject.manufacturingData.tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    updateManufacturingField('tasks', updatedTasks);
  };

  const handleUpdateTaskNotes = (taskId: string, notes: string) => {
    if (!editingProject || !editingProject.manufacturingData?.tasks) return;
    const updatedTasks = editingProject.manufacturingData.tasks.map(t => 
      t.id === taskId ? { ...t, notes } : t
    );
    updateManufacturingField('tasks', updatedTasks);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.trim() || !editingProject) return;

    const log: WorkshopLog = {
      id: `log_${Date.now()}`,
      date: new Date().toLocaleString(),
      text: newLog.trim(),
      user: 'Taller'
    };

    const updatedLogs = [log, ...(editingProject.manufacturingData?.workshopLogs || [])];
    updateManufacturingField('workshopLogs', updatedLogs);
    setNewLog('');
  };

  const handleFileClick = (type: 'materials' | 'optimization') => {
    setActiveUploadType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editingProject && activeUploadType) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      
      const updates = activeUploadType === 'materials' 
        ? { materialsPdfUrl: url, materialsPdfName: file.name }
        : { optimizationPdfUrl: url, optimizationPdfName: file.name };

      Object.entries(updates).forEach(([key, val]) => {
        updateManufacturingField(key, val);
      });
      
      setActiveUploadType(null);
    }
  };

  const handleFinishProduction = (project: Project) => {
    setSchedulingInstallation(project);
    setInstallationData({ scheduledDate: '', teamName: '' });
  };

  const handleConfirmInstallation = () => {
    if (schedulingInstallation) {
      onUpdateProject(schedulingInstallation.id, {
        status: ProjectStatus.INSTALACION,
        installationData: {
          ...installationData,
          isCompleted: false,
          notes: ''
        }
      });
      setSchedulingInstallation(null);
      if (editingProject?.id === schedulingInstallation.id) {
        setEditingProject(null);
      }
    }
  };

  const getProductionStatusColor = (status?: ProductionStatus) => {
    switch (status) {
      case ProductionStatus.NO_INICIADO: return 'bg-slate-100 text-slate-600 border-slate-200';
      case ProductionStatus.EN_FABRICACION: return 'bg-blue-100 text-blue-700 border-blue-200';
      case ProductionStatus.PENDIENTE: return 'bg-amber-100 text-amber-700 border-amber-200';
      case ProductionStatus.FINALIZADA: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Taller</h2>
          <p className="text-slate-500 text-sm">Información técnica y seguimiento de piezas en fabricación.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por obra..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <input type="file" ref={fileInputRef} hidden accept=".pdf" onChange={handleFileChange} />

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all flex flex-col overflow-hidden group">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-sm font-black tracking-wider uppercase shadow-lg shadow-blue-500/20">
                  {project.clientCode}
                </div>
                
                <div className="relative group/status">
                  <select 
                    value={project.manufacturingData?.productionStatus || ProductionStatus.NO_INICIADO}
                    onChange={(e) => handleStatusChange(project.id, e.target.value as ProductionStatus)}
                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer focus:outline-none ${getProductionStatusColor(project.manufacturingData?.productionStatus)}`}
                  >
                    {Object.values(ProductionStatus).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{project.requestData?.clientName}</h3>
              <div className="flex flex-col gap-1 mt-1">
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" />
                  {project.requestData?.address}
                </p>
                {project.manufacturingData?.deliveryDate && (
                  <p className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                    <Clock size={12} />
                    Salida Taller: {project.manufacturingData.deliveryDate}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Color</span>
                  <p className="text-sm font-bold text-slate-800">{project.manufacturingData?.color || 'Sin definir'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Línea</span>
                  <p className="text-sm font-bold text-slate-800">{project.manufacturingData?.line || 'Sin definir'}</p>
                </div>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Progreso de Secciones</span>
                <div className="grid grid-cols-2 gap-2">
                  {(project.manufacturingData?.tasks || []).map(task => (
                    <div key={task.id} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-sm border ${task.isCompleted ? 'bg-emerald-500 border-emerald-600' : 'bg-white border-slate-300'}`}>
                        {task.isCompleted && <Check size={8} className="text-white" />}
                      </div>
                      <span className={`text-[10px] font-bold ${task.isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{task.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Documentos Técnicos</span>
                <div className="flex flex-col gap-2">
                  {project.manufacturingData?.materialsPdfUrl ? (
                    <a href={project.manufacturingData.materialsPdfUrl} target="_blank" className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-500 rounded-lg"><FileText size={16} /></div>
                        <span className="text-xs font-bold text-slate-700">Pedido Materiales</span>
                      </div>
                      <Download size={14} className="text-slate-400" />
                    </a>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-100 border-dashed rounded-xl flex items-center gap-2 text-slate-400">
                      <AlertCircle size={14} />
                      <span className="text-[10px] font-bold uppercase">Materiales no cargados</span>
                    </div>
                  )}
                  {project.manufacturingData?.optimizationPdfUrl ? (
                    <a href={project.manufacturingData.optimizationPdfUrl} target="_blank" className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg"><CheckCircle size={16} /></div>
                        <span className="text-xs font-bold text-slate-700">Optimización de Corte</span>
                      </div>
                      <Download size={14} className="text-slate-400" />
                    </a>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-100 border-dashed rounded-xl flex items-center gap-2 text-slate-400">
                      <AlertCircle size={14} />
                      <span className="text-[10px] font-bold uppercase">Optimización no cargada</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button 
                onClick={() => handleOpenModal(project)}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
              >
                <Plus size={16} />
                Taller
              </button>
              <button 
                onClick={() => handleFinishProduction(project)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg ${project.manufacturingData?.productionStatus === ProductionStatus.FINALIZADA ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/10 animate-pulse' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Truck size={16} />
                A Instalación
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Programar Instalación */}
      {schedulingInstallation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-900 mb-2">Programar Instalación</h3>
            <p className="text-sm text-slate-500 mb-6">Completa los datos de equipo para la obra <span className="font-bold text-slate-900">{schedulingInstallation.clientCode}</span>.</p>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha de Inicio de Colocación</label>
                <input 
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 ring-blue-500/20"
                  value={installationData.scheduledDate}
                  onChange={(e) => setInstallationData({ ...installationData, scheduledDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Equipo Asignado</label>
                <input 
                  type="text"
                  placeholder="Ej: Equipo A - Gonzalez / Martinez"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 ring-blue-500/20"
                  value={installationData.teamName}
                  onChange={(e) => setInstallationData({ ...installationData, teamName: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setSchedulingInstallation(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-widest">Cancelar</button>
              <button 
                onClick={handleConfirmInstallation}
                disabled={!installationData.scheduledDate || !installationData.teamName}
                className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-xs uppercase tracking-widest disabled:opacity-50"
              >
                Mover a Instalación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalles de Fabricación (Ya existente) */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              </div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20">
                  <Factory size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{editingProject.clientCode}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-blue-300 font-medium">{editingProject.requestData?.clientName}</p>
                    <span className="text-blue-700 font-bold">•</span>
                    <div className="relative inline-block">
                      <select 
                        value={editingProject.manufacturingData?.productionStatus || ProductionStatus.NO_INICIADO}
                        onChange={(e) => handleStatusChange(editingProject.id, e.target.value as ProductionStatus)}
                        className={`appearance-none pl-3 pr-8 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer focus:outline-none ${getProductionStatusColor(editingProject.manufacturingData?.productionStatus)}`}
                      >
                        {Object.values(ProductionStatus).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={handleCloseModal} className="p-3 hover:bg-white/10 rounded-full transition-colors relative z-10">
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              <div className="lg:w-1/4 p-6 border-r border-slate-100 overflow-y-auto bg-slate-50/30 space-y-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info size={14} className="text-blue-500" />
                  Especificaciones
                </h4>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Color</label>
                    <p className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800">{editingProject.manufacturingData?.color || 'N/A'}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Línea</label>
                    <p className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800">{editingProject.manufacturingData?.line || 'N/A'}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Documentación Técnica</label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={16} className="text-red-500 shrink-0" />
                          <span className="text-xs font-bold truncate">{editingProject.manufacturingData?.materialsPdfName || 'Materiales'}</span>
                        </div>
                        {editingProject.manufacturingData?.materialsPdfUrl && (
                          <a href={editingProject.manufacturingData.materialsPdfUrl} target="_blank" className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"><Download size={14}/></a>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle size={16} className="text-indigo-500 shrink-0" />
                          <span className="text-xs font-bold truncate">{editingProject.manufacturingData?.optimizationPdfName || 'Cortes'}</span>
                        </div>
                        {editingProject.manufacturingData?.optimizationPdfUrl && (
                          <a href={editingProject.manufacturingData.optimizationPdfUrl} target="_blank" className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"><Download size={14}/></a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-2/4 p-6 overflow-y-auto bg-white border-r border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ClipboardCheck size={16} className="text-blue-500" />
                  Plan de Trabajo y Avances
                </h4>

                <div className="space-y-6">
                  {(editingProject.manufacturingData?.tasks || []).map((task) => (
                    <div key={task.id} className={`p-5 rounded-3xl border transition-all ${task.isCompleted ? 'bg-emerald-50/30 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleToggleTask(task.id)}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.isCompleted ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300 hover:border-blue-400'}`}
                          >
                            {task.isCompleted && <Check size={14} className="text-white" />}
                          </button>
                          <span className={`text-sm font-black uppercase tracking-tight ${task.isCompleted ? 'text-emerald-700' : 'text-slate-700'}`}>
                            {task.label}
                          </span>
                        </div>
                      </div>
                      <textarea 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 outline-none focus:ring-2 ring-blue-500/20 resize-none"
                        placeholder={`Estado: ${task.label}...`}
                        rows={2}
                        value={task.notes}
                        onChange={(e) => handleUpdateTaskNotes(task.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:w-1/4 p-6 flex flex-col bg-slate-50/50">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <MessageSquare size={14} className="text-blue-500" />
                  Novedades
                </h4>
                <form onSubmit={handleAddLog} className="mb-6">
                  <textarea 
                    required
                    placeholder="Escribir novedad..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:ring-2 ring-blue-500/20 resize-none"
                    rows={2}
                    value={newLog}
                    onChange={(e) => setNewLog(e.target.value)}
                  />
                  <button type="submit" className="w-full mt-2 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Enviar</button>
                </form>
                <div className="flex-1 overflow-y-auto space-y-4">
                  {(editingProject.manufacturingData?.workshopLogs || []).map((log) => (
                    <div key={log.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                      <span className="text-[9px] text-slate-400 block mb-1">{log.date}</span>
                      <p className="text-[11px] text-slate-700 leading-normal">{log.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => handleFinishProduction(editingProject)}
                className="px-6 py-3 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all uppercase text-[10px] tracking-widest flex items-center gap-2"
              >
                <Truck size={14} />
                Enviar a Colocación
              </button>
              <button onClick={handleCloseModal} className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase text-[10px] tracking-widest">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManufacturingManager;
