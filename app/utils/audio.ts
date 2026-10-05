'use client';

// Web Audio API Procedural Sound Engine
// Guarantees zero latency, zero external network dependency, and crisp realistic sound effects

type SoundType = 'click' | 'switch' | 'soft' | 'pop' | 'success' | 'alert' | 'tab';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private soundProfile: 'crisp' | 'tactile' | 'bubble' = 'crisp';
  private listenersAttached: boolean = false;
  private subscribers: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('portal_sound_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedProfile = localStorage.getItem('portal_sound_profile') as 'crisp' | 'tactile' | 'bubble';
      if (savedProfile) {
        this.soundProfile = savedProfile;
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

  public setSoundProfile(profile: 'crisp' | 'tactile' | 'bubble') {
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
        if (this.soundProfile === 'crisp') {
          this.playCrispClick(ctx, masterGain, now);
        } else if (this.soundProfile === 'tactile') {
          this.playTactileTap(ctx, masterGain, now);
        } else {
          this.playBubblePop(ctx, masterGain, now);
        }
      } else if (type === 'switch') {
        this.playMechanicalSwitch(ctx, masterGain, now);
      } else if (type === 'soft') {
        this.playTactileTap(ctx, masterGain, now);
      } else if (type === 'pop') {
        this.playBubblePop(ctx, masterGain, now);
      } else if (type === 'tab') {
        this.playTabClick(ctx, masterGain, now);
      } else if (type === 'success') {
        this.playSuccessChime(ctx, masterGain, now);
      } else if (type === 'alert') {
        this.playAlertTone(ctx, masterGain, now);
      }
    } catch {
      // Audio playback fails silently if restricted by autoplay policies
    }
  }

  // 1. Crisp, tactile mechanical UI click (Transient snap + damp resonance)
  private playCrispClick(ctx: AudioContext, destination: GainNode, now: number) {
    // Sharp high frequency noise snap (transient)
    const bufferSize = Math.floor(ctx.sampleRate * 0.006); // 6ms noise burst
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

    // Resonant body click tone
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

  // 2. Mechanical keyboard switch click
  private playMechanicalSwitch(ctx: AudioContext, destination: GainNode, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.03);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 3. Tactile soft tap (Modern iOS/Mac style tap)
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

  // 4. Bubble Pop
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

  // 5. Tab navigation click
  private playTabClick(ctx: AudioContext, destination: GainNode, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(980, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.02);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // 6. Success chime for payment / completion
  private playSuccessChime(ctx: AudioContext, destination: GainNode, now: number) {
    const notes = [587.33, 880, 1174.66]; // D5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const noteTime = now + idx * 0.08;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  }

  // 7. Alert / info tone
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

  // Attach global click event handler so every interactive element clicks automatically
  public attachGlobalSoundListener() {
    if (this.listenersAttached || typeof window === 'undefined') return;
    this.listenersAttached = true;

    window.addEventListener('click', (e) => {
      // Resume audio context on user interaction
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      // Check if target or parent is an interactive element
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
