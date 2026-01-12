
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  session: any;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isGodMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const MASTER_EMAIL = 'pabloviex@live.com.ar';
  const isGodMode = session?.user?.email?.toLowerCase().trim() === MASTER_EMAIL;

  const fetchProfile = async (userId: string, email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    
    // BYPASS MAESTRO: Si es Pablo, ignorar base de datos y dar poder total
    if (cleanEmail === MASTER_EMAIL) {
      setProfile({
        id: userId,
        email: cleanEmail,
        role: 'super_admin',
        organization_id: 'master-org',
        organization: {
          id: 'master-org',
          name: 'ARISTA STUDIO CENTRAL',
          slug: 'master',
          is_active: true,
          subscription: {
            organization_id: 'master-org',
            has_gestor: true,
            has_medidor: true,
            has_app_gestion: true,
            has_app_vidrio: true,
            has_app_aluminio: true,
            has_app_medidor: true
          }
        }
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          role,
          organization_id,
          organization:organizations (
            id,
            name,
            slug,
            is_active,
            subscription:subscriptions (
              has_gestor,
              has_medidor,
              has_app_gestion,
              has_app_vidrio,
              has_app_aluminio,
              has_app_medidor
            )
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        setProfile({ id: userId, email: cleanEmail, role: 'admin', organization_id: null });
      } else {
        setProfile(data as any);
      }
    } catch (err) {
      console.error("Error en fetchProfile:", err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession) {
        fetchProfile(currentSession.user.id, currentSession.user.email || '');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        fetchProfile(newSession.user.id, newSession.user.email || '');
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ 
      email: email.toLowerCase().trim(), 
      password 
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, login, logout, isGodMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};
