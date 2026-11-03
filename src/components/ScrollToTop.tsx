import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls to top of page when route changes or page refreshes
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    // Scroll to top on page load/refresh
    window.scrollTo(0, 0)
    
    // Also handle browser back/forward navigation
    const handlePopState = () => {
      window.scrollTo(0, 0)
    }
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  return null
}
