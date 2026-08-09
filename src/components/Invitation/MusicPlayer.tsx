import { useState, useEffect, useRef } from 'react';

interface MusicPlayerProps {
  musicUrl: string;
}

export function MusicPlayer({ musicUrl }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fallback to a beautiful public domain classical piano track
  const defaultTrack = 'https://upload.wikimedia.org/wikipedia/commons/1/18/Schumann-kinderszenen-von-fremden-laendern-und-menschen.mp3';
  const trackUrl = musicUrl || defaultTrack;

  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.src = trackUrl;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [trackUrl]);

  // Sync state with HTML5 audio play/pause events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Auto-play music on the first scroll, touch, or click interaction
  useEffect(() => {
    let triggered = false;

    const startMusicOnInteraction = () => {
      if (triggered) return;
      
      const audio = audioRef.current;
      if (audio) {
        triggered = true;
        audio.play()
          .then(() => {
            setIsPlaying(true);
            removeInteractionListeners();
          })
          .catch(err => {
            console.log("Autoplay on interaction blocked or deferred:", err);
            // reset trigger if it failed so next interaction can try again
            triggered = false;
          });
      }
    };

    const removeInteractionListeners = () => {
      window.removeEventListener('scroll', startMusicOnInteraction);
      window.removeEventListener('touchmove', startMusicOnInteraction);
      window.removeEventListener('click', startMusicOnInteraction);
    };

    // Add listeners with passive option for performance
    window.addEventListener('scroll', startMusicOnInteraction, { passive: true });
    window.addEventListener('touchmove', startMusicOnInteraction, { passive: true });
    window.addEventListener('click', startMusicOnInteraction, { passive: true });

    return () => {
      removeInteractionListeners();
    };
  }, [trackUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play()
        .catch(err => {
          console.error("Audio playback blocked or failed:", err);
        });
    }
  };

  return (
    <div>
      <audio 
        id="audio-bg-track"
        ref={audioRef} 
        src={trackUrl} 
        loop 
        preload="auto"
      />
      
      <button
        onClick={togglePlay}
        className="music-fab"
        aria-label="Reproducir música"
        id="btn-floating-music"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 18V5l11-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="17" cy="16" r="3" />
        </svg>
        <span>{isPlaying ? 'Pausar' : 'Música'}</span>
      </button>
    </div>
  );
}
