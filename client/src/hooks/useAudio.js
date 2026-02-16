import { useRef, useCallback } from 'react';

export const useAudio = () => {
  const audioContextRef = useRef(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback((frequency = 800, duration = 100, volume = 0.3) => {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  }, [initAudioContext]);

  const playLightSound = useCallback(() => {
    playBeep(600, 80, 0.2);
  }, [playBeep]);

  const playGoSound = useCallback(() => {
    playBeep(1200, 150, 0.3);
  }, [playBeep]);

  const playFalseStartSound = useCallback(() => {
    playBeep(200, 300, 0.4);
  }, [playBeep]);

  return {
    playLightSound,
    playGoSound,
    playFalseStartSound
  };
};
