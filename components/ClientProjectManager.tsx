
import React, { useState, useRef } from 'react';
import { Project, ProjectStatus, ManufacturingTask } from '../types';
import { 
  Phone, Mail, FileText, ExternalLink, Calendar, User, 
  Download, Search, Hash, Tag, Factory, X, Palette, 
  Layers, Info, Upload, Check, Clock
} from 'lucide-react';

interface ClientProjectManagerProps {
  projects: Project[];
  onUpdateProject?: (id: string, updates: Partial<Project>) => void;
}

const ClientProjectManager: React.FC<ClientProjectManagerProps> = ({ projects, onUpdateProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [setupProject, setSetupProject] = useState<Project | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadType, setActiveUploadType] = useState<'materials' | 'optimization' | null>(null);

  const filteredProjects = projects.filter((project) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      project.status === ProjectStatus.PRESUPUESTO && (
        project.requestData?.clientName.toLowerCase().includes(searchLower) ||
        project.requestData?.email.toLowerCase().includes(searchLower) ||
        project.clientCode?.toLowerCase().includes(searchLower) ||
        project.requestData?.phone.includes(searchTerm)
      )
    );
  });

  const handleOpenSetup = (project: Project) => {
    const defaultTasks: ManufacturingTask[] = [
      { id: 'task_materials', label: 'Compra de materiales', isCompleted: false, notes: '' },
      { id: 'task_glass', label: 'Vidrios', isCompleted: false, notes: '' },
      { id: 'task_aluminum', label: 'Aluminio', isCompleted: false, notes: '' },
      { id: 'task_installation', label: 'Colocación', isCompleted: false, notes: '' },
    ];

    setSetupProject({
      ...project,
      manufacturingData: {
        color: '',
        line: '',
        details: '',
        workshopLogs: [],
        deliveryDate: '',
        tasks: defaultTasks
      }
    });
  };

  const handleUpdateSetupField = (field: string, value: any) => {
    if (!setupProject) return;
    setSetupProject(prev => {
      if (!prev) return null;
      return {
        ...prev,
        manufacturingData: {
          ...prev.manufacturingData,
          [field]: value
        }
      };
    });
  };

  const handleFileClick = (type: 'materials' | 'optimization') => {
    setActiveUploadType(type);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset value to allow re-upload of same file
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && setupProject && activeUploadType) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      
      const updates = activeUploadType === 'materials' 
        ? { materialsPdfUrl: url, materialsPdfName: file.name }
        : { optimizationPdfUrl: url, optimizationPdfName: file.name };

      setSetupProject(prev => {
        if (!prev) return null;
        return {
          ...prev,
          manufacturingData: {
            ...prev.manufacturingData,
            ...updates
          }
        };
      });
      
      setActiveUploadType(null);
    }
  };

  const handleConfirmProduction = () => {
    if (setupProject && onUpdateProject) {
      onUpdateProject(setupProject.id, { 
        status: ProjectStatus.PRODUCCION,
        manufacturingData: setupProject.manufacturingData
      });
      setSetupProject(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Clientes</h2>
          <p className="text-slate-500 text-sm">Presupuestos enviados pendientes de aprobación o inicio de obra.</p>
        </div>
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, mail o código..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 ring-blue-500/20 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row hover:border-blue-300 transition-colors">
              <div className="p-6 md:w-2/3 border-b md:border-b-0 md:border-r border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 leading-none mb-1">
                        {project.requestData?.clientName || 'Cliente'}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Tag size={12} />
                        <span>Presupuesto #{project.id.split('_')[1]}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">Presupuesto Enviado</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span>{project.requestData?.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span className="truncate">{project.requestData?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{project.createdAt}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase mb-1">
                      <Hash size={12} />
                      Código de Obra
                    </label>
                    <div className="text-blue-900 font-black text-lg tracking-tight">
                      {project.clientCode || 'SIN CÓDIGO'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a 
                    href={project.finalBudgetUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                  >
                    <Download size={16} />
                    Ver Presupuesto
                  </a>
                  <button 
                    onClick={() => handleOpenSetup(project)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Factory size={16} />
                    Enviar a Fabricación
                  </button>
                </div>
              </div>

              <div className="p-6 md:w-1/3 bg-slate-50/50 flex flex-col justify-center">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase">
                    <FileText size={12} />
                    <span>Descripción Inicial</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed italic line-clamp-4">
                    "{project.requestData?.description}"
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
            <FileText size={48} className="mb-4 opacity-20" />
            <p>{searchTerm ? 'No se encontraron resultados.' : 'No hay presupuestos en esta sección.'}</p>
          </div>
        )}
      </div>

      {/* Modal Configuración Fabricación */}
      {setupProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2.5 rounded-xl">
                  <Factory size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Iniciar Fabricación</h3>
                  <p className="text-xs text-blue-300">Configuración técnica de obra: {setupProject.clientCode}</p>
                </div>
              </div>
              <button onClick={() => setSetupProject(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <input type="file" ref={fileInputRef} hidden accept=".pdf" onChange={handleFileChange} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <Palette size={14} className="text-blue-500" />
                    Color / Acabado
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej: Blanco, Negro Goya, Anodizado..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 ring-blue-500/20 outline-none text-sm font-medium"
                    value={setupProject.manufacturingData?.color || ''}
                    onChange={(e) => handleUpdateSetupField('color', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <Layers size={14} className="text-blue-500" />
                    Línea de Carpintería
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej: Modena, A30, Herrero..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 ring-blue-500/20 outline-none text-sm font-medium"
                    value={setupProject.manufacturingData?.line || ''}
                    onChange={(e) => handleUpdateSetupField('line', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-500" />
                    Fecha de Entrega Estimada
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 ring-blue-500/20 outline-none text-sm font-medium"
                    value={setupProject.manufacturingData?.deliveryDate || ''}
                    onChange={(e) => handleUpdateSetupField('deliveryDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-500" />
                  Documentación para Taller (PDF)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => handleFileClick('materials')}
                    className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${setupProject.manufacturingData?.materialsPdfUrl ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}`}
                  >
                    {setupProject.manufacturingData?.materialsPdfUrl ? (
                      <>
                        <Check size={24} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">Materiales Cargado</span>
                        <span className="text-[8px] text-slate-500 truncate max-w-full">{setupProject.manufacturingData.materialsPdfName}</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Pedido de Materiales</span>
                      </>
                    )}
                  </div>
                  <div 
                    onClick={() => handleFileClick('optimization')}
                    className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${setupProject.manufacturingData?.optimizationPdfUrl ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}`}
                  >
                    {setupProject.manufacturingData?.optimizationPdfUrl ? (
                      <>
                        <Check size={24} className="text-indigo-500" />
                        <span className="text-[10px] font-bold text-indigo-700 uppercase">Optimización Cargada</span>
                        <span className="text-[8px] text-slate-500 truncate max-w-full">{setupProject.manufacturingData.optimizationPdfName}</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Optimización de Corte</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Info size={14} className="text-blue-500" />
                  Detalles para Taller
                </label>
                <textarea 
                  rows={4}
                  placeholder="Instrucciones específicas, herrajes, plazos urgentes..."
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 ring-blue-500/20 outline-none text-sm font-medium resize-none bg-slate-50/50"
                  value={setupProject.manufacturingData?.details || ''}
                  onChange={(e) => handleUpdateSetupField('details', e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
              <button onClick={() => setSetupProject(null)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors">Cancelar</button>
              <button 
                onClick={handleConfirmProduction}
                className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-colors"
              >
                Confirmar e Iniciar Fabricación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProjectManager;
