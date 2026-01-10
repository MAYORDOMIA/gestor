
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Building2, CheckCircle2, XCircle, RefreshCcw, Plus, Mail, Lock, Globe, Save } from 'lucide-react';
import { Organization, Subscription } from '../types';
import { supabase } from '../services/supabase';

const SaaSAdmin: React.FC = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', slug: '', email: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: organizations } = await supabase.from('organizations').select('*');
      const { data: subscriptions } = await supabase.from('subscriptions').select('*');
      if (organizations) setOrgs(organizations);
      if (subscriptions) setSubs(subscriptions);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Crear Organización
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([{ name: newOrg.name, slug: newOrg.slug, contact_email: newOrg.email }])
      .select()
      .single();

    if (org) {
      // 2. Crear Suscripción por defecto
      await supabase.from('subscriptions').insert([{ 
        organization_id: org.id, 
        has_gestor: true, 
        has_medidor: false, 
        has_cotizador_vidrio: false, 
        has_cotizador_aluminio: false 
      }]);
      
      setShowAddForm(false);
      setNewOrg({ name: '', slug: '', email: '' });
      fetchData();
    }
    setLoading(false);
  };

  const toggleModule = async (orgId: string, module: keyof Subscription) => {
    const currentSub = subs.find(s => s.organization_id === orgId);
    if (!currentSub) return;

    const newValue = !currentSub[module];
    const { error } = await supabase
      .from('subscriptions')
      .upsert({ organization_id: orgId, [module]: newValue });

    if (!error) {
      setSubs(prev => prev.map(s => 
        s.organization_id === orgId ? { ...s, [module]: newValue } : s
      ));
    }
  };

  if (loading && orgs.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <RefreshCcw className="animate-spin text-blue-500" size={40} />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accediendo al Panel Maestro...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Admin */}
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-500/20">
            <ShieldCheck size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">Panel Super Admin</h2>
            <p className="text-blue-400 font-medium text-sm">pabloviex@live.com.ar • Gestión Global de Aberturas</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
        >
          {showAddForm ? 'Cancelar' : 'Alta de Nueva Empresa'}
        </button>
      </div>

      {/* Formulario Nueva Empresa */}
      {showAddForm && (
        <div className="bg-white p-10 rounded-[2.5rem] border-2 border-blue-100 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleCreateOrg} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Building2 size={14} /> Nombre de la Empresa
              </label>
              <input required type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 font-bold" placeholder="Ej: Vidriería Belgrano" value={newOrg.name} onChange={e => setNewOrg({...newOrg, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} /> Identificador (Slug)
              </label>
              <input required type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 font-bold" placeholder="ej: vidrieria-belgrano" value={newOrg.slug} onChange={e => setNewOrg({...newOrg, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Mail size={14} /> Email del Cliente
              </label>
              <input required type="email" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 font-bold" placeholder="cliente@empresa.com" value={newOrg.email} onChange={e => setNewOrg({...newOrg, email: e.target.value})} />
            </div>
            <div className="md:col-span-3 pt-4">
              <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3">
                <Save size={18} /> Crear Empresa y Configurar Módulos
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Empresas */}
      <div className="grid grid-cols-1 gap-6">
        {orgs.map(org => {
          const sub = subs.find(s => s.organization_id === org.id) || {
            organization_id: org.id,
            has_gestor: false,
            has_medidor: false,
            has_cotizador_vidrio: false,
            has_cotizador_aluminio: false
          };
          
          return (
            <div key={org.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-8 hover:border-blue-300 transition-all">
              <div className="flex items-center gap-6 w-full lg:w-1/3">
                <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-400">
                  <Building2 size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">{org.name}</h4>
                  <p className="text-xs font-medium text-slate-400">{org.contact_email}</p>
                  <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase mt-2 inline-block">ID: {org.slug}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-end w-full lg:w-2/3">
                <ModuleToggle 
                  label="App Gestor" 
                  isActive={sub.has_gestor} 
                  onClick={() => toggleModule(org.id, 'has_gestor')} 
                />
                <ModuleToggle 
                  label="App Medidor" 
                  isActive={sub.has_medidor} 
                  onClick={() => toggleModule(org.id, 'has_medidor')} 
                />
                <ModuleToggle 
                  label="Cotiz. Vidrio" 
                  isActive={sub.has_cotizador_vidrio} 
                  onClick={() => toggleModule(org.id, 'has_cotizador_vidrio')} 
                />
                <ModuleToggle 
                  label="Cotiz. Aluminio" 
                  isActive={sub.has_cotizador_aluminio} 
                  onClick={() => toggleModule(org.id, 'has_cotizador_aluminio')} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ModuleToggle = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all text-[11px] font-black uppercase tracking-tight ${
      isActive 
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-inner' 
        : 'bg-white border-slate-100 text-slate-400 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'
    }`}
  >
    {isActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
    {label}
  </button>
);

export default SaaSAdmin;
