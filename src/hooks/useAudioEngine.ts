class AudioEngine {
  ctx: AudioContext | null = null
  masterGain: GainNode | null = null
  reverbWet: GainNode | null = null
  droneOscs: OscillatorNode[] = []
  droneLFO: OscillatorNode | null = null
  droneGain: GainNode | null = null
  noiseNode: AudioBufferSourceNode | null = null
  noiseGain: GainNode | null = null
  initialized = false
  currentFreq = 80

  async init() {
    if (this.initialized) return
    this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') await this.ctx.resume()

    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.5
    this.masterGain.connect(this.ctx.destination)

    this.reverbWet = this.ctx.createGain()
    this.reverbWet.gain.value = 0.4
    this.reverbWet.connect(this.masterGain)

    this.initialized = true
  }

  startAmbient() {
    if (!this.ctx || !this.masterGain) return
    this.stopAmbient()

    const directGain = this.ctx.createGain()
    directGain.gain.value = 0.8
    directGain.connect(this.masterGain)

    this.droneGain = this.ctx.createGain()
    this.droneGain.gain.value = 0.25
    this.droneGain.connect(directGain)

    const freq = this.currentFreq

    const osc1 = this.ctx.createOscillator()
    osc1.type = 'sawtooth'
    osc1.frequency.value = freq
    osc1.connect(this.droneGain)
    osc1.start()
    this.droneOscs.push(osc1)

    const osc2 = this.ctx.createOscillator()
    osc2.type = 'sawtooth'
    osc2.frequency.value = freq * 1.02
    osc2.connect(this.droneGain)
    osc2.start()
    this.droneOscs.push(osc2)

    const sub = this.ctx.createOscillator()
    sub.type = 'sine'
    sub.frequency.value = freq * 0.5
    sub.connect(this.droneGain)
    sub.start()
    this.droneOscs.push(sub)

    this.droneLFO = this.ctx.createOscillator()
    this.droneLFO.type = 'sine'
    this.droneLFO.frequency.value = 0.2
    const lfoGain = this.ctx.createGain()
    lfoGain.gain.value = 6
    this.droneLFO.connect(lfoGain)
    lfoGain.connect(osc1.frequency)
    lfoGain.connect(osc2.frequency)
    this.droneLFO.start()

    this.noiseNode = this.ctx.createBufferSource()
    const sr = this.ctx.sampleRate
    const nLen = sr * 4
    const nBuf = this.ctx.createBuffer(1, nLen, sr)
    const nData = nBuf.getChannelData(0)
    for (let i = 0; i < nLen; i++) {
      nData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 2))
    }
    this.noiseNode.buffer = nBuf
    this.noiseNode.loop = true

    const bp = this.ctx.createBiquadFilter()
    bp.type = 'lowpass'
    bp.frequency.value = 200
    bp.Q.value = 0.5

    this.noiseGain = this.ctx.createGain()
    this.noiseGain.gain.value = 0.04
    this.noiseNode.connect(bp)
    bp.connect(this.noiseGain)
    this.noiseGain.connect(this.reverbWet!)
    this.noiseNode.start()
  }

  private stopAmbient() {
    this.droneOscs.forEach(o => { try { o.stop() } catch {} })
    this.droneOscs = []
    if (this.droneLFO) { try { this.droneLFO.stop() } catch {}; this.droneLFO = null }
    if (this.noiseNode) { try { this.noiseNode.stop() } catch {}; this.noiseNode = null }
    if (this.noiseGain) { try { this.noiseGain.disconnect() } catch {}; this.noiseGain = null }
  }

  setDroneFrequency(freq: number) {
    this.currentFreq = freq
    if (!this.ctx || this.droneOscs.length === 0) return
    const t = this.ctx.currentTime + 0.8
    this.droneOscs[0]?.frequency.setTargetAtTime(freq, t, 0.4)
    this.droneOscs[1]?.frequency.setTargetAtTime(freq * 1.02, t, 0.4)
    this.droneOscs[2]?.frequency.setTargetAtTime(freq * 0.5, t, 0.4)
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
