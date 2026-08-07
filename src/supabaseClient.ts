import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: any;

function createMockSupabase() {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Mock mode' } }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          order: () => Promise.resolve({ data: [], error: null })
        }),
        order: () => Promise.resolve({ data: [], error: null })
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Mock auth mode' } }),
      signOut: () => Promise.resolve({ error: null })
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        remove: () => Promise.resolve({ data: null, error: null })
      })
    }
  };
}

try {
  // If keys are missing or contain placeholder values, fallback to mock instead of crashing
  if (
    supabaseUrl && 
    supabaseUrl.startsWith('https://') && 
    !supabaseUrl.includes('placeholder-url')
  ) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn('Supabase URL no configurada. Ejecutando en modo de demostración local.');
    supabaseInstance = createMockSupabase();
  }
} catch (e) {
  console.warn('Falla en la inicialización de Supabase, usando cliente simulado:', e);
  supabaseInstance = createMockSupabase();
}

export const supabase = supabaseInstance;
