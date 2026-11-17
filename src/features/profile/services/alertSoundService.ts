import { Platform } from 'react-native';
import { AlertToneId } from '../data/locationsData';

/**
 * Reproduce una vista previa corta y diferenciada del tono de alerta elegido.
 * En Web usa Web Audio API (sin archivos externos ni red).
 * En Nativo degrada de forma segura sin bloquear la UI.
 */
export async function playAlertTonePreview(toneId: AlertToneId): Promise<boolean> {
  if (toneId === 'silent') {
    return false;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const AudioCtx =
        (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
          .AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioCtx) return false;

      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const scheduleBeep = (
        freqStart: number,
        freqEnd: number,
        startOffset: number,
        duration: number,
        type: OscillatorType = 'sine',
        peakGain = 0.16
      ) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freqStart, now + startOffset);
        if (freqEnd !== freqStart) {
          osc.frequency.exponentialRampToValueAtTime(freqEnd, now + startOffset + duration);
        }

        gain.gain.setValueAtTime(0.0001, now + startOffset);
        gain.gain.exponentialRampToValueAtTime(peakGain, now + startOffset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + startOffset);
        osc.stop(now + startOffset + duration + 0.02);
      };

      switch (toneId) {
        case 'rain_drops':
          // Tres gotas suaves descendentes
          scheduleBeep(880, 660, 0, 0.14, 'sine', 0.15);
          scheduleBeep(740, 520, 0.16, 0.14, 'sine', 0.15);
          scheduleBeep(620, 440, 0.32, 0.2, 'sine', 0.14);
          break;
        case 'wind_gust':
          // Barrido ráfaga ascendente y descendente
          scheduleBeep(240, 520, 0, 0.24, 'triangle', 0.18);
          scheduleBeep(520, 290, 0.26, 0.26, 'triangle', 0.16);
          break;
        case 'heat_pulse':
          // Doble pulso cálido agudo
          scheduleBeep(660, 660, 0, 0.18, 'sine', 0.16);
          scheduleBeep(880, 880, 0.22, 0.24, 'sine', 0.16);
          break;
        case 'classic_chime':
          // Acorde cristalino
          scheduleBeep(523.25, 523.25, 0, 0.3, 'sine', 0.12);
          scheduleBeep(659.25, 659.25, 0.07, 0.3, 'sine', 0.12);
          scheduleBeep(783.99, 783.99, 0.14, 0.32, 'sine', 0.12);
          break;
        case 'soft_ping':
          // Un solo toque discreto
          scheduleBeep(587.33, 587.33, 0, 0.22, 'sine', 0.12);
          break;
      }

      setTimeout(() => {
        ctx.close().catch(() => {});
      }, 900);

      return true;
    } catch {
      return false;
    }
  }

  return true;
}
