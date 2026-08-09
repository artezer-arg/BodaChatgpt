import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Modal } from '../Base/Modal';
import { Toast } from '../Base/Toast';

interface InteractiveCardsProps {
  googleDriveUrl: string;
  spotifyPlaylistUrl: string;
  instagramUrl: string;
  weddingDate: string;
  weddingTime: string;
  locationName: string;
  locationAddress: string;
  rsvpDeadlineDate: string;
  rsvpDeadlineTime: string;
}

export function InteractiveCards({ 
  googleDriveUrl,
  spotifyPlaylistUrl,
  instagramUrl, 
  weddingDate, 
  weddingTime, 
  locationName, 
  locationAddress,
  rsvpDeadlineDate,
  rsvpDeadlineTime
}: InteractiveCardsProps) {
  // Modal states
  const [activeModal, setActiveModal] = useState<'rsvp' | 'calendar' | null>(null);
  
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

  // Card 5: RSVP Form & Wizard States
  const [rsvpStep, setRsvpStep] = useState<1 | 2 | 3>(1);
  const [rsvpForm, setRsvpForm] = useState({
    attending: 'yes',
    guestCount: 1,
    dietary: 'Ninguna',
    dietaryDetail: '',
    comments: ''
  });
  const [guests, setGuests] = useState<{ firstName: string; lastName: string; dni: string; phone: string }[]>([
    { firstName: '', lastName: '', dni: '', phone: '' }
  ]);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  // Actions

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

  // RSVP Actions
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpError(null);
    setRsvpLoading(true);

    try {
      if (rsvpForm.attending === 'no') {
        const { error } = await supabase
          .from('rsvps')
          .insert({
            first_name: guests[0].firstName,
            last_name: guests[0].lastName,
            dni: guests[0].dni,
            phone: guests[0].phone || null,
            attending: false,
            guest_count: 1,
            dietary_restrictions: 'Ninguna',
            comments: rsvpForm.comments || null
          });
        if (error) throw error;
      } else {
        // Insert all guests
        for (let i = 0; i < guests.length; i++) {
          const guest = guests[i];
          const { error } = await supabase
            .from('rsvps')
            .insert({
              first_name: guest.firstName,
              last_name: guest.lastName,
              dni: guest.dni,
              phone: guest.phone || null,
              attending: true,
              guest_count: guests.length,
              dietary_restrictions: rsvpForm.dietary === 'Alergias' ? rsvpForm.dietaryDetail : rsvpForm.dietary,
              comments: i === 0 ? rsvpForm.comments || null : `Acompañante de ${guests[0].firstName} ${guests[0].lastName}`
            });
          if (error) throw error;
        }
      }

      setRsvpSuccess(true);
      setGuests([{ firstName: '', lastName: '', dni: '', phone: '' }]);
      setRsvpForm({
        attending: 'yes',
        guestCount: 1,
        dietary: 'Ninguna',
        dietaryDetail: '',
        comments: ''
      });
      setRsvpStep(1);
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
          onClick={() => window.open(googleDriveUrl || 'https://drive.google.com', '_blank', 'noopener,noreferrer')}
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
          onClick={() => window.open(spotifyPlaylistUrl || 'https://open.spotify.com', '_blank', 'noopener,noreferrer')}
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
        onClose={() => { if (!rsvpLoading) { setActiveModal(null); setRsvpSuccess(false); setRsvpError(null); setRsvpStep(1); setGuests([{ firstName: '', lastName: '', dni: '', phone: '' }]); } }} 
        title="Confirmar asistencia"
      >
        {rsvpSuccess ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <span style={{ fontSize: '32px' }}>✓</span>
            <h4 style={{ fontFamily: 'var(--serif)', fontSize: '18px', marginTop: '10px', letterSpacing: '0.1em' }}>¡Gracias!</h4>
            <p style={{ fontSize: '12px', color: 'var(--sage)' }}>Confirmamos tu asistencia.</p>
          </div>
        ) : (
          <>
            {/* Paso 1: Preguntar Asistencia */}
            {rsvpStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
                <p className="form-note" style={{ color: 'var(--sage)', textAlign: 'center', marginBottom: '10px' }}>
                  ¿Nos acompañás en este día tan especial?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setRsvpForm(prev => ({ ...prev, attending: 'yes' }));
                      setRsvpStep(2);
                    }}
                    className="invite-button"
                    style={{ background: 'var(--sage)', color: '#fff', width: '100%', justifyContent: 'center', height: '48px', fontSize: '12px', letterSpacing: '0.1em' }}
                  >
                    SÍ, ASISTIRÉ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRsvpForm(prev => ({ ...prev, attending: 'no', guestCount: 1 }));
                      setGuests([{ firstName: '', lastName: '', dni: '', phone: '' }]);
                      setRsvpStep(3);
                    }}
                    className="invite-button"
                    style={{ background: 'var(--pale)', color: 'var(--ink)', width: '100%', justifyContent: 'center', height: '48px', fontSize: '12px', letterSpacing: '0.1em', border: '1px solid var(--line)' }}
                  >
                    NO PODRÉ ASISTIR
                  </button>
                </div>
              </div>
            )}

            {/* Paso 2: Preguntar Cantidades */}
            {rsvpStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0', textAlign: 'center' }}>
                <p className="form-note" style={{ color: 'var(--sage)', marginBottom: '10px' }}>
                  ¿Cuántas personas asistirán en tu grupo? (Contándote a vos)
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', margin: '10px 0' }}>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setRsvpForm(prev => ({ ...prev, guestCount: n }));
                        setGuests(prev => {
                          const newGuests = [];
                          for (let i = 0; i < n; i++) {
                            newGuests.push(prev[i] || { firstName: '', lastName: '', dni: '', phone: '' });
                          }
                          return newGuests;
                        });
                        setRsvpStep(3);
                      }}
                      className="qty-circle-btn"
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setRsvpStep(1)}
                  style={{ background: 'none', border: 0, textDecoration: 'underline', color: 'var(--sage)', fontSize: '11px', cursor: 'pointer' }}
                >
                  Volver
                </button>
              </div>
            )}

            {/* Paso 3: Renderizar Campos Dinámicos */}
            {rsvpStep === 3 && (
              <form onSubmit={handleRsvpSubmit}>
                {rsvpError && (
                  <p style={{ color: 'red', fontSize: '11px', marginBottom: '10px', textAlign: 'center' }}>
                    {rsvpError}
                  </p>
                )}

                <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {guests.map((guest, idx) => (
                    <div key={idx} style={{ padding: '16px', border: '1px solid var(--line)', borderRadius: '8px', background: 'rgba(253, 252, 248, 0.4)' }}>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
                        {rsvpForm.attending === 'no' ? 'Tus Datos' : `Invitado ${idx + 1} ${idx === 0 ? '(Tú)' : ''}`}
                      </span>
                      
                      <div className="form-grid" style={{ marginBottom: '10px' }}>
                        <label>
                          Nombre *
                          <input
                            type="text"
                            required
                            disabled={rsvpLoading}
                            placeholder="Nombre"
                            value={guest.firstName}
                            onChange={e => {
                              const newGuests = [...guests];
                              newGuests[idx].firstName = e.target.value;
                              setGuests(newGuests);
                            }}
                          />
                        </label>
                        <label>
                          Apellido *
                          <input
                            type="text"
                            required
                            disabled={rsvpLoading}
                            placeholder="Apellido"
                            value={guest.lastName}
                            onChange={e => {
                              const newGuests = [...guests];
                              newGuests[idx].lastName = e.target.value;
                              setGuests(newGuests);
                            }}
                          />
                        </label>
                      </div>

                      <div className="form-grid">
                        <label>
                          DNI *
                          <input
                            type="text"
                            required
                            disabled={rsvpLoading}
                            placeholder="Número de DNI"
                            value={guest.dni}
                            onChange={e => {
                              const newGuests = [...guests];
                              newGuests[idx].dni = e.target.value;
                              setGuests(newGuests);
                            }}
                          />
                        </label>
                        <label>
                          Teléfono {idx === 0 ? '*' : '(Opcional)'}
                          <input
                            type="tel"
                            required={idx === 0}
                            disabled={rsvpLoading}
                            placeholder="Ej: 11223344"
                            value={guest.phone}
                            onChange={e => {
                              const newGuests = [...guests];
                              newGuests[idx].phone = e.target.value;
                              setGuests(newGuests);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}

                  {rsvpForm.attending === 'yes' && (
                    <>
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
                    </>
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
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    disabled={rsvpLoading}
                    onClick={() => setRsvpStep(rsvpForm.attending === 'yes' ? 2 : 1)}
                    className="invite-button"
                    style={{ background: 'var(--pale)', color: 'var(--ink)', width: '35%', justifyContent: 'center', border: '1px solid var(--line)' }}
                  >
                    VOLVER
                  </button>
                  <button
                    type="submit"
                    disabled={rsvpLoading}
                    className="invite-button"
                    id="btn-submit-rsvp"
                    style={{ width: '65%', justifyContent: 'center', background: 'var(--sage)', color: '#fff' }}
                  >
                    {rsvpLoading ? 'CONFIRMANDO...' : 'CONFIRMAR'}
                  </button>
                </div>
              </form>
            )}
          </>
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
