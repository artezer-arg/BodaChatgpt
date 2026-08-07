import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export interface WeddingSettings {
  id: number;
  bride_name: string;
  groom_name: string;
  title: string;
  intro_text: string;
  wedding_date: string;
  wedding_time: string;
  location_name: string;
  location_address: string;
  maps_url: string;
  bank_alias: string;
  bank_cbu: string;
  bank_owner: string;
  instagram_url: string;
  phrase: string;
  final_message: string;
  music_url: string;
  dress_code_title: string;
  dress_code_subtitle: string;
  forbidden_colors: string[];
}

export const defaultSettings: WeddingSettings = {
  id: 1,
  bride_name: 'Pamela',
  groom_name: 'Nestor',
  title: 'NOS CASAMOS',
  intro_text: 'Y QUEREMOS QUE SEAS PARTE\nDE ESTE DÍA TAN ESPECIAL',
  wedding_date: '2026-10-24',
  wedding_time: '17:50',
  location_name: 'EVENTOS LAS MORAS',
  location_address: 'Mateo Blanco 369, Campana, Buenos Aires',
  maps_url: 'https://maps.app.goo.gl/A7obpbcwitPRKooK7',
  bank_alias: 'PAMEYNESTOR.BODA',
  bank_cbu: '',
  bank_owner: '',
  instagram_url: 'https://instagram.com/',
  phrase: '“Y así, sin buscarte, te elegí.\nY así, sin pensarlo, me quedé.”',
  final_message: '“Gracias por ser parte\nde nuestra historia”',
  music_url: '',
  dress_code_title: 'Elegante',
  dress_code_subtitle: 'Por favor, evitar los colores bordo y blanco.',
  forbidden_colors: ['#800020', '#FFFFFF']
};

export function useSettings() {
  const [settings, setSettings] = useState<WeddingSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        // Log error but fallback silently to defaults
        console.warn('Falla al cargar configuraciones de Supabase. Usando valores por defecto:', error.message);
        setSettings(defaultSettings);
      } else if (data) {
        let colors: string[] = defaultSettings.forbidden_colors;
        if (data.forbidden_colors) {
          try {
            colors = typeof data.forbidden_colors === 'string' 
              ? JSON.parse(data.forbidden_colors) 
              : data.forbidden_colors;
          } catch (e) {
            console.error('Error parsing forbidden colors JSON:', e);
          }
        }
        setSettings({
          ...data,
          forbidden_colors: colors
        });
      }
    } catch (err: any) {
      console.warn('Excepción al cargar configuraciones:', err.message);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, refreshSettings: fetchSettings };
}
