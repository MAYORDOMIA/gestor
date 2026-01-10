
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Building2, CheckCircle2, XCircle, Info, RefreshCcw, Plus, UserPlus, ArrowRight, Settings } from 'lucide-react';
import { Organization, Subscription } from '../types';
import { supabase } from '../services/supabase';

const SaaSAdmin: React.FC = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddOrg, setShowAddOrg] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', slug: '', adminEmail: '', adminPassword: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: organizations } = await supabase.from('organizations').select('*');
    const { data: subscriptions } = await supabase.from('subscriptions').select('*');
    
    if (organizations) setOrgs(organizations);
    if (subscriptions) setSubs(subscriptions);
    setLoading(false);
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para crear organización y su suscripción por defecto
    const { data, error } = await supabase
      .from('organizations')
      .insert({ name: newOrg.name, slug: newOrg.slug })
      .select()
      .single();

    if (data) {
      await supabase.from('subscriptions').insert({ organization_id: data.id });
      // Aquí se dispararía la creación del usuario administrador vía Supabase Auth
      // (Requiere Service Role o Edge Function para creación forzada)
      fetchData();
      setShowAddOrg(false);
      setNewOrg({ name: '', slug: '', adminEmail: '', adminPassword: '' });
    }
  };

  const toggleModule = async (orgId: string, module: keyof Subscription) => {
    const currentSub = subs.find(s => s.organization_id === orgId);
    const newValue = currentSub ? !currentSub[module] : true;
    
    const { error } = await supabase
      .from('subscriptions')
      .upsert({ 
        organization_id: orgId, 
        [module]: newValue 
      });

    if (!error) {
      setSubs(prev => {
        const existing = prev.find(s => s.organization_id === orgId);
        if (existing) {
          return prev.map(s => s.organization_id === orgId ? { ...s, [module]: newValue } : s);
        }
        return [...prev, { organization_id: orgId, [module]: newValue } as any];
      });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <RefreshCcw className="animate-spin text-blue-500" size={40} />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs text-center">Sincronizando con Supabase...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-900 text-white rounded-[1.5rem] shadow-xl shadow-slate-900/10">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Panel Control Pablo</h3>
              <p className="text-slate-500 font-medium">Gestión de licencias y empresas clientes.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddOrg(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all"
          >
            <Plus size={16} /> Registrar Empresa
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {orgs.map(org => {
            const sub = subs.find(s => s.organization_id === org.id) || {
              organization_id: org.id,
              has_gestor: false,
              has_medidor: false,
              has_cotizador_vidrio: false,
              has_cotizador_aluminio: false
            };
            
            return (
              <div key={org.id} className="p-8 border border-slate-100 rounded-[2.5rem] bg-[#F8FAFC] hover:border-blue-200 hover:bg-white transition-all flex flex-col lg:flex-row justify-between items-center gap-6 group">
                <div className="flex items-center gap-5 w-full lg:w-1/3">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xl leading-tight">{org.name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {org.slug}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center lg:justify-end w-full lg:w-2/3">
                  <ModuleToggle label="Gestor Obras" isActive={sub.has_gestor} onClick={() => toggleModule(org.id, 'has_gestor')} />
                  <ModuleToggle label="Medidor Móvil" isActive={sub.has_medidor} onClick={() => toggleModule(org.id, 'has_medidor')} />
                  <ModuleToggle label="Cotiza Vidrio" isActive={sub.has_cotizador_vidrio} onClick={() => toggleModule(org.id, 'has_cotizador_vidrio')} />
                  <ModuleToggle label="Cotiza Aluminio" isActive={sub.has_cotizador_aluminio} onClick={() => toggleModule(org.id, 'has_cotizador_aluminio')} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddOrg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <UserPlus size={24} className="text-blue-500" />
                <h3 className="text-xl font-black uppercase tracking-tight">Alta de Nueva Empresa</h3>
              </div>
              <button onClick={() => setShowAddOrg(false)} className="text-slate-400 hover:text-white transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrganization} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nombre Comercial</label>
                  <input required type="text" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl text-sm font-bold" value={newOrg.name} onChange={e => setNewOrg({...newOrg, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Slug / Identificador</label>
                  <input required type="text" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl text-sm font-black text-blue-600" value={newOrg.slug} onChange={e => setNewOrg({...newOrg, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Settings size={14} /> Datos Admin Inicial
                </p>
                <div className="space-y-4">
                  <input required type="email" placeholder="Email Admin de Empresa" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl text-sm" value={newOrg.adminEmail} onChange={e => setNewOrg({...newOrg, adminEmail: e.target.value})} />
                  <input required type="password" placeholder="Contraseña Temporal" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl text-sm" value={newOrg.adminPassword} onChange={e => setNewOrg({...newOrg, adminPassword: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddOrg(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-full font-black text-[10px] uppercase tracking-widest">Cerrar</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2">
                  Crear Empresa <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ModuleToggle = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-tight ${
      isActive 
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' 
        : 'bg-white border-slate-100 text-slate-400 opacity-60'
    }`}
  >
    {isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
    {label}
  </button>
);

export default SaaSAdmin;
