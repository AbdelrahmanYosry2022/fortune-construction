import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowDown, PlayCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button, Badge } from '@fortune/shared-ui'
import { VideoBackground } from './hero/VideoBackground'
// import { HeroStats } from './hero/HeroStats'
import { HERO_VIDEOS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/apiClient'
import { usePageContent } from '@/hooks/usePageContent'

interface SiteSettings {
    heroTitle: string; heroBadge: string; heroSubtitle: string;
    companyName: string; tagline: string; phone: string; email: string; address: string;
}

interface HeroContent {
    badge?: string; title?: string; subtitle?: string;
    videos?: { url: string }[];
}

export default function Hero() {
    const [currentVideo, setCurrentVideo] = useState(0)

    const { data: settings } = useQuery<SiteSettings>({
        queryKey: ['settings'],
        queryFn: () => apiFetch<SiteSettings>('/settings'),
        staleTime: 60_000,
    })

    const { data: homeContent } = usePageContent<{ hero?: HeroContent }>('home')
    const heroApi = homeContent?.hero

    const videos = heroApi?.videos?.length
        ? heroApi.videos.map(v => v.url)
        : HERO_VIDEOS

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentVideo((prev) => (prev + 1) % videos.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [videos.length])

    const scrollTo = (selector: string) =>
        document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' })

    const heroBadge = heroApi?.badge || settings?.heroBadge || '20 Years of Construction Excellence'
    const heroSubtitle = heroApi?.subtitle || settings?.heroSubtitle || 'Fortune Construction Limited delivers world-class civil engineering across Malawi, building the bedrock of national progress.'

    const heroTitleRaw = heroApi?.title || settings?.heroTitle || 'Crafting Visionary Infrastructure.'
    const visIdx = heroTitleRaw.indexOf('Visionary')

    return (
        <section
            id="hero"
            className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-navy-900"
        >
            <VideoBackground currentIndex={currentVideo} videos={videos} />

            {/* Gradient overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-navy-900/85 via-navy-800/60 to-navy-900/90" />

            {/* Decorative grid */}
            <div
                className="absolute inset-0 z-10 opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Content */}
            <div className="relative z-20 max-w-6xl mx-auto px-6 text-center">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-10"
                >
                    <Badge variant="teal" className="gap-3 border border-teal-300/60 bg-slate-950/75 px-5 py-2.5 text-teal-50 shadow-lg shadow-slate-950/30 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                        </span>
                        {heroBadge}
                    </Badge>
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-white leading-[1.1] mb-10 tracking-tight"
                >
                    {visIdx >= 0 ? (
                        <>
                            {heroTitleRaw.slice(0, visIdx)}
                            <span className="text-teal-500">{heroTitleRaw.slice(visIdx, visIdx + 9)}</span>
                            {heroTitleRaw.slice(visIdx + 9)}
                        </>
                    ) : heroTitleRaw}
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto mb-16 font-light leading-relaxed"
                >
                    {heroSubtitle}
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                >
                    <Link to="/contact">
                        <Button
                            size="lg"
                            className="h-16 px-12 bg-teal-600 hover:bg-teal-500 text-white font-bold text-base uppercase tracking-widest shadow-2xl shadow-teal-500/20 transition-all duration-500 transform hover:-translate-y-1"
                        >
                            Executive Consultation
                        </Button>
                    </Link>
                    <Link to="/projects">
                        <Button
                            variant="outline"
                            size="lg"
                            className={cn(
                                "h-16 px-10 text-base font-bold uppercase tracking-widest gap-3 transition-all duration-500 hover:-translate-y-1",
                                "border-white/10 text-white bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-teal-500/30"
                            )}
                        >
                            <PlayCircle className="w-5 h-5 text-teal-500" />
                            View Portfolio
                        </Button>
                    </Link>
                </motion.div>

                {/* <HeroStats /> */}
            </div>

            {/* Scroll indicator */}
            <button
                onClick={() => scrollTo('#impact')}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/40 hover:text-teal-400 transition-colors animate-bounce"
                aria-label="Scroll down"
            >
                <ArrowDown className="w-6 h-6" />
            </button>
        </section>
    )
}
