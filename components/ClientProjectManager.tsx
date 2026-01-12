
import React, { useState, useRef } from 'react';
import { supabase } from '../services/supabase';
import { Project, ProjectStatus, ManufacturingTask } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  Phone, Mail, FileText, ExternalLink, Calendar, User, 
  Download, Search, Hash, Tag, Factory, X, Palette, 
  Layers, Info, Upload, Check, Clock, UserPlus, ShieldCheck, Loader2
} from 'lucide-react';

interface ClientProjectManagerProps {
  projects: Project[];
  onUpdateProject?: (id: string, updates: Partial<Project>) => void;
}

const ClientProjectManager: React.FC<ClientProjectManagerProps> = ({ projects, onUpdateProject }) => {
  const { isGodMode } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [setupProject, setSetupProject] = useState<Project | null>(null);
  const [userModalProject, setUserModalProject] = useState<Project | null>(null);
  const [newUser, setNewUser] = useState({ email: '', password: '' });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadType, setActiveUploadType] = useState<'materials' | 'optimization' | null>(null);

  const filteredProjects = projects.filter((project) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      project.status === ProjectStatus.PRESUPUESTO && (
        project.requestData?.client_name.toLowerCase().includes(searchLower) ||
        project.requestData?.email.toLowerCase().includes(searchLower) ||
        project.client_code?.toLowerCase().includes(searchLower) ||
        project.requestData?.phone.includes(searchTerm)
      )
    );
  });

  const handleCreateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userModalProject || !isGodMode) return;
    
    setIsCreatingUser(true);
    setUserError('');
    setUserSuccess(false);

    try {
      const cleanEmail = newUser.email.toLowerCase().trim();
      console.log("ACCESO CLIENTE: Iniciando registro para:", cleanEmail);

      // A. Auth Primero
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: newUser.password,
      });

      // B. Validación
      if (authError) {
        console.error("ERROR TÉCNICO AUTH (CLIENTE):", authError.message, authError);
        throw new Error(authError.message);
      }

      const userId = authData.user?.id;
      if (!userId) throw new Error("ID de usuario no disponible tras el registro Auth.");

      // C. Inserción Perfil Manual
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: cleanEmail,
          role: 'admin',
          organization_id: userModalProject.organization_id
        });

      if (profileError) {
        console.error("ERROR TÉCNICO DATABASE (CLIENTE PROFILES):", profileError.message);
        throw new Error(`Fallo en base de datos: ${profileError.message}`);
      }

      setUserSuccess(true);
      setNewUser({ email: '', password: '' });
      setTimeout(() => {
        setUserModalProject(null);
        setUserSuccess(false);
      }, 2500);
      
    } catch (err: any) {
      console.error("FALLO EN ACCESO CLIENTE:", err);
      setUserError(err.message || "Error al guardar el nuevo usuario.");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleOpenSetup = (project: Project) => {
    const defaultTasks: ManufacturingTask[] = [
      { id: 'task_materials', label: 'Compra de materiales', isCompleted: false, notes: '' },
      { id: 'task_glass', label: 'Vidrios', isCompleted: false, notes: '' },
      { id: 'task_aluminum', label: 'Aluminio', isCompleted: false, notes: '' },
      { id: 'task_installation', label: 'Colocación', isCompleted: false, notes: '' },
    ];

    setSetupProject({
      ...project,
      manufacturing_data: {
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
        manufacturing_data: {
          ...prev.manufacturing_data,
          [field]: value
        }
      };
    });
  };

  const handleFileClick = (type: 'materials' | 'optimization') => {
    setActiveUploadType(type);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          manufacturing_data: {
            ...prev.manufacturing_data,
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
        manufacturing_data: setupProject.manufacturing_data
      });
      setSetupProject(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Carpeta Clientes</h2>
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
            <div key={project.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row hover:border-blue-300 transition-colors">
              <div className="p-6 md:w-2/3 border-b md:border-b-0 md:border-r border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 leading-none mb-1">
                        {project.requestData?.client_name || 'Cliente'}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Tag size={12} />
                        <span>Presupuesto #{project.id.split('_')[1]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isGodMode && (
                      <button 
                        onClick={() => setUserModalProject(project)}
                        className="text-[10px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full border border-blue-100 uppercase tracking-wider flex items-center gap-1.5 transition-all"
                      >
                        <UserPlus size={12} /> Crear Acceso
                      </button>
                    )}
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-wider">Enviado</span>
                  </div>
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
                      {/* Use snake_case created_at property */}
                      <span>{project.created_at}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase mb-1">
                      <Hash size={12} />
                      Código de Obra
                    </label>
                    <div className="text-blue-900 font-black text-lg tracking-tight">
                      {/* Use snake_case client_code property */}
                      {project.client_code || 'SIN CÓDIGO'}
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

      {userModalProject && isGodMode && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="text-center mb-8">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20">
                <UserPlus size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Alta de Usuario</h3>
              <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">Empresa: {userModalProject.requestData?.client_name}</p>
            </div>

            {userSuccess ? (
              <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100">
                  <ShieldCheck size={40} />
                </div>
                <p className="text-sm font-black text-emerald-700 uppercase tracking-widest">Acceso creado correctamente</p>
              </div>
            ) : (
              <form onSubmit={handleCreateAccess} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email del Administrador</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="ej: admin@empresa.com"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Contraseña Inicial</label>
                  <input 
                    required 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>

                {userError && (
                  <div className="p-4 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-2xl text-center border border-rose-100">
                    {userError}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setUserModalProject(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-full text-[10px] uppercase tracking-widest transition-all hover:bg-slate-200">Cancelar</button>
                  <button 
                    type="submit" 
                    disabled={isCreatingUser}
                    className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-full shadow-lg text-[10px] uppercase tracking-widest transition-all hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    {isCreatingUser ? <Loader2 className="animate-spin" size={16} /> : "Generar Acceso"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
                  <p className="text-xs text-blue-300">Configuración técnica de obra: {setupProject.client_code}</p>
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
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Palette size={14} className="text-blue-500" />Color / Acabado</label>
                  <input type="text" placeholder="Ej: Blanco, Negro Goya, Anodizado..." className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 ring-blue-500/20 outline-none text-sm font-medium" value={setupProject.manufacturing_data?.color || ''} onChange={(e) => handleUpdateSetupField('color', e.target.value)}/>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Layers size={14} className="text-blue-500" />Línea de Carpintería</label>
                  <input type="text" placeholder="Ej: Modena, A30, Herrero..." className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 ring-blue-500/20 outline-none text-sm font-medium" value={setupProject.manufacturing_data?.line || ''} onChange={(e) => handleUpdateSetupField('line', e.target.value)}/>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Clock size={14} className="text-blue-500" />Fecha de Entrega Estimada</label>
                  <input type="date" className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 ring-blue-500/20 outline-none text-sm font-medium" value={setupProject.manufacturing_data?.deliveryDate || ''} onChange={(e) => handleUpdateSetupField('deliveryDate', e.target.value)}/>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><FileText size={14} className="text-blue-500" />Documentación para Taller (PDF)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div onClick={() => handleFileClick('materials')} className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${setupProject.manufacturing_data?.materialsPdfUrl ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}`}>
                    {setupProject.manufacturing_data?.materialsPdfUrl ? (<><Check size={24} className="text-emerald-500" /><span className="text-[10px] font-bold text-emerald-700 uppercase">Materiales Cargado</span></>) : (<><Upload size={24} className="text-slate-400" /><span className="text-[10px] font-bold text-slate-500 uppercase">Pedido de Materiales</span></>)}
                  </div>
                  <div onClick={() => handleFileClick('optimization')} className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${setupProject.manufacturing_data?.optimizationPdfUrl ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}`}>
                    {setupProject.manufacturing_data?.optimizationPdfUrl ? (<><Check size={24} className="text-indigo-500" /><span className="text-[10px] font-bold text-indigo-700 uppercase">Optimización Cargada</span></>) : (<><Upload size={24} className="text-slate-400" /><span className="text-[10px] font-bold text-slate-500 uppercase">Optimización de Corte</span></>)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button onClick={() => setSetupProject(null)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={handleConfirmProduction} className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-colors">Confirmar e Iniciar Fabricación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProjectManager;
