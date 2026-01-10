
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Building2, CheckCircle2, XCircle, Info, ExternalLink, Settings2, RefreshCcw } from 'lucide-react';
import { Organization, Subscription } from '../types';
import { supabase } from '../services/supabase';

const SaaSAdmin: React.FC = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

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

  const toggleModule = async (orgId: string, module: keyof Subscription) => {
    const currentSub = subs.find(s => s.organization_id === orgId);
    if (!currentSub) return;

    const newValue = !currentSub[module];
    
    const { error } = await supabase
      .from('subscriptions')
      .upsert({ 
        organization_id: orgId, 
        [module]: newValue 
      });

    if (!error) {
      setSubs(prev => prev.map(s => 
        s.organization_id === orgId ? { ...s, [module]: newValue } : s
      ));
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <RefreshCcw className="animate-spin text-blue-500" size={40} />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sincronizando con Supabase...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Administración Multi-empresa</h3>
              <p className="text-slate-500 font-medium">Control maestro de módulos activos en Supabase.</p>
            </div>
          </div>
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
              <div key={org.id} className="p-6 border border-slate-100 rounded-[2rem] bg-slate-50/20 hover:border-blue-200 transition-all flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 w-full lg:w-1/4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                    <Building2 size={24} className="text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg leading-tight">{org.name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{org.slug}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center lg:justify-end w-full lg:w-3/4">
                  <ModuleToggle 
                    label="Gestor" 
                    isActive={sub.has_gestor} 
                    onClick={() => toggleModule(org.id, 'has_gestor')} 
                  />
                  <ModuleToggle 
                    label="Medidor" 
                    isActive={sub.has_medidor} 
                    onClick={() => toggleModule(org.id, 'has_medidor')} 
                  />
                  <ModuleToggle 
                    label="Vidrios" 
                    isActive={sub.has_cotizador_vidrio} 
                    onClick={() => toggleModule(org.id, 'has_cotizador_vidrio')} 
                  />
                  <ModuleToggle 
                    label="Aluminio" 
                    isActive={sub.has_cotizador_aluminio} 
                    onClick={() => toggleModule(org.id, 'has_cotizador_aluminio')} 
                  />
                </div>
              </div>
            );
          })}
          {orgs.length === 0 && (
            <div className="text-center py-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-bold uppercase text-[10px]">No hay organizaciones creadas en Supabase</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ModuleToggle = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-all text-[11px] font-black uppercase tracking-tight ${
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
