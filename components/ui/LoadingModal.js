'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function LoadingModal() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Handle all link clicks (both regular <a> and Next.js Link)
    const handleClick = (e) => {
      const target = e.target.closest('a')
      if (target && target.href) {
        const url = new URL(target.href)
        // Show loading for internal navigation (same origin, different path)
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          setIsLoading(true)
        }
      }
    }

    // Handle browser back/forward buttons
    const handlePopState = () => {
      setIsLoading(true)
    }

    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [pathname])

  useEffect(() => {
    // Hide loading when pathname changes (new page has loaded)
    setIsLoading(false)
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#121826] rounded-lg shadow-2xl p-8 flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Loading...
        </p>
      </div>
    </div>
  )
}