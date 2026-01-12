
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Organization } from '../types';
import { 
  Building2, ShieldCheck, ShieldAlert, Globe, 
  ToggleLeft, ToggleRight, Plus, Search, 
  CreditCard, Loader2, UserPlus, Mail, Key,
  X, Check, Lock, Ruler
} from 'lucide-react';

const SaaSAdmin: React.FC = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [userModalOrg, setUserModalOrg] = useState<Organization | null>(null);
  const [newUser, setNewUser] = useState({ email: '', password: '' });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userStatus, setUserStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const fetchOrgs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        subscription:subscriptions (*)
      `)
      .order('created_at', { ascending: false });
    
    if (!error && data) setOrgs(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchOrgs(); }, []);

  const toggleApp = async (orgId: string, appField: string, currentValue: boolean) => {
    setUpdatingId(`${orgId}-${appField}`);
    const { error } = await supabase
      .from('subscriptions')
      .update({ [appField]: !currentValue })
      .eq('organization_id', orgId);
    
    if (!error) await fetchOrgs();
    setUpdatingId(null);
  };

  const toggleStatus = async (orgId: string, currentStatus: boolean) => {
    setUpdatingId(`${orgId}-status`);
    const { error } = await supabase
      .from('organizations')
      .update({ is_active: !currentStatus })
      .eq('id', orgId);
    
    if (!error) await fetchOrgs();
    setUpdatingId(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userModalOrg) return;
    setIsCreatingUser(true);
    setUserStatus(null);

    try {
      const cleanEmail = newUser.email.toLowerCase().trim();
      
      // 1. Registro en Auth. Pasamos metadata para que el sistema sepa la org desde el inicio.
      const { data, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: newUser.password,
        options: {
          data: {
            organization_id: userModalOrg.id,
            role: 'admin'
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        // 2. Usamos UPSERT. Si el trigger en DB ya lo creó, UPSERT simplemente lo actualiza.
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: cleanEmail,
            role: 'admin',
            organization_id: userModalOrg.id
          }, { 
            onConflict: 'id' 
          });

        if (profileError && profileError.code !== '23505') { // Ignorar error de duplicado si ocurre
          console.warn("Posible conflicto de perfil:", profileError);
        }
        
        setUserStatus({ type: 'success', msg: 'Acceso corporativo generado correctamente.' });
        setNewUser({ email: '', password: '' });
        
        setTimeout(() => {
          setUserModalOrg(null);
          setUserStatus(null);
          fetchOrgs();
        }, 2000);
      }
    } catch (err: any) {
      console.error("Error creating user:", err);
      let msg = err.message;
      if (err.message.includes('Database error')) {
        msg = 'Error de Base de Datos: Verifique que haya eliminado el Trigger en Supabase.';
      }
      setUserStatus({ type: 'error', msg });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const filteredOrgs = orgs.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Ecosistema Arista Studio</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Master Control SaaS (4 Apps Vinculadas)</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar empresa por nombre..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500/20 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredOrgs.map((org) => (
          <div key={org.id} className={`bg-white rounded-[2.5rem] border transition-all p-10 shadow-sm ${org.is_active ? 'border-slate-200' : 'border-rose-200 bg-rose-50/30'}`}>
            <div className="flex flex-col xl:flex-row justify-between gap-12">
              <div className="flex gap-8 xl:w-1/4">
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl shrink-0 ${org.is_active ? 'bg-slate-900 text-white' : 'bg-rose-100 text-rose-600'}`}>
                  <Building2 size={40} />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight">{org.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Globe size={14} className="text-slate-400" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{org.slug}.arista.studio</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-6">
                    <button 
                      onClick={() => toggleStatus(org.id, org.is_active)}
                      className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${org.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'}`}
                    >
                      {updatingId === `${org.id}-status` ? <Loader2 size={12} className="animate-spin" /> : (org.is_active ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />)}
                      {org.is_active ? 'Activa' : 'Baja'}
                    </button>
                    <button 
                      onClick={() => setUserModalOrg(org)}
                      className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-100 shadow-sm"
                    >
                      <UserPlus size={12} /> Crear Acceso
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Apps Disponibles por Organización</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <AppControl 
                    label="App Gestión" 
                    icon={<CreditCard size={20} />}
                    isActive={!!org.subscription?.has_app_gestion} 
                    loading={updatingId === `${org.id}-has_app_gestion`}
                    onToggle={() => toggleApp(org.id, 'has_app_gestion', !!org.subscription?.has_app_gestion)}
                  />
                  <AppControl 
                    label="App Vidrio" 
                    icon={<Globe size={20} />}
                    isActive={!!org.subscription?.has_app_vidrio} 
                    loading={updatingId === `${org.id}-has_app_vidrio`}
                    onToggle={() => toggleApp(org.id, 'has_app_vidrio', !!org.subscription?.has_app_vidrio)}
                  />
                  <AppControl 
                    label="App Aluminio" 
                    icon={<Building2 size={20} />}
                    isActive={!!org.subscription?.has_app_aluminio} 
                    loading={updatingId === `${org.id}-has_app_aluminio`}
                    onToggle={() => toggleApp(org.id, 'has_app_aluminio', !!org.subscription?.has_app_aluminio)}
                  />
                  <AppControl 
                    label="App Medidor" 
                    icon={<Ruler size={20} />}
                    isActive={!!org.subscription?.has_app_medidor} 
                    loading={updatingId === `${org.id}-has_app_medidor`}
                    onToggle={() => toggleApp(org.id, 'has_app_medidor', !!org.subscription?.has_app_medidor)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {userModalOrg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-12 relative animate-in zoom-in-95 duration-200 border border-slate-200">
            <button onClick={() => setUserModalOrg(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
              <X size={24} />
            </button>
            
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
                <Key size={36} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Acceso Empresa</h3>
              <p className="text-slate-500 text-[10px] font-black mt-2 uppercase tracking-[0.2em]">{userModalOrg.name}</p>
            </div>

            {userStatus ? (
              <div className={`p-8 rounded-[2.5rem] text-center space-y-4 animate-in fade-in zoom-in ${userStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                {userStatus.type === 'success' ? <Check className="mx-auto" size={44} /> : <ShieldAlert className="mx-auto" size={44} />}
                <p className="text-xs font-black uppercase tracking-widest leading-relaxed">{userStatus.msg}</p>
                {userStatus.type === 'error' && (
                  <button onClick={() => setUserStatus(null)} className="mt-4 text-[10px] font-black underline uppercase">Reintentar</button>
                )}
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-5">Email Corporativo</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required 
                      type="email" 
                      placeholder="admin@empresa.com"
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-full text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-5">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-full text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                      value={newUser.password}
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isCreatingUser}
                  className="w-full py-6 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isCreatingUser ? <Loader2 className="animate-spin" size={18} /> : "Vincular Usuario y Generar Perfil"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AppControl = ({ label, icon, isActive, loading, onToggle }: { label: string, icon: React.ReactNode, isActive: boolean, loading: boolean, onToggle: () => void }) => (
  <div className={`p-6 rounded-[2.2rem] border transition-all flex flex-col items-center gap-4 ${isActive ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
    <div className={`p-3 rounded-2xl ${isActive ? 'bg-blue-600 text-white' : 'bg-white text-slate-300'}`}>
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{label}</span>
    <button onClick={onToggle} disabled={loading} className="transition-transform active:scale-90">
      {loading ? <Loader2 size={24} className="animate-spin text-blue-600" /> : (
        isActive ? <ToggleRight size={40} className="text-blue-600" /> : <ToggleLeft size={40} className="text-slate-300" />
      )}
    </button>
  </div>
);

export default SaaSAdmin;
