export class AudioManager {
  private ctx: AudioContext | null = null;
  private muted = false;
  private bgGain: GainNode | null = null;
  private bgPlaying = false;

  init() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
  }

  get isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.bgGain) {
      this.bgGain.gain.setValueAtTime(this.muted ? 0 : 0.15, this.ctx?.currentTime || 0);
    }
    return this.muted;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'triangle', vol = 0.15, endFreq?: number) {
    if (this.muted || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.02); // Soft attack
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playJump() {
    if (!this.ctx) return;
    // Classic sliding jump sound - increased vol to 0.15
    this.playTone(300, 0.25, 'triangle', 0.15, 600);
  }

  playCollect() {
    if (!this.ctx) return;
    // Mario-style coin jingle (B5 -> E6) - increased vol
    this.playTone(987.77, 0.1, 'sine', 0.14);
    setTimeout(() => this.playTone(1318.51, 0.3, 'sine', 0.12), 100);
  }

  playSuccess() {
    if (!this.ctx) return;
    // Joyful arpeggio - increased vol
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 0.3, 'triangle', 0.12), i * 100);
    });
  }

  playNoRunAway() {
    if (!this.ctx) return;
    this.playTone(400, 0.1, 'triangle', 0.1, 100);
  }

  startBgMusic() {
    if (this.bgPlaying || !this.ctx) return;
    this.bgPlaying = true;

    // Cuter, more melodic theme (C Major / F Major vibes)
    const melody = [
      523, 523, 587, 523, 659, 0, 784, 0,
      659, 0, 523, 0, 440, 494, 523, 0,
      523, 523, 587, 523, 698, 0, 784, 0,
      880, 784, 698, 659, 523, 0, 392, 0
    ];

    let noteIndex = 0;
    const playNote = () => {
      if (!this.bgPlaying || !this.ctx) return;
      const freq = melody[noteIndex % melody.length];
      if (freq > 0) {
        this.playTone(freq, 0.3, 'sine', this.muted ? 0 : 0.08); // Increased from 0.025
      }
      noteIndex++;
      setTimeout(playNote, 200);
    };
    playNote();
  }

  stopBgMusic() {
    this.bgPlaying = false;
  }

  playRomanticFinale() {
    if (!this.ctx) return;
    const notes = [262, 330, 392, 523, 659, 784, 880, 1047];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 0.6, 'triangle', 0.15), i * 150);
    });
  }
}

export const audioManager = new AudioManager();
