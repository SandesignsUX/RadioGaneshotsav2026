import { useState, useEffect } from 'react'
import { getCurrentPlaylist } from '../data/playlists'

/**
 * Returns the current playlist based on IST time, updates every minute.
 */
export function useTimePlaylist() {
  const [currentPlaylist, setCurrentPlaylist] = useState(() => getCurrentPlaylist())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaylist(getCurrentPlaylist())
    }, 60 * 1000) // re-check every minute
    return () => clearInterval(interval)
  }, [])

  return { currentPlaylist }
}

/**
 * Returns a simulated listener count that fluctuates realistically.
 */
export function useListenerCount() {
  const base = useState(() => Math.floor(Math.random() * 600) + 700)[0] // 700–1300
  const [count, setCount] = useState(base)

  useEffect(() => {
    const tick = () => {
      const delta = Math.floor(Math.random() * 7) - 3 // -3 to +3
      setCount(c => Math.max(200, c + delta))
    }
    // Fluctuate every 8–20 seconds
    const schedule = () => {
      const delay = Math.random() * 12000 + 8000
      return setTimeout(() => {
        tick()
        timeoutRef = schedule()
      }, delay)
    }
    let timeoutRef = schedule()
    return () => clearTimeout(timeoutRef)
  }, [])

  return count
}

/**
 * Returns the current IST time as a formatted string.
 */
export function useISTClock() {
  const getIST = () => {
    const now = new Date()
    return now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      weekday: 'long',
    })
  }

  const [time, setTime] = useState(getIST)

  useEffect(() => {
    const interval = setInterval(() => setTime(getIST()), 30000)
    return () => clearInterval(interval)
  }, [])

  return time
}
