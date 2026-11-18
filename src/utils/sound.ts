class StudioAudioEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private playTone(freq: number, startTimeOffset: number, duration: number, type: OscillatorType, gainPeak: number) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + startTimeOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playSelect() {
    this.playTone(440, 0, 0.11, 'sine', 0.08);
  }

  public playLockIn() {
    this.playTone(220, 0, 0.35, 'triangle', 0.11);
    this.playTone(330, 0.12, 0.45, 'sine', 0.08);
  }

  public playCorrect() {
    this.playTone(523.25, 0, 0.18, 'triangle', 0.12);
    this.playTone(659.25, 0.09, 0.22, 'triangle', 0.12);
    this.playTone(783.99, 0.18, 0.38, 'sine', 0.14);
  }

  public playWrong() {
    this.playTone(196, 0, 0.28, 'sawtooth', 0.09);
    this.playTone(146.83, 0.18, 0.52, 'triangle', 0.12);
  }

  public playLifeline() {
    this.playTone(587.33, 0, 0.16, 'sine', 0.1);
    this.playTone(880, 0.1, 0.28, 'sine', 0.1);
  }

  public playWalkAway() {
    this.playTone(392, 0, 0.2, 'sine', 0.1);
    this.playTone(523.25, 0.14, 0.32, 'sine', 0.1);
  }

  public playMillionaireWin() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((n, idx) => {
      this.playTone(n, idx * 0.1, 0.5, 'triangle', 0.13);
    });
  }
}

export const studioAudio = new StudioAudioEngine();
