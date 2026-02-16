import { useRef, useCallback } from 'react';

export const useAudio = () => {
  const audioContextRef = useRef(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback((frequency = 800, duration = 100, volume = 0.3, type = 'sine') => {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  }, [initAudioContext]);

  const playLightSound = useCallback(() => {
    // Sharp, mechanical click for light activation
    playBeep(800, 60, 0.25, 'square');
  }, [playBeep]);

  const playGoSound = useCallback(() => {
    // Bright, urgent tone for green light
    const ctx = initAudioContext();
    playBeep(1400, 200, 0.35, 'sine');
    setTimeout(() => playBeep(1600, 150, 0.3, 'sine'), 50);
  }, [playBeep, initAudioContext]);

  const playFalseStartSound = useCallback(() => {
    // Deep, harsh buzzer for false start
    playBeep(150, 400, 0.4, 'sawtooth');
    setTimeout(() => playBeep(140, 400, 0.35, 'sawtooth'), 100);
  }, [playBeep]);

  return {
    playLightSound,
    playGoSound,
    playFalseStartSound
  };
};
