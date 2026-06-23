'use client'

import { useEffect, useRef, useState } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  delay?: number
  desktopDelay?: number
}

export default function ScrollReveal({ children, delay = 0, desktopDelay }: ScrollRevealProps) {
  const [isIntersected, setIsIntersected] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersected(true)
          observer.unobserve(entry.target) // Trigger animation only once
        }
      },
      { 
        threshold: 0.05, 
        rootMargin: '0px 0px -40px 0px' 
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  // Fallback: If JavaScript is disabled or server-side rendered, elements are immediately visible
  const animationStyles = isMounted
    ? isIntersected
      ? 'animate-fade-in-up'
      : 'opacity-0 pointer-events-none'
    : 'opacity-100'

  return (
    <div
      ref={ref}
      style={{
        '--delay-mobile': `${delay}ms`,
        '--delay-desktop': `${desktopDelay !== undefined ? desktopDelay : delay}ms`,
      } as React.CSSProperties}
      className={`h-full motion-reduce:animation-none motion-reduce:opacity-100 motion-reduce:transform-none reveal-stagger ${animationStyles}`}
    >
      {children}
    </div>
  )
}
