import { useCallback, useEffect, useRef, useState } from 'react';
import { asset, loveConfig } from '../config/loveConfig';

export function useRomanticAudio() {
  const [enabled, setEnabled] = useState(false);
  const context = useRef<AudioContext | null>(null);
  const bus = useRef<GainNode | null>(null);
  const player = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const tone = useCallback((frequency: number, duration = 1, offset = 0, volume = 0.25) => {
    const ctx = context.current;
    if (!ctx || ctx.state !== 'running' || !bus.current) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + offset;
    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain); gain.connect(bus.current);
    oscillator.start(start); oscillator.stop(start + duration + 0.05);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }, []);
  const heartbeat = useCallback(() => {
    if (loveConfig.sound.heartbeat) { tone(62, 0.2, 0, 0.7); tone(55, 0.25, 0.27, 0.5); }
  }, [tone]);
  const toggle = useCallback(async () => {
    try {
      if (enabled) {
        clearInterval(timer.current); player.current?.pause();
        await context.current?.suspend(); setEnabled(false); return;
      }
      if (!context.current) {
        context.current = new AudioContext();
        bus.current = context.current.createGain();
        bus.current.gain.value = loveConfig.sound.volume;
        bus.current.connect(context.current.destination);
      }
      await context.current.resume();
      if (loveConfig.sound.music && loveConfig.sound.musicUrl) {
        if (!player.current) { player.current = new Audio(asset(loveConfig.sound.musicUrl)); player.current.loop = true; player.current.volume = loveConfig.sound.volume; }
        await player.current.play();
      } else if (loveConfig.sound.music) {
        let phrase = 0;
        const chords = [[261.63, 329.63, 392, 523.25], [220, 261.63, 329.63, 440], [174.61, 220, 261.63, 349.23], [196, 246.94, 293.66, 392]];
        const play = () => { chords[phrase++ % chords.length].forEach((note, i) => tone(note, 3.5, i * 0.65, 0.17)); };
        play(); timer.current = setInterval(play, 4000);
      }
      setEnabled(true); heartbeat();
    } catch { setEnabled(false); clearInterval(timer.current); player.current?.pause(); void context.current?.suspend(); }
  }, [enabled, heartbeat, tone]);
  useEffect(() => () => { clearInterval(timer.current); player.current?.pause(); void context.current?.close(); }, []);
  useEffect(() => {
    const visibility = () => { if (document.hidden && enabled) { void context.current?.suspend(); player.current?.pause(); } else if (enabled) { void context.current?.resume(); if (player.current) void player.current.play().catch(() => {}); } };
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, [enabled]);
  return { enabled, toggle, heartbeat, chime: () => { tone(523.25, 0.8); tone(783.99, 1, 0.12); } };
}
