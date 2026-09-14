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

  const ytContainerRef = useRef(null)
  const ytPlayerRef = useRef(null)

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

  // Initialize YT player for Nashik Dhol
  useEffect(() => {
    const initYT = () => {
      if (ytPlayerRef.current || !ytContainerRef.current || !window.YT?.Player) return

      const el = document.createElement('div')
      ytContainerRef.current.appendChild(el)

      ytPlayerRef.current = new window.YT.Player(el, {
        height: '200',
        width: '200',
        videoId: '',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onStateChange: (event) => {
            const YT = window.YT
            if (event.data === YT?.PlayerState?.ENDED) {
              ytPlayerRef.current.seekTo(0)
              ytPlayerRef.current.playVideo()
            }
          }
        }
      })
    }

    if (window.YT && window.YT.Player) {
      initYT()
    } else {
      const originalOnReady = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (originalOnReady) originalOnReady()
        initYT()
      }
    }
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
      // Handled by YouTube player
    } else if (dholId === 'nashik') {
      // Handled by YouTube player
    } else if (dholId === 'halgi') {
      // Handled by YouTube player
    }
  }, [getAudioContext, triggerDhol, triggerTasha, triggerHalgi])

  const pauseDhol = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (ytPlayerRef.current?.pauseVideo) {
      ytPlayerRef.current.pauseVideo()
    }
    setIsDholPlaying(false)
    stepRef.current = 0
  }, [])

  const stopDhol = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (ytPlayerRef.current?.pauseVideo) {
      ytPlayerRef.current.pauseVideo()
    }
    setIsDholPlaying(false)
    stepRef.current = 0
  }, [])

  const playDhol = useCallback((dholInstrument) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (ytPlayerRef.current?.pauseVideo) {
      ytPlayerRef.current.pauseVideo()
    }

    const inst = dholInstrument || activeDholRef.current || DHOL_INSTRUMENTS[0]
    setActiveDhol(inst)
    setIsDholPlaying(true)

    const dholVideos = {
      nashik: '41BqL-H2Wr4',
      puneri: '8K8C3oXfB88',
      halgi: 'mrAxfhVu6lY'
    }

    if (dholVideos[inst.id]) {
      if (ytPlayerRef.current?.loadVideoById) {
        ytPlayerRef.current.loadVideoById(dholVideos[inst.id])
        ytPlayerRef.current.setVolume(volumeRef.current * 100)
      }
      return
    }

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

  // Listen to volume changes for Nashik Dhol
  useEffect(() => {
    if (ytPlayerRef.current?.setVolume) {
      ytPlayerRef.current.setVolume(volume * 100)
    }
  }, [volume])

  return {
    activeDhol,
    isDholPlaying,
    playDhol,
    pauseDhol,
    stopDhol,
    toggleDhol,
    setDholVolume: setVolume,
    ytContainerRef
  }
}
