import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      <div className="watercolor-texture" />
      
      {/* Botanical ornaments in corners for consistency */}
      <img
        src="/watercolor_top_left.jpg"
        alt=""
        className="absolute top-0 left-0 w-36 sm:w-48 opacity-60 mix-blend-multiply pointer-events-none select-none"
      />
      <img
        src="/watercolor_top_left.jpg"
        alt=""
        className="absolute bottom-0 right-0 w-36 sm:w-48 opacity-60 mix-blend-multiply pointer-events-none select-none scale-x-[-1] scale-y-[-1]"
      />

      <div className="w-full max-w-md bg-white border border-sage-200/80 rounded-2xl p-8 shadow-sm relative z-10">
        <div className="text-center mb-8">
          <span className="font-serif text-[#2C3531] text-[10px] tracking-[0.3em] uppercase font-bold">
            PANEL PRIVADO
          </span>
          <h2 className="font-serif text-2xl text-sage-800 font-medium tracking-wide mt-2">
            Iniciar Sesión
          </h2>
          <p className="font-sans text-xs text-sage-500 font-light mt-1">
            Exclusivo para administradores de la boda
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs flex items-center gap-2 font-sans font-medium animate-slide-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-[10px] font-bold text-sage-600 tracking-wider uppercase">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
              <input
                type="email"
                id="email"
                required
                placeholder="ejemplo@correo.com"
                className="w-full border border-sage-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-sans bg-white focus:outline-none focus:border-sage-400"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-[10px] font-bold text-sage-600 tracking-wider uppercase">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
              <input
                type="password"
                id="password"
                required
                placeholder="••••••••"
                className="w-full border border-sage-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-sans bg-white focus:outline-none focus:border-sage-400"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-sage-500 hover:bg-sage-600 text-white rounded-full text-xs font-sans tracking-widest uppercase transition-colors cursor-pointer mt-4 flex items-center justify-center font-medium shadow-sm hover:shadow"
            id="btn-login-submit"
          >
            {loading ? 'INGRESANDO...' : 'INGRESAR'}
          </button>
        </form>
      </div>
    </div>
  );
}
