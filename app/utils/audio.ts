'use client';

// Web Audio API Procedural Sound Engine
// Zero external network dependency, zero latency, custom Royal Wedding Chimes & Tactile Feedback

type SoundType = 'click' | 'switch' | 'soft' | 'pop' | 'success' | 'alert' | 'tab' | 'shadi';
export type SoundProfileType = 'shadi' | 'crisp' | 'tactile' | 'bubble';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private soundProfile: SoundProfileType = 'shadi';
  private listenersAttached: boolean = false;
  private subscribers: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('portal_sound_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedProfile = localStorage.getItem('portal_sound_profile') as SoundProfileType;
      if (savedProfile) {
        this.soundProfile = savedProfile;
      } else {
        this.soundProfile = 'shadi';
      }
    }
  }

  public subscribe(cb: () => void) {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  private notify() {
    this.subscribers.forEach(cb => cb());
  }

  private initContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('portal_sound_muted', String(muted));
    }
    this.notify();
  }

  public getMuted() {
    return this.isMuted;
  }

  public toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setSoundProfile(profile: SoundProfileType) {
    this.soundProfile = profile;
    if (typeof window !== 'undefined') {
      localStorage.setItem('portal_sound_profile', profile);
    }
    this.notify();
  }

  public getSoundProfile() {
    return this.soundProfile;
  }

  public play(type: SoundType = 'click') {
    if (this.isMuted) return;

    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(ctx.destination);

      if (type === 'click') {
        if (this.soundProfile === 'shadi') {
          this.playShadiGoldChime(ctx, masterGain, now);
        } else if (this.soundProfile === 'crisp') {
          this.playCrispClick(ctx, masterGain, now);
        } else if (this.soundProfile === 'tactile') {
          this.playTactileTap(ctx, masterGain, now);
        } else {
          this.playBubblePop(ctx, masterGain, now);
        }
      } else if (type === 'shadi') {
        this.playShadiGoldChime(ctx, masterGain, now);
      } else if (type === 'switch') {
        this.playMechanicalSwitch(ctx, masterGain, now);
      } else if (type === 'soft') {
        this.playTactileTap(ctx, masterGain, now);
      } else if (type === 'pop') {
        this.playBubblePop(ctx, masterGain, now);
      } else if (type === 'tab') {
        this.playTabClick(ctx, masterGain, now);
      } else if (type === 'success') {
        this.playCelebratoryShadiFanfare(ctx, masterGain, now);
      } else if (type === 'alert') {
        this.playAlertTone(ctx, masterGain, now);
      }

      // Mobile haptic vibration if supported
      if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          if (type === 'success') {
            navigator.vibrate([30, 60, 30, 80, 40]);
          } else {
            navigator.vibrate(10);
          }
        } catch {
          // Ignore if vibration blocked by browser
        }
      }
    } catch {
      // Audio playback fails silently if restricted
    }
  }

  // 1. Royal Gold / Auspicious Wedding Ghungroo & Bell Chime
  private playShadiGoldChime(ctx: AudioContext, destination: GainNode, now: number) {
    // Harmonic frequencies simulating miniature golden brass ghungroo / bell chime
    const freqs = [1760, 2637, 3520]; // A6, E7, A7
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.004);

      const amp = 0.22 / (idx + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.12 + idx * 0.04);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(now + idx * 0.004);
      osc.stop(now + 0.18 + idx * 0.04);
    });

    // Subtle warm tap foundation
    const tapOsc = ctx.createOscillator();
    const tapGain = ctx.createGain();
    tapOsc.type = 'triangle';
    tapOsc.frequency.setValueAtTime(440, now);
    tapOsc.frequency.exponentialRampToValueAtTime(110, now + 0.03);

    tapGain.gain.setValueAtTime(0.25, now);
    tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    tapOsc.connect(tapGain);
    tapGain.connect(destination);

    tapOsc.start(now);
    tapOsc.stop(now + 0.04);
  }

  // 2. Crisp, tactile mechanical UI click
  private playCrispClick(ctx: AudioContext, destination: GainNode, now: number) {
    const bufferSize = Math.floor(ctx.sampleRate * 0.006);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(2500, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(destination);

    noise.start(now);
    noise.stop(now + 0.01);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.025);

    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(oscGain);
    oscGain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  // 3. Mechanical switch
  private playMechanicalSwitch(ctx: AudioContext, destination: GainNode, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.03);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 4. Tactile soft tap
  private playTactileTap(ctx: AudioContext, destination: GainNode, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // 5. Bubble Pop
  private playBubblePop(ctx: AudioContext, destination: GainNode, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(1450, now + 0.05);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // 6. Tab navigation click
  private playTabClick(ctx: AudioContext, destination: GainNode, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1050, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.025);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  // 7. Celebratory Shaadi Fanfare / Shehnai & Golden Bell Arpeggio
  private playCelebratoryShadiFanfare(ctx: AudioContext, destination: GainNode, now: number) {
    // Auspicious celebratory musical chord progression [Sa, Ga, Pa, Sa']: C5, E5, G5, C6, E6
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const noteTime = now + idx * 0.08;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      // Add warmth and vibrato for wedding celebratory feel
      gain.gain.setValueAtTime(0.22, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.0008, noteTime + 0.55);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.6);
    });
  }

  // 8. Alert tone
  private playAlertTone(ctx: AudioContext, destination: GainNode, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.setValueAtTime(659.25, now + 0.07);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // Attach global click event handler
  public attachGlobalSoundListener() {
    if (this.listenersAttached || typeof window === 'undefined') return;
    const resumeAudio = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    };

    window.addEventListener('touchstart', resumeAudio, { capture: true, passive: true });

    window.addEventListener('click', (e) => {
      resumeAudio();

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest('button, a, input, select, [role="button"], [data-clickable="true"], .clickable-item');
      if (clickable) {
        const attr = clickable.getAttribute('data-sound');
        if (attr !== 'none') {
          const soundType = (attr as SoundType) || 'click';
          this.play(soundType);
        }
      }
    }, { capture: true, passive: true });
  }
}

export const soundManager = new SoundEngine();
