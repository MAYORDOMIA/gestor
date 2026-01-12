
import { createClient } from '@supabase/supabase-js';

// URL y Key de Supabase - Estructura Formateada
const supabaseUrl = 'https://yyiuwavyvgxlsrgihbkr.supabase.co';
const supabaseAnonKey = 'sb_publishable_cgMlbrJmU_39KEVDPghKbA_WTSbEJon';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
