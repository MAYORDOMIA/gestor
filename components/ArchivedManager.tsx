
import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';
import { 
  Search, MapPin, Archive, Calendar, User, 
  CheckCircle, FileText, Download, X, Eye, 
  Clock, Truck, Factory, MessageSquare, Info, ClipboardCheck
} from 'lucide-react';

interface ArchivedManagerProps {
  projects: Project[];
}

const ArchivedManager: React.FC<ArchivedManagerProps> = ({ projects }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const finalizedProjects = projects.filter(p => 
    p.status === ProjectStatus.FINALIZADO && 
    (p.requestData?.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || p.clientCode?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Histórico de Obras</h2>
          <p className="text-slate-500 text-sm">Archivo completo de trabajos entregados y finalizados.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar en el archivo..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {finalizedProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-emerald-400 transition-all group">
            <div className="p-6 border-b border-slate-50">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-white bg-emerald-600 px-2 py-1 rounded-lg uppercase tracking-widest">{project.clientCode}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                   <Archive size={10} /> Finalizado
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 truncate">{project.requestData?.clientName}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin size={12} /> {project.requestData?.address}
              </p>
            </div>
            
            <div className="px-6 py-4 flex-1 space-y-3 bg-slate-50/30">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Línea/Color:</span>
                <span className="text-slate-700 font-bold">{project.manufacturingData?.line} - {project.manufacturingData?.color}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Instalado por:</span>
                <span className="text-slate-700 font-bold">{project.installationData?.teamName}</span>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <button 
                onClick={() => setSelectedProject(project)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all"
              >
                <Eye size={14} />
                Ver Historial Completo
              </button>
            </div>
          </div>
        ))}
        {finalizedProjects.length === 0 && (
          <div className="lg:col-span-3 py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
            <Archive size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-medium italic">No hay obras finalizadas en el archivo.</p>
          </div>
        )}
      </div>

      {/* Modal Historial de Obra */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8 bg-emerald-700 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <Archive size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{selectedProject.clientCode}</h3>
                  <p className="text-sm text-emerald-100 font-medium">{selectedProject.requestData?.clientName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProject(null)} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Bloque 1: Info General y Presupuesto */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Info size={16} className="text-emerald-600" />
                  Origen y Presupuesto
                </h4>
                <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Contacto</label>
                    <p className="text-sm font-bold text-slate-800">{selectedProject.requestData?.phone}</p>
                    <p className="text-xs text-slate-500">{selectedProject.requestData?.email}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Dirección</label>
                    <p className="text-sm font-bold text-slate-800">{selectedProject.requestData?.address}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <a href={selectedProject.finalBudgetUrl} target="_blank" className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 transition-all">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-red-500" />
                        <span className="text-xs font-bold">Presupuesto Final</span>
                      </div>
                      <Download size={14} className="text-slate-400" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Bloque 2: Fabricación */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Factory size={16} className="text-emerald-600" />
                  Paso por Taller
                </h4>
                <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Línea</label>
                        <p className="text-xs font-bold text-slate-800">{selectedProject.manufacturingData?.line}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Color</label>
                        <p className="text-xs font-bold text-slate-800">{selectedProject.manufacturingData?.color}</p>
                      </div>
                   </div>
                   <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Tareas Cumplidas</label>
                    <div className="space-y-1.5">
                      {(selectedProject.manufacturingData?.tasks || []).map(task => (
                        <div key={task.id} className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                          <CheckCircle size={12} className="text-emerald-500" />
                          {task.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Logs de Taller</label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {(selectedProject.manufacturingData?.workshopLogs || []).map(log => (
                        <div key={log.id} className="text-[10px] bg-white p-2 rounded-lg border border-slate-100">
                          <span className="font-bold text-emerald-700 block mb-1">{log.date}</span>
                          {log.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloque 3: Instalación */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Truck size={16} className="text-emerald-600" />
                  Entrega e Instalación
                </h4>
                <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Equipo de Colocación</label>
                    <p className="text-sm font-bold text-slate-800">{selectedProject.installationData?.teamName}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Fecha de Cierre</label>
                    <p className="text-sm font-bold text-slate-800">{selectedProject.installationData?.scheduledDate}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Notas de Obra</label>
                    <p className="text-xs text-slate-600 italic mt-1 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100">
                      "{selectedProject.installationData?.notes || 'Sin notas especiales.'}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedProject(null)}
                className="px-10 py-3 bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-700/20 text-[10px] uppercase tracking-widest"
              >
                Cerrar Historial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivedManager;
