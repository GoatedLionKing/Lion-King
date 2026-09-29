import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const STORAGE_KEY = "goated-site-audio-muted";

export function SiteAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    const isMuted = saved === "true";

    setMuted(isMuted);
    audio.muted = isMuted;
    audio.volume = 0.45;

    if (isMuted) return;

    const startAudio = () => {
      void audio.play().catch(() => {});
    };

    startAudio();

    const events = ["pointerdown", "touchstart", "keydown"] as const;

    events.forEach((event) => {
      window.addEventListener(event, startAudio, { once: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, startAudio);
      });
    };
  }, []);

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;

    const nextMuted = !muted;

    audio.muted = nextMuted;
    setMuted(nextMuted);
    localStorage.setItem(STORAGE_KEY, String(nextMuted));

    if (!nextMuted) {
      void audio.play().catch(() => {});
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/intro.mp3"
        loop
        preload="auto"
      />

      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"}
        title={muted ? "تشغيل الصوت" : "كتم الصوت"}
        className="fixed bottom-4 right-4 z-50 flex size-9 items-center justify-center rounded-full border border-gold/25 bg-bg/75 text-gold shadow-lg backdrop-blur-md transition-all hover:border-gold/60 hover:bg-bg/95 focus:outline-none focus:ring-2 focus:ring-gold/40"
      >
        {muted ? (
          <VolumeX className="size-4" />
        ) : (
          <Volume2 className="size-4" />
        )}
      </button>
    </>
  );
}
