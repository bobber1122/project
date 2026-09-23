/**
 * Web Audio API procedural sound synthesizer for romantic ambiance and heart explosion.
 * No external audio files needed — zero latency, pure synthesized harmonics.
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /** Soft, deep heartbeat thud */
  playHeartbeat() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // First beat (lub)
      this.triggerThud(ctx, now, 75, 40, 0.12, 0.25);
      // Second beat (dub) slightly softer
      this.triggerThud(ctx, now + 0.14, 65, 35, 0.1, 0.18);
    } catch {
      // Audio fallback silent
    }
  }

  private triggerThud(ctx: AudioContext, time: number, startFreq: number, endFreq: number, duration: number, gainVal: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  /** Elegant, celestial heart explosion chime + sparkling glockenspiel burst */
  playExplosion() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Soft warm low-end swell
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(110, now);
      bassOsc.frequency.exponentialRampToValueAtTime(55, now + 0.8);
      bassGain.gain.setValueAtTime(0.3, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.8);

      // Celestial harmonic chord (A major 9: A4, C#5, E5, G#5, B5)
      const freqs = [440, 554.37, 659.25, 830.61, 987.77, 1318.51];
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = now + index * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.12 / (index + 1), noteTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 1.7);
      });
    } catch {
      // Audio fallback silent
    }
  }

  /** Delicate page transition swoosh */
  playTransition() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.35);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Audio fallback silent
    }
  }
}

export const sounds = new SoundEffects();
