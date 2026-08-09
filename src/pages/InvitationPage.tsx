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
    </div>
  );
}
