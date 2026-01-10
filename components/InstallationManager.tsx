
import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';
import { 
  Search, MapPin, Truck, Calendar, User, 
  CheckCircle, Clock, Info, X, Edit3, 
  Check, MessageSquare, Send
} from 'lucide-react';

interface InstallationManagerProps {
  projects: Project[];
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
}

const InstallationManager: React.FC<InstallationManagerProps> = ({ projects, onUpdateProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter(p => 
    p.status === ProjectStatus.INSTALACION && 
    (p.requestData?.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || p.clientCode?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleComplete = (project: Project) => {
    onUpdateProject(project.id, { status: ProjectStatus.FINALIZADO });
  };

  const handleUpdateInstallationData = (field: string, value: any) => {
    if (!editingProject) return;
    const updatedData = {
      ...editingProject.installationData,
      [field]: value
    };
    onUpdateProject(editingProject.id, { installationData: updatedData });
    setEditingProject({ ...editingProject, installationData: updatedData });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Instalación</h2>
          <p className="text-slate-500 text-sm">Gestión de equipos y colocación en obra.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar obra..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-400 transition-all group">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black text-white bg-slate-900 px-2 py-1 rounded-lg uppercase tracking-widest">{project.clientCode}</span>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest">En Obra</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{project.requestData?.clientName}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin size={14} className="text-slate-400" />
                  {project.requestData?.address}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Equipo Asignado</p>
                <div className="flex items-center gap-2 justify-end text-blue-600">
                  <User size={14} />
                  <span className="text-sm font-bold">{project.installationData?.teamName || 'S/D'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Programada</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{project.installationData?.scheduledDate || 'No definida'}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Edit3 size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas de Colocación</span>
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    {project.installationData?.notes || 'Sin notas registradas aún.'}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
                <Truck size={32} className="text-blue-500 mb-3" />
                <h4 className="text-sm font-black text-blue-900 mb-1 uppercase tracking-tight">Estado de Instalación</h4>
                <p className="text-xs text-blue-600/80 mb-4 font-medium">Coordinación de personal y logística</p>
                <button 
                  onClick={() => setEditingProject(project)}
                  className="w-full py-2 bg-white border border-blue-200 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-50 transition-all"
                >
                  Actualizar Datos
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button 
                onClick={() => handleToggleComplete(project)}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10"
              >
                <Check size={16} />
                Finalizar Obra
              </button>
            </div>
          </div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="lg:col-span-2 py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
            <Truck size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-medium italic">No hay obras en etapa de instalación.</p>
          </div>
        )}
      </div>

      {/* Modal Editar Instalación */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Truck size={24} className="text-blue-500" />
                <h3 className="text-xl font-bold">Datos de Colocación</h3>
              </div>
              <button onClick={() => setEditingProject(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Equipo Asignado</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 ring-blue-500/20"
                  value={editingProject.installationData?.teamName || ''}
                  onChange={(e) => handleUpdateInstallationData('teamName', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha de Colocación</label>
                <input 
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 ring-blue-500/20"
                  value={editingProject.installationData?.scheduledDate || ''}
                  onChange={(e) => handleUpdateInstallationData('scheduledDate', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Notas de Avance en Obra</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 ring-blue-500/20 resize-none"
                  value={editingProject.installationData?.notes || ''}
                  onChange={(e) => handleUpdateInstallationData('notes', e.target.value)}
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setEditingProject(null)} className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20">Guardar Datos</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallationManager;
