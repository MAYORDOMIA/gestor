
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RefreshCw, ShieldAlert, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, module }) => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  // BYPASS TOTAL PARA PABLO: Ignora cualquier restricción de licencia o estado de org
  const MASTER_EMAIL = 'pabloviex@live.com.ar';
  if (session?.user?.email?.toLowerCase().trim() === MASTER_EMAIL) return <>{children}</>;

  if (profile?.organization && !profile.organization.is_active) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-rose-200 shadow-sm mx-auto max-w-4xl px-8">
        <div className="bg-rose-50 p-6 rounded-[2.5rem] mb-6">
          <Lock size={48} className="text-rose-600" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Acceso Bloqueado</h3>
        <p className="text-slate-500 font-bold mt-2 max-w-sm">
          Esta organización no tiene una suscripción activa. Contacte con el administrador.
        </p>
      </div>
    );
  }

  const sub = profile?.organization?.subscription;
  
  // Validación de licencia para usuarios normales
  if (!sub?.has_app_gestion) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-slate-200 shadow-sm mx-auto max-w-4xl px-8">
        <div className="bg-blue-50 p-6 rounded-[2.5rem] mb-6 text-blue-600">
          <ShieldAlert size={48} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Licencia de Gestión no activa</h3>
        <p className="text-slate-500 font-bold mt-2 max-w-sm">
          Su cuenta no tiene permisos para acceder a este módulo. Verifique su plan Arista Studio.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
