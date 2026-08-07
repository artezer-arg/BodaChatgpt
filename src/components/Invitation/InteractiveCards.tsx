import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Modal } from '../Base/Modal';
import { Toast } from '../Base/Toast';

interface InteractiveCardsProps {
  bankAlias: string;
  instagramUrl: string;
  weddingDate: string;
  weddingTime: string;
  locationName: string;
  locationAddress: string;
  rsvpDeadlineDate: string;
  rsvpDeadlineTime: string;
}

export function InteractiveCards({ 
  bankAlias, 
  instagramUrl, 
  weddingDate, 
  weddingTime, 
  locationName, 
  locationAddress,
  rsvpDeadlineDate,
  rsvpDeadlineTime
}: InteractiveCardsProps) {
  // Modal states
  const [activeModal, setActiveModal] = useState<'rsvp' | 'song' | 'photos' | 'calendar' | null>(null);
  
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // RSVP Floating Countdown State
  const [rsvpCountdown, setRsvpCountdown] = useState<string>('');

  useEffect(() => {
    const cleanTime = rsvpDeadlineTime.slice(0, 5);
    const targetIso = `${rsvpDeadlineDate}T${cleanTime}:00-03:00`;
    const targetTimestamp = new Date(targetIso).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetTimestamp - now;

      if (isNaN(targetTimestamp) || distance < 0) {
        setRsvpCountdown('Plazo de confirmación finalizado');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setRsvpCountdown(`Faltan ${days}d ${hours}h ${minutes}m ${seconds}s para confirmar`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [rsvpDeadlineDate, rsvpDeadlineTime]);

  // Card 1: Copy Alias State
  const [copied, setCopied] = useState(false);

  // Card 2: Photos Upload States
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Card 3: Suggested Song Form States
  const [songForm, setSongForm] = useState({
    suggesterName: '',
    title: '',
    artist: '',
    link: '',
    comment: ''
  });
  const [songLoading, setSongLoading] = useState(false);
  const [songSuccess, setSongSuccess] = useState(false);

  // Card 5: RSVP Form States
  const [rsvpForm, setRsvpForm] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    attending: 'yes', // 'yes' | 'no'
    guestCount: 1,
    dietary: 'Ninguna',
    dietaryDetail: '',
    comments: ''
  });
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  // Actions
  const handleCopyAlias = () => {
    navigator.clipboard.writeText(bankAlias);
    setCopied(true);
    setToastMessage('Alias copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  // Calendar Helpers
  const handleDownloadIcs = () => {
    try {
      const cleanTime = weddingTime.slice(0, 5);
      const targetIso = `${weddingDate}T${cleanTime}:00-03:00`;
      const startDateObj = new Date(targetIso);
      if (isNaN(startDateObj.getTime())) return;
      const endDateObj = new Date(startDateObj.getTime() + 6 * 60 * 60 * 1000); // 6 hours event

      const formatDateIcs = (d: Date) => {
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const startIcs = formatDateIcs(startDateObj);
      const endIcs = formatDateIcs(endDateObj);

      const icsString = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Antigravity//NONSGML Wedding Invite//EN',
        'BEGIN:VEVENT',
        `SUMMARY:Casamiento de Pamela & Nestor`,
        `DTSTART:${startIcs}`,
        `DTEND:${endIcs}`,
        `LOCATION:${locationName} - ${locationAddress}`,
        'DESCRIPTION:¡Nos casamos! Queremos que seas parte de este día tan especial.',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'boda_pamela_y_nestor.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToastMessage('Calendario descargado');
      setActiveModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getGoogleCalendarUrl = () => {
    try {
      const cleanTime = weddingTime.slice(0, 5);
      const targetIso = `${weddingDate}T${cleanTime}:00-03:00`;
      const startDateObj = new Date(targetIso);
      if (isNaN(startDateObj.getTime())) return '';
      const endDateObj = new Date(startDateObj.getTime() + 6 * 60 * 60 * 1000);

      const formatDateGoogle = (d: Date) => {
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const start = formatDateGoogle(startDateObj);
      const end = formatDateGoogle(endDateObj);

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Casamiento de Pamela & Nestor")}&dates=${start}/${end}&details=${encodeURIComponent("¡Nos casamos! Queremos que seas parte de este día tan especial.")}&location=${encodeURIComponent(`${locationName}, ${locationAddress}`)}`;
    } catch (e) {
      return '';
    }
  };

  // Photos Actions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles: File[] = [];
      const invalidExtensions: string[] = [];

      filesArray.forEach(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext && ['jpg', 'jpeg', 'png', 'heic'].includes(ext)) {
          validFiles.push(file);
        } else {
          invalidExtensions.push(file.name);
        }
      });

      if (invalidExtensions.length > 0) {
        setPhotoError(`Formato no permitido: ${invalidExtensions.join(', ')}. Solo se permite JPG, JPEG, PNG y HEIC.`);
      } else {
        setPhotoError(null);
      }

      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleUploadPhotos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setPhotoError('Por favor selecciona al menos una fotografía.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setPhotoError(null);

    let uploadedCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `user_uploads/${fileName}`;

        // 1. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: publicUrlData } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);

        const url = publicUrlData.publicUrl;

        // 3. Insert in Database
        const { error: dbError } = await supabase
          .from('photos')
          .insert({
            url,
            file_path: filePath,
            is_approved: false
          });

        if (dbError) throw dbError;

        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / selectedFiles.length) * 100));
      } catch (err: any) {
        console.error(err);
        setPhotoError(`Error subiendo la imagen "${file.name}": ${err.message || err}`);
        setUploading(false);
        return;
      }
    }

    setUploading(false);
    setSelectedFiles([]);
    setToastMessage('Fotos subidas con éxito. Pendientes de aprobación.');
    setActiveModal(null);
  };

  const removeSelectedFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Song Actions
  const handleSongSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songForm.suggesterName || !songForm.title || !songForm.artist) {
      return;
    }

    setSongLoading(true);
    try {
      const { error } = await supabase
        .from('suggested_songs')
        .insert({
          suggester_name: songForm.suggesterName,
          title: songForm.title,
          artist: songForm.artist,
          link: songForm.link || null,
          comment: songForm.comment || null
        });

      if (error) throw error;

      setSongSuccess(true);
      setSongForm({ suggesterName: '', title: '', artist: '', link: '', comment: '' });
      setTimeout(() => {
        setSongSuccess(false);
        setActiveModal(null);
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setToastMessage('Error al guardar la sugerencia');
    } finally {
      setSongLoading(false);
    }
  };

  // RSVP Actions
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpError(null);

    const { firstName, lastName, dni, phone, attending, guestCount, dietary, dietaryDetail, comments } = rsvpForm;

    if (!firstName || !lastName || !dni) {
      setRsvpError('Por favor completa todos los campos requeridos.');
      return;
    }

    setRsvpLoading(true);
    try {
      // 1. Check for duplicates by DNI
      const { data: existing, error: checkError } = await supabase
        .from('rsvps')
        .select('id')
        .eq('dni', dni)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        setRsvpError('El DNI ingresado ya tiene una asistencia registrada.');
        setRsvpLoading(false);
        return;
      }

      // 2. Insert RSVP
      const isAttending = attending === 'yes';
      const actualDietary = dietary === 'Alergias' && dietaryDetail 
        ? `Alergias: ${dietaryDetail}` 
        : dietary;

      const { error: insertError } = await supabase
        .from('rsvps')
        .insert({
          first_name: firstName,
          last_name: lastName,
          dni,
          phone: phone || null,
          attending: isAttending,
          guest_count: isAttending ? guestCount : 0,
          dietary_restrictions: actualDietary,
          comments: comments || null
        });

      if (insertError) throw insertError;

      setRsvpSuccess(true);
      setRsvpForm({
        firstName: '',
        lastName: '',
        dni: '',
        phone: '',
        attending: 'yes',
        guestCount: 1,
        dietary: 'Ninguna',
        dietaryDetail: '',
        comments: ''
      });
      setTimeout(() => {
        setRsvpSuccess(false);
        setActiveModal(null);
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setRsvpError(`Error al registrar asistencia: ${err.message || err}`);
    } finally {
      setRsvpLoading(false);
    }
  };

  return (
    <section className="cards section">
      {/* Card 1: REGALOS */}
      <article className="card">
        <div className="icon-wash">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 12v10H4V12M2 7h20v5H2zM12 7v15M12 7H7.8a2.3 2.3 0 1 1 2.1-3.2L12 7Zm0 0h4.2a2.3 2.3 0 1 0-2.1-3.2L12 7Z" />
          </svg>
        </div>
        <h3>REGALOS</h3>
        <p>Tu presencia es nuestro mejor regalo, pero si deseás hacernos un obsequio:</p>
        <button 
          onClick={handleCopyAlias}
          className="invite-button"
          id="btn-copiar-alias"
        >
          {copied ? 'COPIADO' : 'COPIAR ALIAS'}
        </button>
      </article>

      {/* Card 2: SUBÍ TUS FOTOS */}
      <article className="card">
        <div className="icon-wash">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14.5 4 16 7h3a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h3l1.5-3Z" />
            <circle cx="12" cy="14" r="4" />
          </svg>
        </div>
        <h3>SUBÍ TUS FOTOS</h3>
        <p>Compartí tus mejores momentos del evento con nosotros.</p>
        <button 
          onClick={() => setActiveModal('photos')}
          className="invite-button"
          id="btn-subir-fotos"
        >
          SUBIR FOTOS
        </button>
      </article>

      {/* Card 3: SUGERÍ CANCIONES */}
      <article className="card">
        <div className="icon-wash">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 18V5l11-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="17" cy="16" r="3" />
          </svg>
        </div>
        <h3>SUGERÍ CANCIONES</h3>
        <p>Ayudanos a armar la banda sonora de nuestra fiesta.</p>
        <button 
          onClick={() => setActiveModal('song')}
          className="invite-button"
          id="btn-sugerir-canciones"
        >
          SUGERIR
        </button>
      </article>

      {/* Card 4: AGENDAR */}
      <article className="card">
        <div className="icon-wash">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18M12 18s-3-1.7-3-4a1.8 1.8 0 0 1 3-1 1.8 1.8 0 0 1 3 1c0 2.3-3 4-3 4Z" />
          </svg>
        </div>
        <h3>AGENDAR</h3>
        <p>Guardá la fecha en tu calendario.</p>
        <button 
          onClick={() => setActiveModal('calendar')}
          className="invite-button"
          id="btn-agendar"
        >
          AGENDAR
        </button>
      </article>

      {/* Card 5: CONFIRMAR ASISTENCIA */}
      <article className="card">
        <div className="icon-wash">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </div>
        <h3>CONFIRMAR ASISTENCIA</h3>
        <p>Confirmá tu asistencia completando el formulario.</p>
        <button 
          onClick={() => setActiveModal('rsvp')}
          className="invite-button"
          id="btn-confirmar-asistencia"
        >
          CONFIRMAR
        </button>
      </article>

      {/* Card 6: INSTAGRAM */}
      <article className="card">
        <div className="icon-wash">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <path d="M17.5 6.5h.01" />
          </svg>
        </div>
        <h3>INSTAGRAM</h3>
        <p>Seguinos y enterate de todas las novedades.</p>
        <a 
          href={instagramUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="invite-button"
          id="btn-instagram"
        >
          @PAMEYNESTOR
        </a>
      </article>

      {/* --- MODALS --- */}

      {/* 1. Modal Subir Fotos */}
      <Modal 
        isOpen={activeModal === 'photos'} 
        onClose={() => { if (!uploading) { setActiveModal(null); setSelectedFiles([]); setPhotoError(null); } }} 
        title="Subí tus fotos"
      >
        <form onSubmit={handleUploadPhotos}>
          <p className="form-note" style={{ color: 'var(--sage)', marginBottom: '10px' }}>
            Elegí las mejores capturas de tu celular o computadora y compartilas con nosotros. Formatos válidos: JPG, PNG, HEIC.
          </p>

          <div style={{ position: 'relative', border: '1px dashed var(--line)', borderRadius: '5px', padding: '20px', textAlign: 'center', background: '#fff', cursor: 'pointer', marginBottom: '14px' }}>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple 
              accept="image/png, image/jpeg, image/jpg, image/heic, .heic" 
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              disabled={uploading}
              id="input-file-photos"
            />
            <span style={{ fontSize: '12px', color: 'var(--ink)' }}>Hacé click para seleccionar fotos</span>
            <br />
            <span style={{ fontSize: '10px', color: 'var(--sage)' }}>Máx. 5 fotos simultáneas</span>
          </div>

          {photoError && (
            <p style={{ color: 'red', fontSize: '11px', marginBottom: '10px' }}>
              {photoError}
            </p>
          )}

          {/* List selected files */}
          {selectedFiles.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '100px', overflowY: 'auto', marginBottom: '14px' }}>
              {selectedFiles.map((file, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', background: '#fff', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--line)' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{file.name}</span>
                  <button 
                    type="button" 
                    onClick={() => removeSelectedFile(idx)}
                    style={{ color: 'red', border: 0, background: 'none', cursor: 'pointer' }}
                    disabled={uploading}
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Uploading Progress */}
          {uploading && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ width: '100%', backgroundColor: 'var(--pale)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ backgroundColor: 'var(--sage)', height: '100%', transition: 'all 0.3s', width: `${uploadProgress}%` }}
                />
              </div>
              <span style={{ fontSize: '10px', display: 'block', textAlign: 'center', marginTop: '4px', color: 'var(--sage)' }}>Subiendo... {uploadProgress}%</span>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || selectedFiles.length === 0}
            className="invite-button"
            id="btn-submit-photos"
            style={{ width: '100%' }}
          >
            {uploading ? 'SUBIENDO...' : 'SUBIR FOTOS'}
          </button>
        </form>
      </Modal>

      {/* 2. Modal Sugerir Canción */}
      <Modal 
        isOpen={activeModal === 'song'} 
        onClose={() => { if (!songLoading) { setActiveModal(null); setSongSuccess(false); } }} 
        title="Sugerí canciones"
      >
        {songSuccess ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <span style={{ fontSize: '32px' }}>✓</span>
            <h4 style={{ fontFamily: 'var(--serif)', fontSize: '18px', marginTop: '10px', letterSpacing: '0.1em' }}>¡Gracias!</h4>
            <p style={{ fontSize: '12px', color: 'var(--sage)' }}>Guardamos tu canción.</p>
          </div>
        ) : (
          <form onSubmit={handleSongSubmit}>
            <p className="form-note" style={{ color: 'var(--sage)', marginBottom: '10px' }}>
              ¿Qué canción no debería faltar en la fiesta? Sugerila aquí para que el DJ la tenga en cuenta.
            </p>

            <label htmlFor="suggesterName">
              Nombre y Apellido *
              <input
                type="text"
                id="suggesterName"
                required
                disabled={songLoading}
                placeholder="Ingresá tu nombre"
                value={songForm.suggesterName}
                onChange={e => setSongForm(prev => ({ ...prev, suggesterName: e.target.value }))}
              />
            </label>

            <label htmlFor="songTitle">
              Canción *
              <input
                type="text"
                id="songTitle"
                required
                disabled={songLoading}
                placeholder="Nombre del tema"
                value={songForm.title}
                onChange={e => setSongForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </label>

            <label htmlFor="songArtist">
              Artista / Banda *
              <input
                type="text"
                id="songArtist"
                required
                disabled={songLoading}
                placeholder="Quién la interpreta"
                value={songForm.artist}
                onChange={e => setSongForm(prev => ({ ...prev, artist: e.target.value }))}
              />
            </label>

            <label htmlFor="songLink">
              Link de Spotify o YouTube
              <input
                type="url"
                id="songLink"
                disabled={songLoading}
                placeholder="https://..."
                value={songForm.link}
                onChange={e => setSongForm(prev => ({ ...prev, link: e.target.value }))}
              />
            </label>

            <label htmlFor="songComment">
              Mensaje o comentario
              <textarea
                id="songComment"
                disabled={songLoading}
                placeholder="Ej. ¡Para bailar toda la noche!"
                value={songForm.comment}
                onChange={e => setSongForm(prev => ({ ...prev, comment: e.target.value }))}
              />
            </label>

            <button
              type="submit"
              disabled={songLoading}
              className="invite-button"
              id="btn-submit-song"
              style={{ width: '100%' }}
            >
              {songLoading ? 'GUARDANDO...' : 'SUGERIR CANCIÓN'}
            </button>
          </form>
        )}
      </Modal>

      {/* 3. Modal Agendar */}
      <Modal
        isOpen={activeModal === 'calendar'}
        onClose={() => setActiveModal(null)}
        title="Agendar casamiento"
      >
        <div>
          <p className="form-note" style={{ color: 'var(--sage)', marginBottom: '20px', textAlign: 'center' }}>
            Guardá el día en tu agenda personal para no olvidarte de nada.
          </p>

          <div className="calendar-actions" style={{ flexDirection: 'column' }}>
            <button
              onClick={handleDownloadIcs}
              className="invite-button outline"
              id="btn-agendar-ics"
              style={{ width: '100%', display: 'flex', gap: '8px', marginBottom: '10px' }}
            >
              DESCARGAR ARCHIVO .ICS
            </button>

            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setActiveModal(null)}
              className="invite-button"
              id="btn-agendar-google"
              style={{ width: '100%', display: 'flex', gap: '8px' }}
            >
              AGREGAR A GOOGLE CALENDAR
            </a>
          </div>
        </div>
      </Modal>

      {/* 4. Modal Confirmar Asistencia (RSVP) */}
      <Modal 
        isOpen={activeModal === 'rsvp'} 
        onClose={() => { if (!rsvpLoading) { setActiveModal(null); setRsvpSuccess(false); setRsvpError(null); } }} 
        title="Confirmar asistencia"
      >
        {rsvpSuccess ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <span style={{ fontSize: '32px' }}>✓</span>
            <h4 style={{ fontFamily: 'var(--serif)', fontSize: '18px', marginTop: '10px', letterSpacing: '0.1em' }}>¡Gracias!</h4>
            <p style={{ fontSize: '12px', color: 'var(--sage)' }}>Confirmamos tu asistencia.</p>
          </div>
        ) : (
          <form onSubmit={handleRsvpSubmit}>
            <p className="form-note" style={{ color: 'var(--sage)', marginBottom: '10px' }}>
              Completá con tus datos para registrar tu asistencia al evento.
            </p>

            {rsvpError && (
              <p style={{ color: 'red', fontSize: '11px', marginBottom: '10px' }}>
                {rsvpError}
              </p>
            )}

            <div className="form-grid">
              <label htmlFor="rsvpFirstName">
                Nombre *
                <input
                  type="text"
                  id="rsvpFirstName"
                  required
                  disabled={rsvpLoading}
                  placeholder="Tu nombre"
                  value={rsvpForm.firstName}
                  onChange={e => setRsvpForm(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </label>
              <label htmlFor="rsvpLastName">
                Apellido *
                <input
                  type="text"
                  id="rsvpLastName"
                  required
                  disabled={rsvpLoading}
                  placeholder="Tu apellido"
                  value={rsvpForm.lastName}
                  onChange={e => setRsvpForm(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </label>
            </div>

            <div className="form-grid">
              <label htmlFor="rsvpDni">
                DNI *
                <input
                  type="text"
                  id="rsvpDni"
                  required
                  disabled={rsvpLoading}
                  placeholder="Número de DNI"
                  value={rsvpForm.dni}
                  onChange={e => setRsvpForm(prev => ({ ...prev, dni: e.target.value }))}
                />
              </label>
              <label htmlFor="rsvpPhone">
                Teléfono
                <input
                  type="tel"
                  id="rsvpPhone"
                  disabled={rsvpLoading}
                  placeholder="Ej: 11223344"
                  value={rsvpForm.phone}
                  onChange={e => setRsvpForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </label>
            </div>

            {/* Attendance selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--sage)' }}>¿Asistís al evento? *</span>
              <div className="form-grid">
                <label className="invite-button" style={{ background: rsvpForm.attending === 'yes' ? 'var(--sage)' : 'var(--pale)', color: rsvpForm.attending === 'yes' ? '#fff' : 'var(--ink)', minHeight: '40px', padding: 0, justifyContent: 'center', cursor: 'pointer', borderRadius: '5px', border: '1px solid var(--line)' }}>
                  <input
                    type="radio"
                    name="attending"
                    value="yes"
                    checked={rsvpForm.attending === 'yes'}
                    onChange={() => setRsvpForm(prev => ({ ...prev, attending: 'yes' }))}
                    style={{ display: 'none' }}
                    disabled={rsvpLoading}
                  />
                  SÍ, ASISTIRÉ
                </label>
                <label className="invite-button" style={{ background: rsvpForm.attending === 'no' ? 'var(--sage)' : 'var(--pale)', color: rsvpForm.attending === 'no' ? '#fff' : 'var(--ink)', minHeight: '40px', padding: 0, justifyContent: 'center', cursor: 'pointer', borderRadius: '5px', border: '1px solid var(--line)' }}>
                  <input
                    type="radio"
                    name="attending"
                    value="no"
                    checked={rsvpForm.attending === 'no'}
                    onChange={() => setRsvpForm(prev => ({ ...prev, attending: 'no' }))}
                    style={{ display: 'none' }}
                    disabled={rsvpLoading}
                  />
                  NO PODRÉ ASISTIR
                </label>
              </div>
            </div>

            {/* Conditionally show guest count only when attending */}
            {rsvpForm.attending === 'yes' && (
              <label htmlFor="rsvpGuestCount">
                Cantidad de invitados (Contándote a vos) *
                <select
                  id="rsvpGuestCount"
                  disabled={rsvpLoading}
                  value={rsvpForm.guestCount}
                  onChange={e => setRsvpForm(prev => ({ ...prev, guestCount: parseInt(e.target.value, 10) }))}
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </label>
            )}

            {/* Dietary Restrictions */}
            <label htmlFor="rsvpDietary">
              Restricción Alimentaria *
              <select
                id="rsvpDietary"
                disabled={rsvpLoading}
                value={rsvpForm.dietary}
                onChange={e => setRsvpForm(prev => ({ ...prev, dietary: e.target.value }))}
              >
                <option value="Ninguna">Ninguna</option>
                <option value="Celíaco">Celíaco/a</option>
                <option value="Vegetariano">Vegetariano/a</option>
                <option value="Vegano">Vegano/a</option>
                <option value="Alergias">Alergias / Otra intolerancia</option>
              </select>
            </label>

            {/* If Allergies is selected, ask for details */}
            {rsvpForm.dietary === 'Alergias' && (
              <label htmlFor="rsvpDietaryDetail">
                Especificar restricción alimentaria *
                <input
                  type="text"
                  id="rsvpDietaryDetail"
                  required
                  disabled={rsvpLoading}
                  placeholder="Detallá qué alimentos evitar"
                  value={rsvpForm.dietaryDetail}
                  onChange={e => setRsvpForm(prev => ({ ...prev, dietaryDetail: e.target.value }))}
                />
              </label>
            )}

            <label htmlFor="rsvpComments">
              Mensaje o comentarios adicionales
              <textarea
                id="rsvpComments"
                disabled={rsvpLoading}
                placeholder="Algún detalle que quieras mencionarnos..."
                value={rsvpForm.comments}
                onChange={e => setRsvpForm(prev => ({ ...prev, comments: e.target.value }))}
              />
            </label>

            <button
              type="submit"
              disabled={rsvpLoading}
              className="invite-button"
              id="btn-submit-rsvp"
              style={{ width: '100%', marginTop: '10px' }}
            >
              {rsvpLoading ? 'CONFIRMANDO...' : 'CONFIRMAR ASISTENCIA'}
            </button>
          </form>
        )}
      </Modal>

      {/* Toast popup */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Floating RSVP Button with Countdown */}
      {activeModal !== 'rsvp' && (
        <div 
          className="rsvp-floating-container"
          id="rsvp-floating-wrapper"
        >
          <button 
            onClick={() => setActiveModal('rsvp')}
            className="rsvp-floating-btn"
            id="btn-rsvp-floating"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ stroke: 'currentColor', fill: 'none', strokeWidth: '1.5px', width: '16px', height: '16px' }}>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            CONFIRMAR ASISTENCIA
          </button>
          <span className="rsvp-countdown-text">
            {rsvpCountdown}
          </span>
        </div>
      )}
    </section>
  );
}
