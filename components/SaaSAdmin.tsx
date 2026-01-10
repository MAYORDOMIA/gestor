
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Building2, CheckCircle2, XCircle, RefreshCcw, Plus, Mail, Lock, Globe, Save, ExternalLink } from 'lucide-react';
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
    
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([{ name: newOrg.name, slug: newOrg.slug, contact_email: newOrg.email }])
      .select()
      .single();

    if (org) {
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
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <RefreshCcw className="animate-spin text-blue-600" size={50} />
      <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">Cargando Infraestructura SaaS...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      {/* Header Admin Pro */}
      <div className="bg-slate-900 p-12 rounded-[4rem] text-white flex flex-col md:flex-row justify-between items-center gap-10 shadow-[0_30px_70px_rgba(15,23,42,0.4)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="p-6 bg-blue-600 rounded-[2.5rem] shadow-[0_15px_30px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform duration-500">
            <ShieldCheck size={50} />
          </div>
          <div>
            <h2 className="text-4xl font-[900] tracking-tighter leading-none mb-2">Panel Maestro</h2>
            <p className="text-blue-400 font-bold text-[11px] uppercase tracking-[0.3em]">Gestión Central de Licencias • SuperAdmin</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-10 py-5 bg-white text-slate-900 rounded-[2rem] text-xs font-[900] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_15px_30px_rgba(255,255,255,0.2)] z-10"
        >
          {showAddForm ? 'Cancelar Operación' : 'Alta de Nueva Empresa'}
        </button>
      </div>

      {/* Formulario Nueva Empresa */}
      {showAddForm && (
        <div className="bg-white p-12 rounded-[4rem] border-2 border-blue-200 shadow-2xl animate-in slide-in-from-top-10 duration-500">
          <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3">
            <Building2 className="text-blue-600" /> Nuevo Registro de Cliente
          </h3>
          <form onSubmit={handleCreateOrg} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-[900] text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
              <input required type="text" className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-blue-500 font-bold transition-all text-sm" placeholder="Vidrios S.A." value={newOrg.name} onChange={e => setNewOrg({...newOrg, name: e.target.value})} />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-[900] text-slate-400 uppercase tracking-widest ml-1">Slug Identificador</label>
              <input required type="text" className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-blue-500 font-bold transition-all text-sm" placeholder="vidrios-sa" value={newOrg.slug} onChange={e => setNewOrg({...newOrg, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-[900] text-slate-400 uppercase tracking-widest ml-1">Email del Titular</label>
              <input required type="email" className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-blue-500 font-bold transition-all text-sm" placeholder="info@empresa.com" value={newOrg.email} onChange={e => setNewOrg({...newOrg, email: e.target.value})} />
            </div>
            <div className="md:col-span-3 pt-6">
              <button type="submit" className="w-full py-6 bg-blue-600 text-white font-[900] rounded-[2rem] uppercase tracking-[0.3em] text-xs shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-4">
                <Save size={20} /> Ejecutar Alta en Base de Datos
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Empresas con Remarcado Fuerte */}
      <div className="grid grid-cols-1 gap-8">
        {orgs.map(org => {
          const sub = subs.find(s => s.organization_id === org.id) || {
            organization_id: org.id,
            has_gestor: false,
            has_medidor: false,
            has_cotizador_vidrio: false,
            has_cotizador_aluminio: false
          };
          
          return (
            <div key={org.id} className="bg-white p-10 rounded-[3.5rem] border-2 border-slate-100 shadow-xl flex flex-col xl:flex-row justify-between items-center gap-10 hover:border-blue-400 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-8 w-full xl:w-1/3">
                <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl">
                  <Building2 size={40} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-2xl font-[900] text-slate-900 tracking-tight">{org.name}</h4>
                  <p className="text-[13px] font-bold text-slate-400">{org.contact_email}</p>
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">ID: {org.slug}</span>
                    <ExternalLink size={14} className="text-slate-300 hover:text-blue-500 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-2/3">
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
                  label="Cotiz. Alum." 
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
    className={`flex flex-col items-center justify-center gap-4 p-6 rounded-[2.5rem] border-2 transition-all duration-500 ${
      isActive 
        ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_15px_30px_rgba(16,185,129,0.3)]' 
        : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 opacity-60'
    }`}
  >
    {isActive ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
    <span className="text-[11px] font-[900] uppercase tracking-widest">{label}</span>
  </button>
);

export default SaaSAdmin;
