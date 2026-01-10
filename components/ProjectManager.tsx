
import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';
import { Plus, Search, MoreHorizontal, MapPin, User, Calendar } from 'lucide-react';

const MOCK_PROJECTS: Project[] = [
  { id: '1', title: 'Edificio Las Palmeras - Piso 4', clientId: 'c1', status: ProjectStatus.PRODUCCION, items: [], createdAt: '2024-05-10', total: 450000 },
  { id: '2', title: 'Residencia Gomez - Carpintería A30', clientId: 'c2', status: ProjectStatus.PRESUPUESTO, items: [], createdAt: '2024-05-15', total: 1200000 },
  { id: '3', title: 'Showroom Automotriz', clientId: 'c3', status: ProjectStatus.INSTALACION, items: [], createdAt: '2024-04-20', total: 890000 },
];

const ProjectManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PRESUPUESTO: return 'bg-slate-100 text-slate-600';
      case ProjectStatus.PRODUCCION: return 'bg-blue-100 text-blue-600';
      case ProjectStatus.INSTALACION: return 'bg-amber-100 text-amber-600';
      case ProjectStatus.FINALIZADO: return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Control de Obras</h2>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus size={20} />
          Nueva Obra
        </button>
      </div>

      <div className="flex gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por título, cliente o dirección..."
            className="w-full pl-10 pr-4 py-2 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_PROJECTS.map((project) => (
          <div key={project.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">{project.title}</h3>
              
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <User size={16} />
                  <span>Juan Perez (Cliente)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={16} />
                  <span>Av. del Libertador 4500, CABA</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar size={16} />
                  <span>Iniciado: {project.createdAt}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 px-5 py-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Total Obra</span>
              <span className="text-lg font-bold text-blue-600">${project.total.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectManager;
