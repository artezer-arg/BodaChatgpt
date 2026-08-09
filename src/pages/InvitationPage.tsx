import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../hooks/useSettings';
import { Cover } from '../components/Invitation/Cover';
import { DateTime } from '../components/Invitation/DateTime';
import { CeremonyParty } from '../components/Invitation/CeremonyParty';
import { Countdown } from '../components/Invitation/Countdown';
import { RomancePhrase } from '../components/Invitation/RomancePhrase';
import { GiftSection } from '../components/Invitation/GiftSection';
import { InteractiveCards } from '../components/Invitation/InteractiveCards';
import { AdultsOnly } from '../components/Invitation/AdultsOnly';
import { DressCodeSection } from '../components/Invitation/DressCodeSection';
import { Footer } from '../components/Invitation/Footer';
import { MusicPlayer } from '../components/Invitation/MusicPlayer';

export function InvitationPage() {
  const { settings, loading } = useSettings();
  const [showWelcome, setShowWelcome] = useState(true);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#fdfcf8] flex flex-col items-center justify-center z-50 select-none">
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-sage-200 border-t-sage-500 rounded-full animate-spin mb-4" />
          <span className="font-serif text-xs tracking-[0.25em] text-sage-600 uppercase animate-pulse">
            Cargando Invitación...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="invitation-body w-full min-h-screen">
      <main className="invitation-main">
        {/* Botanical frame decoration (Top) */}
        <div className="botanical botanical-top" />

        {/* 1. Portada (Hero Section) */}
        <Cover 
          brideName={settings.bride_name}
          groomName={settings.groom_name}
          title={settings.title}
          introText={settings.intro_text}
        />

        {/* 2. Fecha y Horario */}
        <DateTime 
          date={settings.wedding_date}
          time={settings.wedding_time}
        />

        {/* 3. Ceremonia y Fiesta */}
        <CeremonyParty 
          locationName={settings.location_name}
          locationAddress={settings.location_address}
          mapsUrl={settings.maps_url}
        />

        {/* 4. Cuenta Regresiva */}
        <Countdown 
          targetDate={settings.wedding_date}
          targetTime={settings.wedding_time}
        />

        {/* 5. Frase Romántica */}
        <RomancePhrase 
          phrase={settings.phrase}
        />

        {/* Regalos (Sección Independiente) */}
        <GiftSection 
          bankAlias={settings.bank_alias}
          bankCbu={settings.bank_cbu}
          bankOwner={settings.bank_owner}
          bankName={settings.bank_name}
        />

        {/* 6. Tarjetas Interactivas */}
        <InteractiveCards 
          googleDriveUrl={settings.google_drive_url}
          spotifyPlaylistUrl={settings.spotify_playlist_url}
          instagramUrl={settings.instagram_url}
          weddingDate={settings.wedding_date}
          weddingTime={settings.wedding_time}
          locationName={settings.location_name}
          locationAddress={settings.location_address}
          rsvpDeadlineDate={settings.rsvp_deadline_date}
          rsvpDeadlineTime={settings.rsvp_deadline_time}
        />

        {/* Sección Sólo Adultos */}
        <AdultsOnly />

        {/* 7. Dress Code */}
        <DressCodeSection 
          title={settings.dress_code_title}
          subtitle={settings.dress_code_subtitle}
        />

        {/* 8. Cierre / Footer */}
        <Footer 
          finalMessage={settings.final_message}
        />

        {/* Floating Music player */}
        <MusicPlayer 
          musicUrl={settings.music_url}
        />
      </main>

      {/* Welcome Screen to trigger music autoplay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="fixed inset-0 bg-[#fdfcf8] flex flex-col items-center justify-center z-[9999] select-none text-center px-6"
            style={{ 
              backgroundImage: 'url("/watercolor_stain.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* White card overlay */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-[420px] w-full border border-sage-200/40 rounded-3xl p-12 bg-[#fdfcf8]/90 backdrop-blur-md shadow-xl flex flex-col items-center gap-6"
              style={{
                boxShadow: '0 20px 40px rgba(121, 133, 120, 0.12)',
                border: '1px solid rgba(220, 227, 218, 0.8)'
              }}
            >
              <h1 
                className="font-serif text-[42px] leading-tight text-[#2C3531]"
                style={{ fontFamily: 'var(--serif)', letterSpacing: '0.05em' }}
              >
                {settings.bride_name} <br />
                <span className="text-[28px] font-light font-sans text-sage-400">&</span> <br />
                {settings.groom_name}
              </h1>
              
              <div className="h-[1px] w-20 bg-sage-200" />
              
              <p 
                className="font-serif text-xs uppercase tracking-[0.2em] text-sage-600"
                style={{ fontFamily: 'var(--sans)', fontSize: '10px', fontWeight: 300 }}
              >
                ¡Te invitamos a compartir <br />
                nuestro gran día!
              </p>
              
              <button
                onClick={() => {
                  setShowWelcome(false);
                  const audioEl = document.getElementById('audio-bg-track') as HTMLAudioElement;
                  if (audioEl) {
                    audioEl.play().catch(e => console.error("No se pudo reproducir la música:", e));
                  }
                }}
                className="mt-4 h-12 px-10 bg-sage-500 hover:bg-sage-600 text-white rounded-full text-xs font-sans tracking-widest uppercase transition-colors cursor-pointer flex items-center justify-center font-medium shadow-sm hover:shadow"
                style={{ 
                  fontFamily: 'var(--sans)', 
                  letterSpacing: '0.15em', 
                  borderRadius: '50px',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: '11px'
                }}
              >
                INGRESAR
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
