// SoundService - Pure Web Audio API Synthesizer for Phone Ringtones & Call FX
// Generates realistic audio tones without needing external MP3/WAV files.

class SoundServiceClass {
  private ctx: AudioContext | null = null;
  private ringbackInterval: any = null;
  private incomingInterval: any = null;
  private activeGainNodes: GainNode[] = [];

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play gentle pulsating US/European dual-frequency ringback tone (440Hz + 480Hz)
  playRingback() {
    this.stopAll();
    const ctx = this.getContext();

    const ring = () => {
      try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.05);
        gain.gain.setValueAtTime(0.08, now + 1.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.85);
        osc2.stop(now + 1.85);
      } catch (e) {
        console.warn('Ringback audio error:', e);
      }
    };

    ring();
    this.ringbackInterval = setInterval(ring, 3800);
  }

  // Play melodic high-tech incoming phone call ringtone
  playIncomingRing() {
    this.stopAll();
    const ctx = this.getContext();

    const melodyNotes = [
      { freq: 587.33, dur: 0.12, pause: 0.05 }, // D5
      { freq: 739.99, dur: 0.12, pause: 0.05 }, // F#5
      { freq: 880.00, dur: 0.16, pause: 0.08 }, // A5
      { freq: 1174.66, dur: 0.28, pause: 0.12 } // D6
    ];

    const ringCycle = () => {
      try {
        let t = ctx.currentTime;
        melodyNotes.forEach(note => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(note.freq, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + note.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + note.dur + 0.01);
          t += note.dur + note.pause;
        });

        // Second phrase slightly higher
        t += 0.15;
        melodyNotes.forEach((note, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note.freq * (idx === 3 ? 1.25 : 1.12), t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.exponentialRampToValueAtTime(0.1, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + note.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + note.dur + 0.01);
          t += note.dur + note.pause;
        });
      } catch (e) {
        console.warn('Incoming ring error:', e);
      }
    };

    ringCycle();
    this.incomingInterval = setInterval(ringCycle, 2800);
  }

  // Play soft upward chime when call is answered/connected
  playConnected() {
    this.stopAll();
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        gain.gain.setValueAtTime(0.001, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.09, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.28);
      });
    } catch (e) {
      console.warn('Connected audio chime error:', e);
    }
  }

  // Play gentle descending beep when call ends
  playEnded() {
    this.stopAll();
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      [440, 329.63, 220].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);

        gain.gain.setValueAtTime(0.001, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.2);
      });
    } catch (e) {
      console.warn('Ended audio beep error:', e);
    }
  }

  // Stop all active ringtones and tones
  stopAll() {
    if (this.ringbackInterval) {
      clearInterval(this.ringbackInterval);
      this.ringbackInterval = null;
    }
    if (this.incomingInterval) {
      clearInterval(this.incomingInterval);
      this.incomingInterval = null;
    }
    this.activeGainNodes.forEach(g => {
      try {
        g.gain.setValueAtTime(0, 0);
      } catch (e) {}
    });
    this.activeGainNodes = [];
  }
}

export const SoundService = new SoundServiceClass();
