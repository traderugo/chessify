'use client'

import { useEffect, useState } from 'react'

export default function TournamentCountdown({ startDate }) {
  const [countdown, setCountdown] = useState('Please wait...')

  useEffect(() => {
    if (!startDate) return

    const interval = setInterval(() => {
      const now = Date.now()
      const start = new Date(startDate).getTime()
      const diff = start - now

      if (diff <= 0) {
        setCountdown('Live now')
        clearInterval(interval)
        return
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)

      setCountdown(`${d}d ${h}h ${m}m ${s}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [startDate])

  return (
    <div>
      <p className="text-xs mb-1">Starts in</p>
      <p className="text-3xl sm:text-4xl font-extrabold">{countdown}</p>
    </div>
  )
}