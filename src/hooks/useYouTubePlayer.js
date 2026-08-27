import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useYouTubePlayer — manages the YouTube IFrame API lifecycle.
 * The caller attaches containerRef to a div in the DOM.
 */
export function useYouTubePlayer() {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const playlistRef = useRef([])
  const trackIndexRef = useRef(0)
  const shouldAutoPlayRef = useRef(false)

  const [tracks, setTracks] = useState([])
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isBuffering, setIsBuffering] = useState(false)

  // Keep ref in sync with state so event callbacks have latest values
  useEffect(() => {
    trackIndexRef.current = trackIndex
  }, [trackIndex])

  useEffect(() => {
    playlistRef.current = tracks
  }, [tracks])

  const handleNext = useCallback(() => {
    const list = playlistRef.current
    if (!list || list.length === 0) return
    const next = (trackIndexRef.current + 1) % list.length
    setTrackIndex(next)
    trackIndexRef.current = next
    if (playerRef.current?.loadVideoById && list[next]?.youtubeId) {
      playerRef.current.loadVideoById(list[next].youtubeId)
    }
  }, [])

  const handlePrev = useCallback(() => {
    const list = playlistRef.current
    if (!list || list.length === 0) return
    const time = playerRef.current?.getCurrentTime?.() || 0
    if (time > 3) {
      playerRef.current?.seekTo?.(0, true)
    } else {
      const prev = (trackIndexRef.current - 1 + list.length) % list.length
      setTrackIndex(prev)
      trackIndexRef.current = prev
      if (playerRef.current?.loadVideoById && list[prev]?.youtubeId) {
        playerRef.current.loadVideoById(list[prev].youtubeId)
      }
    }
  }, [])

  const playTrackAtIndex = useCallback((index) => {
    const list = playlistRef.current
    if (!list || index < 0 || index >= list.length) return
    setTrackIndex(index)
    trackIndexRef.current = index
    shouldAutoPlayRef.current = true
    if (playerRef.current?.loadVideoById && list[index]?.youtubeId) {
      playerRef.current.loadVideoById(list[index].youtubeId)
    }
  }, [])

  const initPlayer = useCallback(() => {
    if (playerRef.current || !containerRef.current || !window.YT?.Player) return

    const el = document.createElement('div')
    containerRef.current.appendChild(el)

    playerRef.current = new window.YT.Player(el, {
      height: '200',
      width: '200',
      videoId: '',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        origin: typeof window !== 'undefined' ? window.location.origin : undefined
      },
      events: {
        onReady: () => {
          setIsReady(true)
          if (shouldAutoPlayRef.current && playlistRef.current.length > 0) {
            const initialTrack = playlistRef.current[trackIndexRef.current]
            if (initialTrack?.youtubeId) {
              playerRef.current.loadVideoById(initialTrack.youtubeId)
            }
          }
        },
        onStateChange: (event) => {
          const YT = window.YT
          if (!YT) return
          switch (event.data) {
            case YT.PlayerState.PLAYING:
              setIsPlaying(true)
              setIsBuffering(false)
              break
            case YT.PlayerState.PAUSED:
              setIsPlaying(false)
              setIsBuffering(false)
              break
            case YT.PlayerState.BUFFERING:
              setIsBuffering(true)
              break
            case YT.PlayerState.UNSTARTED:
              setIsBuffering(true)
              break
            case YT.PlayerState.ENDED:
              handleNext()
              break
            default:
              break
          }
        },
        onError: () => {
          // If a video fails, automatically skip to next track
          handleNext()
        },
      },
    })
  }, [handleNext])

  // Load YT API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer()
      return
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    document.head.appendChild(tag)

    window.onYouTubeIframeAPIReady = () => {
      initPlayer()
    }
  }, [initPlayer])

  // Poll for time progress every 500ms while playing
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const ct = playerRef.current.getCurrentTime() || 0
        const dur = playerRef.current.getDuration() || 0
        setCurrentTime(ct)
        setDuration(dur)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [isPlaying])

  // ---- Public API ----

  const setPlaylist = useCallback((newTracks, startIndex = 0) => {
    setTracks(newTracks)
    playlistRef.current = newTracks
    setTrackIndex(startIndex)
    trackIndexRef.current = startIndex
  }, [])

  const start = useCallback((newTracks, startIndex = 0) => {
    setTracks(newTracks)
    playlistRef.current = newTracks
    setTrackIndex(startIndex)
    trackIndexRef.current = startIndex
    shouldAutoPlayRef.current = true

    if (playerRef.current?.loadVideoById && newTracks[startIndex]?.youtubeId) {
      playerRef.current.loadVideoById(newTracks[startIndex].youtubeId)
    }
  }, [])

  const play = useCallback(() => {
    playerRef.current?.playVideo?.()
  }, [])

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo?.()
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      playerRef.current?.pauseVideo?.()
    } else {
      playerRef.current?.playVideo?.()
    }
  }, [isPlaying])

  const seek = useCallback((seconds) => {
    playerRef.current?.seekTo?.(seconds, true)
  }, [])

  const setVolume = useCallback((vol) => {
    playerRef.current?.setVolume?.(Math.round(vol * 100))
  }, [])

  const mute = useCallback(() => playerRef.current?.mute?.(), [])
  const unMute = useCallback(() => playerRef.current?.unMute?.(), [])

  const currentTrack = tracks[trackIndex] || null

  return {
    isReady,
    isPlaying,
    isBuffering,
    tracks,
    trackIndex,
    currentTrack,
    currentTime,
    duration,
    setPlaylist,
    start,
    play,
    pause,
    togglePlay,
    playTrackAtIndex,
    next: handleNext,
    prev: handlePrev,
    seek,
    setVolume,
    mute,
    unMute,
    containerRef,
  }
}


