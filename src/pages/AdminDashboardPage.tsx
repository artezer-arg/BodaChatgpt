import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useSettings } from '../hooks/useSettings';
import { 
  Settings, Users, Music as MusicIcon, Camera, 
  LogOut, Save, Search, Download, Trash2, CheckCircle, 
  FileAudio, ExternalLink, ArrowLeft
} from 'lucide-react';
import { Toast } from '../components/Base/Toast';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { settings: initialSettings, refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'settings' | 'rsvps' | 'songs' | 'photos'>('settings');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auth check
  const [checkingAuth, setCheckingAuth] = useState(true);
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin');
      } else {
        setCheckingAuth(false);
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  // --- TAB 1: SETTINGS STATES & HANDLERS ---
  const [formSettings, setFormSettings] = useState({
    brideName: '',
    groomName: '',
    title: '',
    introText: '',
    weddingDate: '',
    weddingTime: '',
    locationName: '',
    locationAddress: '',
    mapsUrl: '',
    bankAlias: '',
    bankCbu: '',
    bankOwner: '',
    bankName: '',
    instagramUrl: '',
    googleDriveUrl: '',
    phrase: '',
    finalMessage: '',
    musicUrl: '',
    dressCodeTitle: '',
    dressCodeSubtitle: '',
    rsvpDeadlineDate: '',
    rsvpDeadlineTime: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [musicUploading, setMusicUploading] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setFormSettings({
        brideName: initialSettings.bride_name,
        groomName: initialSettings.groom_name,
        title: initialSettings.title,
        introText: initialSettings.intro_text,
        weddingDate: initialSettings.wedding_date,
        weddingTime: initialSettings.wedding_time.slice(0, 5),
        locationName: initialSettings.location_name,
        locationAddress: initialSettings.location_address,
        mapsUrl: initialSettings.maps_url,
        bankAlias: initialSettings.bank_alias,
        bankCbu: initialSettings.bank_cbu || '',
        bankOwner: initialSettings.bank_owner || '',
        bankName: initialSettings.bank_name || '',
        instagramUrl: initialSettings.instagram_url,
        googleDriveUrl: initialSettings.google_drive_url || 'https://drive.google.com',
        phrase: initialSettings.phrase,
        finalMessage: initialSettings.final_message,
        musicUrl: initialSettings.music_url || '',
        dressCodeTitle: initialSettings.dress_code_title,
        dressCodeSubtitle: initialSettings.dress_code_subtitle,
        rsvpDeadlineDate: initialSettings.rsvp_deadline_date || '2026-10-10',
        rsvpDeadlineTime: initialSettings.rsvp_deadline_time ? initialSettings.rsvp_deadline_time.slice(0, 5) : '23:59'
      });
    }
  }, [initialSettings]);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          bride_name: formSettings.brideName,
          groom_name: formSettings.groomName,
          title: formSettings.title,
          intro_text: formSettings.introText,
          wedding_date: formSettings.weddingDate,
          wedding_time: `${formSettings.weddingTime}:00`,
          location_name: formSettings.locationName,
          location_address: formSettings.locationAddress,
          maps_url: formSettings.mapsUrl,
          bank_alias: formSettings.bankAlias,
          bank_cbu: formSettings.bankCbu,
          bank_owner: formSettings.bankOwner,
          bank_name: formSettings.bankName,
          instagram_url: formSettings.instagramUrl,
          google_drive_url: formSettings.googleDriveUrl,
          phrase: formSettings.phrase,
          final_message: formSettings.finalMessage,
          music_url: formSettings.musicUrl || null,
          dress_code_title: formSettings.dressCodeTitle,
          dress_code_subtitle: formSettings.dressCodeSubtitle,
          rsvp_deadline_date: formSettings.rsvpDeadlineDate,
          rsvp_deadline_time: `${formSettings.rsvpDeadlineTime}:00`
        })
        .eq('id', 1);

      if (error) throw error;
      setToastMessage('Configuración guardada correctamente.');
      refreshSettings();
    } catch (err: any) {
      console.error(err);
      alert(`Error al guardar configuración: ${err.message || err}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleMusicFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMusicUploading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `music_${Date.now()}.${fileExt}`;
        const filePath = `background_songs/${fileName}`;

        // 1. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('music')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: publicUrlData } = supabase.storage
          .from('music')
          .getPublicUrl(filePath);

        const musicUrl = publicUrlData.publicUrl;

        // Update form settings and save to db immediately or let the user click save
        setFormSettings(prev => ({ ...prev, musicUrl }));
        setToastMessage('Canción cargada con éxito. Guardá los cambios.');
      } catch (err: any) {
        console.error(err);
        alert(`Error al subir música: ${err.message || err}`);
      } finally {
        setMusicUploading(false);
      }
    }
  };

  // --- TAB 2: RSVPs STATES & HANDLERS ---
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [searchRsvp, setSearchRsvp] = useState('');
  const [filterAttending, setFilterAttending] = useState<'all' | 'yes' | 'no'>('all');
  const [loadingRsvps, setLoadingRsvps] = useState(false);

  const fetchRsvps = async () => {
    setLoadingRsvps(true);
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRsvps(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingRsvps(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'rsvps') {
      fetchRsvps();
    }
  }, [activeTab]);

  const filteredRsvps = rsvps.filter(r => {
    const fullName = `${r.first_name} ${r.last_name} ${r.dni}`.toLowerCase();
    const matchesSearch = fullName.includes(searchRsvp.toLowerCase());
    
    if (filterAttending === 'yes') {
      return matchesSearch && r.attending === true;
    }
    if (filterAttending === 'no') {
      return matchesSearch && r.attending === false;
    }
    return matchesSearch;
  });

  const exportRsvpsToCsv = () => {
    const headers = ['Nombre', 'Apellido', 'DNI', 'Telefono', 'Asiste', 'Acompaniantes', 'Restriccion Alimentaria', 'Comentarios', 'Fecha'];
    
    const rows = filteredRsvps.map(r => [
      r.first_name,
      r.last_name,
      r.dni,
      r.phone || '',
      r.attending ? 'SI' : 'NO',
      r.guest_count,
      r.dietary_restrictions || 'Ninguna',
      r.comments || '',
      new Date(r.created_at).toLocaleDateString('es-AR')
    ]);

    // UTF-8 BOM encoding for special characters in Excel
    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'confirmaciones_boda.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics helper
  const totalRsvpCount = rsvps.length;
  const attendingCount = rsvps.filter(r => r.attending === true).length;
  const notAttendingCount = rsvps.filter(r => r.attending === false).length;
  const totalGuests = rsvps.reduce((acc, r) => acc + (r.attending ? r.guest_count : 0), 0);

  // --- TAB 3: SUGGESTED SONGS STATES & HANDLERS ---
  const [songs, setSongs] = useState<any[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);

  const fetchSongs = async () => {
    setLoadingSongs(true);
    try {
      const { data, error } = await supabase
        .from('suggested_songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSongs(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingSongs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'songs') {
      fetchSongs();
    }
  }, [activeTab]);

  const handleDeleteSong = async (id: string) => {
    if (!window.confirm('¿Seguro que querés eliminar esta sugerencia?')) return;
    try {
      const { error } = await supabase
        .from('suggested_songs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setToastMessage('Canción eliminada');
      fetchSongs();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  // --- TAB 4: PHOTOS STATES & HANDLERS ---
  const [photos, setPhotos] = useState<any[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const fetchPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'photos') {
      fetchPhotos();
    }
  }, [activeTab]);

  const handleApprovePhoto = async (id: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;
      setToastMessage('Foto aprobada');
      fetchPhotos();
    } catch (err: any) {
      alert(`Error al aprobar: ${err.message}`);
    }
  };

  const handleDeletePhoto = async (id: string, filePath: string) => {
    if (!window.confirm('¿Seguro que querés eliminar permanentemente esta foto?')) return;
    try {
      // 1. Delete from storage bucket
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([filePath]);

      if (storageError) {
        console.warn('Advertencia al borrar del storage:', storageError.message);
      }

      // 2. Delete from db
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      setToastMessage('Foto eliminada correctamente');
      fetchPhotos();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  if (checkingAuth) {
    return (
      <div className="fixed inset-0 bg-[#FAF9F6] flex flex-col items-center justify-center z-50">
        <div className="w-10 h-10 border-2 border-sage-200 border-t-sage-500 rounded-full animate-spin mb-3" />
        <span className="text-xs text-sage-600 font-sans tracking-widest uppercase">
          Verificando credenciales...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C3531] flex flex-col">
      {/* Admin Navbar */}
      <header className="bg-white border-b border-sage-200/80 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30 select-none">
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="text-sage-500 hover:text-sage-700 flex items-center gap-1 text-xs font-semibold tracking-wider uppercase font-sans border border-sage-200 rounded-lg px-2.5 py-1 bg-sage-50/50">
            <ArrowLeft className="w-3.5 h-3.5" /> Ver Invitación
          </a>
          <div className="h-4 w-[1px] bg-sage-200 hidden sm:block" />
          <h2 className="font-serif text-lg text-sage-800 font-medium tracking-wide hidden sm:block">
            Panel de Administración — Pamela & Nestor
          </h2>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-100 hover:border-red-200 rounded-lg px-3 py-1.5 bg-red-50/20 font-sans tracking-wide cursor-pointer transition-colors"
          id="btn-logout"
        >
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6">
        
        {/* Navigation Sidebar Tabs */}
        <aside className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-1 select-none overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-sans font-semibold tracking-wider uppercase w-full cursor-pointer transition-all ${activeTab === 'settings' ? 'bg-sage-500 text-white shadow-sm' : 'bg-white text-sage-600 hover:bg-sage-50 border border-sage-200/50'}`}
          >
            <Settings className="w-4 h-4" /> Configuración Boda
          </button>
          
          <button
            onClick={() => setActiveTab('rsvps')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-sans font-semibold tracking-wider uppercase w-full cursor-pointer transition-all ${activeTab === 'rsvps' ? 'bg-sage-500 text-white shadow-sm' : 'bg-white text-sage-600 hover:bg-sage-50 border border-sage-200/50'}`}
          >
            <Users className="w-4 h-4" /> Invitados ({totalRsvpCount})
          </button>

          <button
            onClick={() => setActiveTab('songs')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-sans font-semibold tracking-wider uppercase w-full cursor-pointer transition-all ${activeTab === 'songs' ? 'bg-sage-500 text-white shadow-sm' : 'bg-white text-sage-600 hover:bg-sage-50 border border-sage-200/50'}`}
          >
            <MusicIcon className="w-4 h-4" /> Canciones
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-sans font-semibold tracking-wider uppercase w-full cursor-pointer transition-all ${activeTab === 'photos' ? 'bg-sage-500 text-white shadow-sm' : 'bg-white text-sage-600 hover:bg-sage-50 border border-sage-200/50'}`}
          >
            <Camera className="w-4 h-4" /> Galería Fotos
          </button>
        </aside>

        {/* Content panel */}
        <main className="flex-1 min-w-0">
          
          {/* TAB 1: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-sage-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg text-sage-800 font-medium tracking-wide mb-6 border-b border-sage-100 pb-3 flex items-center gap-2">
                <Settings className="w-5 h-5 text-sage-500" /> Configuración de la Boda
              </h3>

              <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-6">
                
                {/* Nombres Novios */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-sage-600 uppercase">Nombre Novia</label>
                    <input 
                      type="text" 
                      required 
                      className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                      value={formSettings.brideName} 
                      onChange={e => setFormSettings(prev => ({ ...prev, brideName: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-sage-600 uppercase">Nombre Novio</label>
                    <input 
                      type="text" 
                      required 
                      className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                      value={formSettings.groomName} 
                      onChange={e => setFormSettings(prev => ({ ...prev, groomName: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Fecha y hora */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-sage-600 uppercase">Fecha del Evento</label>
                    <input 
                      type="date" 
                      required 
                      className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                      value={formSettings.weddingDate} 
                      onChange={e => setFormSettings(prev => ({ ...prev, weddingDate: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-sage-600 uppercase">Hora del Evento</label>
                    <input 
                      type="time" 
                      required 
                      className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                      value={formSettings.weddingTime} 
                      onChange={e => setFormSettings(prev => ({ ...prev, weddingTime: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Fecha y hora límite para RSVP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-sage-600 uppercase">Fecha Límite Confirmación (RSVP)</label>
                    <input 
                      type="date" 
                      required 
                      className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                      value={formSettings.rsvpDeadlineDate} 
                      onChange={e => setFormSettings(prev => ({ ...prev, rsvpDeadlineDate: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-sage-600 uppercase">Hora Límite Confirmación (RSVP)</label>
                    <input 
                      type="time" 
                      required 
                      className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                      value={formSettings.rsvpDeadlineTime} 
                      onChange={e => setFormSettings(prev => ({ ...prev, rsvpDeadlineTime: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Lugar y dirección */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-sage-600 uppercase">Nombre del Salón</label>
                    <input 
                      type="text" 
                      required 
                      className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                      value={formSettings.locationName} 
                      onChange={e => setFormSettings(prev => ({ ...prev, locationName: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-sage-600 uppercase">Dirección</label>
                    <input 
                      type="text" 
                      required 
                      className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                      value={formSettings.locationAddress} 
                      onChange={e => setFormSettings(prev => ({ ...prev, locationAddress: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Enlaces Google Maps, Instagram */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-sage-600 uppercase">Enlace de Ubicación (Google Maps)</label>
                    <input 
                      type="url" 
                      required 
                      className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                      value={formSettings.mapsUrl} 
                      onChange={e => setFormSettings(prev => ({ ...prev, mapsUrl: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-sage-600 uppercase">Enlace de Instagram</label>
                    <input 
                      type="url" 
                      required 
                      className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                      value={formSettings.instagramUrl} 
                      onChange={e => setFormSettings(prev => ({ ...prev, instagramUrl: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-sage-600 uppercase">Carpeta de Google Drive (Subir Fotos)</label>
                    <input 
                      type="url" 
                      required 
                      className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                      value={formSettings.googleDriveUrl} 
                      onChange={e => setFormSettings(prev => ({ ...prev, googleDriveUrl: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Portada, frase e intro */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-sage-600 uppercase">Título de Portada</label>
                    <input 
                      type="text" 
                      required 
                      className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                      value={formSettings.title} 
                      onChange={e => setFormSettings(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-sage-600 uppercase">Texto de Introducción (Separar con salto de línea si es necesario)</label>
                    <textarea 
                      required 
                      rows={2}
                      className="border border-sage-200 rounded-xl px-4 py-2 text-xs font-sans resize-none"
                      value={formSettings.introText} 
                      onChange={e => setFormSettings(prev => ({ ...prev, introText: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-sage-600 uppercase">Frase Romántica</label>
                    <textarea 
                      required 
                      rows={2}
                      className="border border-sage-200 rounded-xl px-4 py-2 text-xs font-sans resize-none"
                      value={formSettings.phrase} 
                      onChange={e => setFormSettings(prev => ({ ...prev, phrase: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-sage-600 uppercase">Mensaje Final de Cierre</label>
                    <textarea 
                      required 
                      rows={2}
                      className="border border-sage-200 rounded-xl px-4 py-2 text-xs font-sans resize-none"
                      value={formSettings.finalMessage} 
                      onChange={e => setFormSettings(prev => ({ ...prev, finalMessage: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Datos de Transferencia Bancaria */}
                <div className="border border-sage-100 rounded-xl p-4 bg-sage-50/10 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-[#2C3531] flex items-center gap-1.5">
                    💰 Datos de Transferencia (Regalos)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-sage-600 uppercase">Nombre del Banco</label>
                      <input 
                        type="text" 
                        required 
                        className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                        value={formSettings.bankName} 
                        onChange={e => setFormSettings(prev => ({ ...prev, bankName: e.target.value }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-sage-600 uppercase">Titular de la Cuenta</label>
                      <input 
                        type="text" 
                        required 
                        className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                        value={formSettings.bankOwner} 
                        onChange={e => setFormSettings(prev => ({ ...prev, bankOwner: e.target.value }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-sage-600 uppercase">CBU / CVU</label>
                      <input 
                        type="text" 
                        required 
                        className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                        value={formSettings.bankCbu} 
                        onChange={e => setFormSettings(prev => ({ ...prev, bankCbu: e.target.value }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-sage-600 uppercase">Alias</label>
                      <input 
                        type="text" 
                        required 
                        className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                        value={formSettings.bankAlias} 
                        onChange={e => setFormSettings(prev => ({ ...prev, bankAlias: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Dress code */}
                <div className="border border-sage-100 rounded-xl p-4 bg-sage-50/10 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-[#2C3531] flex items-center gap-1.5">
                    👔 Vestimenta (Dress Code)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-sage-600 uppercase">Dress Code (Título)</label>
                      <input 
                        type="text" 
                        required 
                        className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                        value={formSettings.dressCodeTitle} 
                        onChange={e => setFormSettings(prev => ({ ...prev, dressCodeTitle: e.target.value }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-sage-600 uppercase">Dress Code (Subtítulo)</label>
                      <input 
                        type="text" 
                        required 
                        className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans"
                        value={formSettings.dressCodeSubtitle} 
                        onChange={e => setFormSettings(prev => ({ ...prev, dressCodeSubtitle: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Música Ambiental de Fondo */}
                <div className="border border-sage-100 rounded-xl p-4 bg-sage-50/30 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-[#2C3531] flex items-center gap-1.5">
                    <FileAudio className="w-4 h-4 text-sage-500" /> Cargar Música de Fondo
                  </h4>
                  
                  <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/60 rounded-lg p-2.5 leading-relaxed">
                    ⚠️ <strong>Almacenamiento en Supabase:</strong> Para poder subir archivos MP3 directamente, debés crear un contenedor de almacenamiento público en Supabase. Ve a tu consola de <strong>Supabase &gt; Storage &gt; New Bucket</strong>, llámalo <strong>music</strong> y asegúrate de activar la casilla de <strong>Public Bucket</strong>. Si preferís no hacerlo, podés simplemente pegar cualquier enlace directo a un archivo MP3 de internet en el campo "URL de Música Actual" de abajo.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-sage-500 uppercase">Cargar archivo de audio (.MP3)</label>
                      <input 
                        type="file" 
                        accept="audio/mp3, audio/mpeg"
                        onChange={handleMusicFileChange}
                        disabled={musicUploading}
                        className="text-xs text-sage-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-semibold file:bg-sage-100 file:text-sage-700 hover:file:bg-sage-200 cursor-pointer file:cursor-pointer"
                      />
                      {musicUploading && <span className="text-[10px] text-sage-500 animate-pulse mt-1">Subiendo audio...</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-sage-500 uppercase">URL de Música Actual</label>
                      <input 
                        type="text" 
                        placeholder="Sin música cargada"
                        className="border border-sage-200 rounded-xl px-4 py-2.5 text-xs font-sans bg-white"
                        value={formSettings.musicUrl} 
                        onChange={e => setFormSettings(prev => ({ ...prev, musicUrl: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings || musicUploading}
                  className="h-11 bg-sage-500 hover:bg-sage-600 text-white rounded-full text-xs font-sans tracking-widest uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 font-medium self-end px-6 shadow-sm hover:shadow"
                >
                  <Save className="w-4 h-4" />
                  {savingSettings ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                </button>

              </form>
            </div>
          )}

          {/* TAB 2: RSVPs */}
          {activeTab === 'rsvps' && (
            <div className="bg-white border border-sage-200/80 rounded-2xl p-6 shadow-sm">
              
              {/* RSVP Metrics Widgets */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-sage-50/50 border border-sage-100 p-4 rounded-xl text-center">
                  <span className="block text-[10px] font-bold text-sage-500 uppercase">Respuestas</span>
                  <span className="text-xl font-serif text-[#2C3531] font-semibold mt-1 block">{totalRsvpCount}</span>
                </div>
                <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl text-center">
                  <span className="block text-[10px] font-bold text-green-600 uppercase">Asisten (Titulares)</span>
                  <span className="text-xl font-serif text-green-700 font-semibold mt-1 block">{attendingCount}</span>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl text-center">
                  <span className="block text-[10px] font-bold text-emerald-600 uppercase">Total Invitados</span>
                  <span className="text-xl font-serif text-emerald-700 font-semibold mt-1 block">{totalGuests}</span>
                </div>
                <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl text-center">
                  <span className="block text-[10px] font-bold text-red-500 uppercase">No Asisten</span>
                  <span className="text-xl font-serif text-red-700 font-semibold mt-1 block">{notAttendingCount}</span>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 select-none">
                <h3 className="font-serif text-lg text-sage-800 font-medium tracking-wide flex items-center gap-2">
                  <Users className="w-5 h-5 text-sage-500" /> Lista de Confirmaciones
                </h3>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 sm:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre o DNI..." 
                      className="border border-sage-200 rounded-full pl-9 pr-4 py-2 text-xs font-sans w-full"
                      value={searchRsvp}
                      onChange={e => setSearchRsvp(e.target.value)}
                    />
                  </div>

                  {/* Filter Select */}
                  <select
                    className="border border-sage-200 rounded-full px-3 py-2 text-xs font-sans bg-white focus:outline-none"
                    value={filterAttending}
                    onChange={e => setFilterAttending(e.target.value as any)}
                  >
                    <option value="all">Todos</option>
                    <option value="yes">Asisten</option>
                    <option value="no">No Asisten</option>
                  </select>

                  {/* Export CSV */}
                  <button
                    onClick={exportRsvpsToCsv}
                    className="bg-sage-100 hover:bg-sage-200 text-sage-700 border border-sage-200 rounded-full px-3 py-2 text-xs font-sans flex items-center gap-1.5 cursor-pointer font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" /> EXPORTAR CSV
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-sage-100 rounded-xl">
                {loadingRsvps ? (
                  <div className="py-12 text-center text-xs text-sage-500 font-sans">
                    Cargando confirmaciones...
                  </div>
                ) : filteredRsvps.length === 0 ? (
                  <div className="py-12 text-center text-xs text-sage-500 font-sans">
                    No se encontraron confirmaciones de asistencia.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="bg-sage-50/50 border-b border-sage-100 text-[10px] font-bold text-sage-600 uppercase tracking-wider">
                        <th className="p-3">Invitado</th>
                        <th className="p-3">DNI</th>
                        <th className="p-3">Teléfono</th>
                        <th className="p-3">¿Asiste?</th>
                        <th className="p-3 text-center">Lugares</th>
                        <th className="p-3">Restricción Alimentaria</th>
                        <th className="p-3">Comentarios</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-100 bg-white">
                      {filteredRsvps.map((r) => (
                        <tr key={r.id} className="hover:bg-sage-50/20 text-sage-800">
                          <td className="p-3 font-semibold">{r.first_name} {r.last_name}</td>
                          <td className="p-3 font-mono">{r.dni}</td>
                          <td className="p-3">{r.phone || '-'}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${r.attending ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                              {r.attending ? 'SÍ' : 'NO'}
                            </span>
                          </td>
                          <td className="p-3 text-center font-semibold">{r.attending ? r.guest_count : 0}</td>
                          <td className="p-3">
                            {r.dietary_restrictions && r.dietary_restrictions !== 'Ninguna' ? (
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-medium">
                                {r.dietary_restrictions}
                              </span>
                            ) : (
                              <span className="text-sage-400">Ninguna</span>
                            )}
                          </td>
                          <td className="p-3 max-w-[200px] truncate text-sage-500" title={r.comments}>
                            {r.comments || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SONGS */}
          {activeTab === 'songs' && (
            <div className="bg-white border border-sage-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h3 className="font-serif text-lg text-sage-800 font-medium tracking-wide flex items-center gap-2">
                  <MusicIcon className="w-5 h-5 text-sage-500" /> Sugerencias de Música
                </h3>
              </div>

              <div className="overflow-x-auto border border-sage-100 rounded-xl">
                {loadingSongs ? (
                  <div className="py-12 text-center text-xs text-sage-500 font-sans">
                    Cargando canciones...
                  </div>
                ) : songs.length === 0 ? (
                  <div className="py-12 text-center text-xs text-sage-500 font-sans">
                    No hay sugerencias de canciones registradas.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="bg-sage-50/50 border-b border-sage-100 text-[10px] font-bold text-sage-600 uppercase tracking-wider">
                        <th className="p-3">Invitado</th>
                        <th className="p-3">Canción / Artista</th>
                        <th className="p-3">Enlace</th>
                        <th className="p-3">Comentario</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-100 bg-white">
                      {songs.map((song) => (
                        <tr key={song.id} className="hover:bg-sage-50/20 text-sage-800">
                          <td className="p-3 font-semibold">{song.suggester_name}</td>
                          <td className="p-3">
                            <span className="font-medium block text-sage-800">{song.title}</span>
                            <span className="text-sage-500 text-[10px] block">{song.artist}</span>
                          </td>
                          <td className="p-3">
                            {song.link ? (
                              <a 
                                href={song.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sage-500 hover:text-sage-700 flex items-center gap-1 hover:underline"
                              >
                                Spotify/YT <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : '-'}
                          </td>
                          <td className="p-3 text-sage-500">{song.comment || '-'}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteSong(song.id)}
                              className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer inline-flex"
                              title="Eliminar sugerencia"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PHOTOS */}
          {activeTab === 'photos' && (
            <div className="bg-white border border-sage-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h3 className="font-serif text-lg text-sage-800 font-medium tracking-wide flex items-center gap-2">
                  <Camera className="w-5 h-5 text-sage-500" /> Galería de Fotos Compartidas
                </h3>
              </div>

              {loadingPhotos ? (
                <div className="py-12 text-center text-xs text-sage-500 font-sans">
                  Cargando galería...
                </div>
              ) : photos.length === 0 ? (
                <div className="py-12 text-center text-xs text-sage-500 font-sans">
                  Aún no se subieron fotografías.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div 
                      key={photo.id} 
                      className="border border-sage-100 rounded-xl overflow-hidden bg-sage-50/50 shadow-sm relative group flex flex-col justify-between"
                    >
                      {/* Status indicator badge */}
                      <span className={`absolute top-2 left-2 z-10 text-[9px] font-bold px-2 py-0.5 rounded-full select-none ${photo.is_approved ? 'bg-green-500/90 text-white' : 'bg-amber-500/90 text-white animate-pulse'}`}>
                        {photo.is_approved ? 'APROBADA' : 'PENDIENTE'}
                      </span>

                      {/* Image Thumbnail */}
                      <a href={photo.url} target="_blank" rel="noopener noreferrer" className="block relative aspect-square overflow-hidden bg-black/5">
                        <img 
                          src={photo.url} 
                          alt="Invitado" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </a>

                      {/* Controls */}
                      <div className="p-2 bg-white border-t border-sage-100 flex items-center justify-between select-none">
                        {!photo.is_approved ? (
                          <button
                            onClick={() => handleApprovePhoto(photo.id)}
                            className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Aprobar fotografía"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                          </button>
                        ) : (
                          <span className="text-[10px] text-sage-400 font-sans italic py-1 pl-1">Aprobada</span>
                        )}

                        <button
                          onClick={() => handleDeletePhoto(photo.id, photo.file_path)}
                          className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Eliminar de forma permanente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Floating notifications */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
