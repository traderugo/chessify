'use client'

import { useEffect, useState } from 'react'

export default function TournamentCountdown({ startDate, endDate }) {
  const [status, setStatus] = useState('waiting')
  const [timeDisplay, setTimeDisplay] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [completedDate, setCompletedDate] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!startDate || !mounted) return

    const updateDisplay = () => {
      const now = Date.now()
      const start = new Date(startDate).getTime()
      const end = endDate ? new Date(endDate).getTime() : null

      // Check if tournament has ended
      if (end && now >= end) {
        const diff = now - end
        const d = Math.floor(diff / (1000 * 60 * 60 * 24))
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const m = Math.floor((diff / (1000 * 60)) % 60)
        const s = Math.floor((diff / 1000) % 60)

        const formattedEndDate = new Date(endDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        
        setStatus('completed')
        setTimeDisplay({ d, h, m, s })
        setCompletedDate(formattedEndDate)
        return false
      }

      // Check if tournament is in progress
      if (now >= start) {
        const diff = now - start
        const d = Math.floor(diff / (1000 * 60 * 60 * 24))
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const m = Math.floor((diff / (1000 * 60)) % 60)
        const s = Math.floor((diff / 1000) % 60)

        setStatus('inProgress')
        setTimeDisplay({ d, h, m, s })
        return false
      }

      // Tournament hasn't started yet
      const diff = start - now
      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)

      setStatus('upcoming')
      setTimeDisplay({ d, h, m, s })
      return false
    }

    // Initial update
    updateDisplay()

    // Set up interval
    const interval = setInterval(() => {
      updateDisplay()
    }, 1000)

    return () => clearInterval(interval)
  }, [startDate, endDate, mounted])

  const getStatusConfig = () => {
    switch (status) {
      case 'upcoming':
        return {
          label: 'Starts in',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-900'
        }
      case 'inProgress':
        return {
          label: 'In progress',
          bgColor: 'bg-green-100',
          textColor: 'text-green-900'
        }
      case 'completed':
        return {
          label: 'Completed',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-900'
        }
      default:
        return {
          label: 'Loading',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-900'
        }
    }
  }

  const config = getStatusConfig()

  // Prevent hydration mismatch by showing loading state until mounted
  if (!mounted) {
    return (
      <div className="bg-gray-100 text-gray-900 p-4 sm:p-6 rounded-lg">
        <p className="text-sm mb-3 font-medium uppercase tracking-wide opacity-70">Loading</p>
        <div className="bg-black text-white p-4 sm:p-6 rounded-lg">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl md:text-5xl font-bold tabular-nums">00</span>
              <span className="text-xs uppercase tracking-wider mt-1 sm:mt-2 opacity-60">Days</span>
            </div>
            <span className="text-xl sm:text-3xl md:text-4xl font-bold opacity-50 mb-4 sm:mb-6">:</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl md:text-5xl font-bold tabular-nums">00</span>
              <span className="text-xs uppercase tracking-wider mt-1 sm:mt-2 opacity-60">Hours</span>
            </div>
            <span className="text-xl sm:text-3xl md:text-4xl font-bold opacity-50 mb-4 sm:mb-6">:</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl md:text-5xl font-bold tabular-nums">00</span>
              <span className="text-xs uppercase tracking-wider mt-1 sm:mt-2 opacity-60">Minutes</span>
            </div>
            <span className="text-xl sm:text-3xl md:text-4xl font-bold opacity-50 mb-4 sm:mb-6">:</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl md:text-5xl font-bold tabular-nums">00</span>
              <span className="text-xs uppercase tracking-wider mt-1 sm:mt-2 opacity-60">Seconds</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${config.bgColor} ${config.textColor} p-4 sm:p-6 rounded-lg`}>
      <p className="text-sm mb-3 font-medium uppercase tracking-wide opacity-70">{config.label}</p>
      
      <div className="bg-black text-white p-4 sm:p-6 rounded-lg">
        {status === 'completed' && completedDate ? (
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold break-words mb-4">{completedDate}</p>
            <div className="flex items-center justify-center gap-2 sm:gap-4 opacity-60">
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold tabular-nums">
                  {String(timeDisplay.d).padStart(2, '0')}
                </span>
                <span className="text-xs uppercase tracking-wider mt-1 opacity-60">Days ago</span>
              </div>
              
              <span className="text-lg sm:text-xl md:text-2xl font-bold opacity-50 mb-3">:</span>
              
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold tabular-nums">
                  {String(timeDisplay.h).padStart(2, '0')}
                </span>
                <span className="text-xs uppercase tracking-wider mt-1 opacity-60">Hours</span>
              </div>
              
              <span className="text-lg sm:text-xl md:text-2xl font-bold opacity-50 mb-3">:</span>
              
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold tabular-nums">
                  {String(timeDisplay.m).padStart(2, '0')}
                </span>
                <span className="text-xs uppercase tracking-wider mt-1 opacity-60">Minutes</span>
              </div>
              
              <span className="text-lg sm:text-xl md:text-2xl font-bold opacity-50 mb-3">:</span>
              
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold tabular-nums">
                  {String(timeDisplay.s).padStart(2, '0')}
                </span>
                <span className="text-xs uppercase tracking-wider mt-1 opacity-60">Seconds</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl md:text-5xl font-bold tabular-nums">
                {String(timeDisplay.d).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-wider mt-1 sm:mt-2 opacity-60">Days</span>
            </div>
            
            <span className="text-xl sm:text-3xl md:text-4xl font-bold opacity-50 mb-4 sm:mb-6">:</span>
            
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl md:text-5xl font-bold tabular-nums">
                {String(timeDisplay.h).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-wider mt-1 sm:mt-2 opacity-60">Hours</span>
            </div>
            
            <span className="text-xl sm:text-3xl md:text-4xl font-bold opacity-50 mb-4 sm:mb-6">:</span>
            
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl md:text-5xl font-bold tabular-nums">
                {String(timeDisplay.m).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-wider mt-1 sm:mt-2 opacity-60">Minutes</span>
            </div>
            
            <span className="text-xl sm:text-3xl md:text-4xl font-bold opacity-50 mb-4 sm:mb-6">:</span>
            
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl md:text-5xl font-bold tabular-nums">
                {String(timeDisplay.s).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-wider mt-1 sm:mt-2 opacity-60">Seconds</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}