import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Props { sources: string[] }

// How long each slide stays on screen before the next one fades in.
const SLIDE_INTERVAL_MS = 7000

// Lower-case on purpose: React 18 only passes the priority hint through to the DOM in this form.
const HIGH_FETCH_PRIORITY = { fetchpriority: 'high' } as Record<string, string>

function isYouTubeUrl(url: string): boolean {
    return /youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\//.test(url)
}

function getYouTubeEmbedUrl(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&showinfo=0&rel=0` : url
}

function isImageUrl(url: string): boolean {
    return /\.(avif|webp|jpe?g|png|gif)(?:[?#].*)?$/i.test(url)
}

/**
 * Full-bleed hero background: a slow cross-fading slideshow of photos, or the videos /
 * YouTube links set in the Home page content. Visitors who prefer reduced motion get the
 * first slide only, without rotation.
 */
export function HeroBackground({ sources }: Props) {
    const reduceMotion = useReducedMotion()
    const [currentIndex, setCurrentIndex] = useState(0)
    // Furthest slide shown so far. Photos are added to the page just before their turn and then
    // stay mounted (so the outgoing one can fade out), instead of all downloading on first visit.
    const [furthestIndex, setFurthestIndex] = useState(0)
    const count = sources.length
    const nextIndex = count ? (currentIndex + 1) % count : 0

    useEffect(() => {
        if (reduceMotion || count < 2) return
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % count)
        }, SLIDE_INTERVAL_MS)
        return () => clearInterval(timer)
    }, [count, reduceMotion])

    useEffect(() => {
        setFurthestIndex((prev) => Math.max(prev, currentIndex))
    }, [currentIndex])

    return (
        <div className="absolute inset-0 z-0" aria-hidden="true">
            {sources.map((src, index) => {
                const key = `${index}-${src}`
                const isActive = index === currentIndex

                if (isImageUrl(src)) {
                    const shouldRender = index === 0 || (!reduceMotion && (index <= furthestIndex || index === nextIndex))
                    if (!shouldRender) return null

                    return (
                        <img
                            key={key}
                            src={src}
                            alt=""
                            loading={index === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            {...(index === 0 ? HIGH_FETCH_PRIORITY : {})}
                            className={cn(
                                // Arbitrary property: a bracketed duration-* value clashes with tailwindcss-animate and outputs no CSS.
                                'absolute inset-0 w-full h-full object-cover transition-opacity [transition-duration:2000ms] ease-in-out motion-reduce:transition-none',
                                isActive ? 'opacity-100' : 'opacity-0'
                            )}
                        />
                    )
                }

                const isYT = isYouTubeUrl(src)
                const shouldWarmVideo = !isYT && index === nextIndex && !reduceMotion
                if (!isActive && !shouldWarmVideo) return null

                return isYT ? (
                    <iframe
                        key={key}
                        src={isActive ? getYouTubeEmbedUrl(src) : undefined}
                        className={cn(
                            'absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 pointer-events-none',
                            isActive ? 'opacity-100' : 'opacity-0'
                        )}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        tabIndex={-1}
                        style={{ border: 'none' }}
                    />
                ) : (
                    <video
                        key={key}
                        className={cn(
                            'absolute inset-0 w-full h-full object-cover transition-opacity duration-1000',
                            isActive ? 'opacity-100' : 'opacity-0'
                        )}
                        autoPlay={isActive && !reduceMotion}
                        muted
                        loop
                        playsInline
                        preload={isActive ? 'auto' : 'metadata'}
                    >
                        <source src={src} />
                    </video>
                )
            })}
            {/* Overlay to ensure readability while media loads */}
            <div className="absolute inset-0 z-10 bg-navy-900/40" />
        </div>
    )
}
