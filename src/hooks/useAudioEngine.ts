class AudioEngine {
  ctx: AudioContext | null = null
  masterGain: GainNode | null = null
  ambienceSource: AudioBufferSourceNode | null = null
  ambienceGain: GainNode | null = null
  initialized = false
  currentFreq = 80
  _ambienceBuffer: AudioBuffer | null = null

  async init() {
    if (this.initialized) return
    this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') await this.ctx.resume()

    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.4
    this.masterGain.connect(this.ctx.destination)

    await this.loadAmbience()
    this.initialized = true
  }

  private async loadAmbience() {
    if (!this.ctx) return
    try {
      const res = await fetch('/audio/level_op.mp3')
      const buf = await res.arrayBuffer()
      this._ambienceBuffer = await this.ctx.decodeAudioData(buf)
    } catch (e) {
      console.warn('Failed to load ambient audio:', e)
    }
  }

  startAmbient() {
    if (!this.ctx || !this.masterGain || !this._ambienceBuffer) return
    this.stopAmbient()

    this.ambienceGain = this.ctx.createGain()
    this.ambienceGain.gain.value = 0.3
    this.ambienceGain.connect(this.masterGain)

    this.ambienceSource = this.ctx.createBufferSource()
    this.ambienceSource.buffer = this._ambienceBuffer
    this.ambienceSource.loop = true
    this.ambienceSource.connect(this.ambienceGain)
    this.ambienceSource.start()
  }

  private stopAmbient() {
    if (this.ambienceSource) { try { this.ambienceSource.stop() } catch {}; this.ambienceSource = null }
    if (this.ambienceGain) { try { this.ambienceGain.disconnect() } catch {}; this.ambienceGain = null }
  }

  setDroneFrequency(_freq: number) {
    // no-op: ambience is a fixed track
  }

  playHover() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    const o = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    o.type = 'sine'
    o.frequency.value = 800
    g.gain.setValueAtTime(0.12, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    o.connect(g)
    g.connect(this.masterGain!)
    o.start(t)
    o.stop(t + 0.12)
  }

  playClick() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    const o = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(300, t)
    o.frequency.exponentialRampToValueAtTime(80, t + 0.1)
    g.gain.setValueAtTime(0.2, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
    o.connect(g)
    g.connect(this.masterGain!)
    o.start(t)
    o.stop(t + 0.1)

    const n = this.ctx.createBufferSource()
    const sr = this.ctx.sampleRate
    const nb = this.ctx.createBuffer(1, sr * 0.05, sr)
    const nd = nb.getChannelData(0)
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1
    n.buffer = nb
    const ng = this.ctx.createGain()
    ng.gain.setValueAtTime(0.06, t)
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
    n.connect(ng)
    ng.connect(this.masterGain!)
    n.start(t)
  }

  playBootCrescendo(duration = 3.6) {
    if (!this.ctx || !this.masterGain) return
    const t = this.ctx.currentTime
    const o = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(45, t)
    o.frequency.linearRampToValueAtTime(60, t + duration * 0.6)
    o.frequency.linearRampToValueAtTime(50, t + duration)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.35, t + duration * 0.7)
    g.gain.exponentialRampToValueAtTime(0.001, t + duration + 0.5)
    o.connect(g)
    g.connect(this.masterGain)
    o.start(t)
    o.stop(t + duration + 0.5)
  }

  dispose() {
    this.stopAmbient()
    this.ctx?.close()
    this.initialized = false
  }
}

export const audioEngine = new AudioEngine()
