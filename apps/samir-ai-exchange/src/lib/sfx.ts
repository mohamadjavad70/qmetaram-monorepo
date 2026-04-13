const ctx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.15) {
  const ac = ctx();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.connect(g).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export function sfxSpinTick() {
  playTone(800 + Math.random() * 400, 0.06, 'square', 0.08);
}

export function sfxSpinStart() {
  const ac = ctx();
  [400, 500, 600, 800].forEach((f, i) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.1, ac.currentTime + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.08 + 0.15);
    osc.connect(g).connect(ac.destination);
    osc.start(ac.currentTime + i * 0.08);
    osc.stop(ac.currentTime + i * 0.08 + 0.15);
  });
}

export function sfxWin() {
  const ac = ctx();
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((f, i) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.18, ac.currentTime + i * 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.12 + 0.4);
    osc.connect(g).connect(ac.destination);
    osc.start(ac.currentTime + i * 0.12);
    osc.stop(ac.currentTime + i * 0.12 + 0.4);
  });
}

export function sfxChestShake() {
  playTone(150, 0.15, 'sawtooth', 0.06);
}

export function sfxChestOpen() {
  const ac = ctx();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ac.currentTime + 0.5);
  g.gain.setValueAtTime(0.15, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.6);
  osc.connect(g).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + 0.6);
}
