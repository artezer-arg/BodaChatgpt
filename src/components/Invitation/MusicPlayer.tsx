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

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error("Audio playback blocked or failed:", err);
        });
    }
  };

  return (
    <div>
      <audio 
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
