import { useState, useRef, useCallback, useEffect } from 'react'
import { DHOL_INSTRUMENTS } from '../data/dholInstruments'

/**
 * useDholAudio — Web Audio API percussion synthesizer & sequencer
 * Provides zero-latency, realistic, authentic Dhol, Tasha, Kaavdi & Halgi rhythmic patterns.
 */
export function useDholAudio() {
  const [activeDhol, setActiveDhol] = useState(null)
  const [isDholPlaying, setIsDholPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)

  const audioCtxRef = useRef(null)
  const timerRef = useRef(null)
  const stepRef = useRef(0)
  const activeDholRef = useRef(null)
  const volumeRef = useRef(0.8)

  useEffect(() => {
    activeDholRef.current = activeDhol
  }, [activeDhol])

  useEffect(() => {
    volumeRef.current = volume
  }, [volume])

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      audioCtxRef.current = new AudioCtx()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  // --- Sound Synthesizers ---

  // 1. Thunderous Deep Bass Dhol (ढोल)
  const triggerDhol = useCallback((ctx, time, intensity = 1.0) => {
    const masterVol = volumeRef.current * intensity

    // Oscillator swept from 130Hz down to 45Hz
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(140, time)
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.18)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(320, time)

    gain.gain.setValueAtTime(masterVol * 1.3, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(time)
    osc.stop(time + 0.36)

    // Wood / Stick attack impact
    const click = ctx.createOscillator()
    const clickGain = ctx.createGain()
    click.type = 'triangle'
    click.frequency.setValueAtTime(480, time)
    click.frequency.exponentialRampToValueAtTime(80, time + 0.03)

    clickGain.gain.setValueAtTime(masterVol * 0.8, time)
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.035)

    click.connect(clickGain)
    clickGain.connect(ctx.destination)
    click.start(time)
    click.stop(time + 0.04)
  }, [])

  // 2. High-Pitched Sharp Metallic Tasha (ताशा)
  const triggerTasha = useCallback((ctx, time, intensity = 0.8) => {
    const masterVol = volumeRef.current * intensity

    // Noise buffer for snap
    const bufferSize = ctx.sampleRate * 0.06
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(3400, time)
    filter.Q.setValueAtTime(3.5, time)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(masterVol * 0.9, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.055)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    noise.start(time)
    noise.stop(time + 0.06)

    // High metal ring
    const ring = ctx.createOscillator()
    const ringGain = ctx.createGain()
    ring.type = 'triangle'
    ring.frequency.setValueAtTime(2800, time)
    ringGain.gain.setValueAtTime(masterVol * 0.35, time)
    ringGain.gain.exponentialRampToValueAtTime(0.001, time + 0.045)

    ring.connect(ringGain)
    ringGain.connect(ctx.destination)
    ring.start(time)
    ring.stop(time + 0.05)
  }, [])

  // 3. Brass Cymbals / Zanj (झांज) for Kaavdi
  const triggerZanj = useCallback((ctx, time, intensity = 0.7) => {
    const masterVol = volumeRef.current * intensity

    // Inharmonic metallic cluster
    const freqs = [587, 845, 1200, 1680, 2400, 3100]
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = 'square'
      osc.frequency.setValueAtTime(freq + (Math.random() * 20 - 10), time)

      filter.type = 'highpass'
      filter.frequency.setValueAtTime(3500, time)

      gain.gain.setValueAtTime(masterVol * 0.18, time)
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(time)
      osc.stop(time + 0.24)
    })
  }, [])

  // 4. Snappy Halgi (हलगी / संबळ)
  const triggerHalgi = useCallback((ctx, time, intensity = 0.85) => {
    const masterVol = volumeRef.current * intensity

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(520, time)
    osc.frequency.exponentialRampToValueAtTime(210, time + 0.08)

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1400, time)
    filter.Q.setValueAtTime(2.0, time)

    gain.gain.setValueAtTime(masterVol * 1.1, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(time)
    osc.stop(time + 0.13)
  }, [])

  // --- Step Scheduler for Authentic Rhythms ---
  const scheduleStep = useCallback((step, dholId) => {
    const ctx = getAudioContext()
    const time = ctx.currentTime + 0.01

    if (dholId === 'puneri') {
      // 16-step Puneri Mahanaad Pattern (BPM ~ 136)
      // Dhol on: 0, 3, 6, 8, 11, 14
      // Tasha on rapid cadence: 0, 1, 2, 4, 6, 8, 9, 10, 12, 14, 15
      if ([0, 3, 6, 8, 11, 14].includes(step % 16)) {
        triggerDhol(ctx, time, step === 0 || step === 8 ? 1.3 : 1.0)
      }
      if ([0, 1, 2, 4, 6, 8, 9, 10, 12, 14, 15].includes(step % 16)) {
        triggerTasha(ctx, time, [0, 8].includes(step % 16) ? 0.9 : 0.6)
      }
    } else if (dholId === 'nashik') {
      // Fast 16-step Nashik Dhol Dance Beat (BPM ~ 148)
      // Fast syncopated thumping
      if ([0, 2, 4, 6, 8, 10, 12, 13, 14].includes(step % 16)) {
        triggerDhol(ctx, time, [0, 8].includes(step % 16) ? 1.2 : 0.8)
      }
      if ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].includes(step % 16)) {
        triggerTasha(ctx, time, step % 2 === 0 ? 0.8 : 0.45)
      }
    } else if (dholId === 'kaavdi') {
      // Kaavdi Zanj + Marching Tasha (BPM ~ 142)
      if ([0, 4, 8, 12].includes(step % 16)) {
        triggerDhol(ctx, time, 1.1)
        triggerZanj(ctx, time, 0.8)
      }
      if ([2, 6, 10, 14].includes(step % 16)) {
        triggerZanj(ctx, time, 0.9)
      }
      if ([0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14].includes(step % 16)) {
        triggerTasha(ctx, time, 0.7)
      }
    } else if (dholId === 'halgi') {
      // Halgi & Sambal snapping rhythm (BPM ~ 156)
      if ([0, 4, 8, 12].includes(step % 16)) {
        triggerDhol(ctx, time, 0.9)
      }
      if ([0, 2, 3, 5, 6, 8, 10, 11, 13, 14].includes(step % 16)) {
        triggerHalgi(ctx, time, [0, 6, 8, 14].includes(step % 16) ? 1.0 : 0.7)
      }
      if (step % 2 === 1) {
        triggerTasha(ctx, time, 0.4)
      }
    }
  }, [getAudioContext, triggerDhol, triggerTasha, triggerZanj, triggerHalgi])

  const pauseDhol = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsDholPlaying(false)
    stepRef.current = 0
  }, [])

  const stopDhol = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsDholPlaying(false)
    stepRef.current = 0
  }, [])

  const playDhol = useCallback((dholInstrument) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    const inst = dholInstrument || activeDholRef.current || DHOL_INSTRUMENTS[0]
    setActiveDhol(inst)
    setIsDholPlaying(true)

    // Calculate step interval based on instrument BPM (16th notes)
    const bpm = inst.bpm || 140
    const stepDurationMs = (60 / bpm / 4) * 1000

    stepRef.current = 0
    scheduleStep(0, inst.id)

    timerRef.current = setInterval(() => {
      stepRef.current = (stepRef.current + 1) % 16
      scheduleStep(stepRef.current, inst.id)
    }, stepDurationMs)
  }, [scheduleStep])

  const toggleDhol = useCallback((dholInstrument) => {
    const targetInst = dholInstrument || activeDholRef.current || DHOL_INSTRUMENTS[0]
    if (isDholPlaying) {
      if (!dholInstrument || targetInst.id === activeDholRef.current?.id) {
        pauseDhol()
        return
      }
    }
    playDhol(targetInst)
  }, [isDholPlaying, pauseDhol, playDhol])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return {
    activeDhol,
    isDholPlaying,
    playDhol,
    pauseDhol,
    stopDhol,
    toggleDhol,
    setDholVolume: setVolume
  }
}
