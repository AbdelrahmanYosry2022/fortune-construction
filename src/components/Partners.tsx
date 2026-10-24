import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Container, SectionHeader } from '@fortune/shared-ui'
import { PartnerLogo } from './partners/PartnerLogo'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiFetch } from '@/lib/apiClient'
import type { Testimonial } from '@/types'
import { usePageContent } from '@/hooks/usePageContent'

interface ApiPartner { _id: string; name: string; abbr: string; logo?: string; order: number }
interface SuccessStoriesContent {
    title?: string;
    subtitle?: string;
    description?: string;
    items?: Testimonial[];
}

const COLORS = ['#1e3a5f', '#c9a227']

function SuccessStoriesSlider({ stories }: { stories: Testimonial[] }) {
    const [current, setCurrent] = useState(0)
    const [direction, setDirection] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    const goTo = useCallback((index: number) => {
        setDirection(index > current ? 1 : -1)
        setCurrent(index)
    }, [current])

    const next = useCallback(() => {
        setDirection(1)
        setCurrent((prev) => (prev + 1) % stories.length)
    }, [stories.length])

    const prev = useCallback(() => {
        setDirection(-1)
        setCurrent((prev) => (prev - 1 + stories.length) % stories.length)
    }, [stories.length])

    useEffect(() => {
        if (isPaused || stories.length <= 1) return
        const timer = setInterval(next, 6000)
        return () => clearInterval(timer)
    }, [isPaused, next, stories.length])

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.95 }),
    }

    const story = stories[current]

    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Decorative background elements */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-teal-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-4xl mx-auto">
                {/* Main slider card */}
                <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-white via-white to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/20 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/30 min-h-[320px]">
                    {/* Large decorative quote */}
                    <div className="absolute top-8 left-10 opacity-[0.04] pointer-events-none">
                        <Quote className="w-40 h-40 fill-current text-teal-500" />
                    </div>

                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={current}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="p-10 md:p-16"
                        >
                            {/* Quote icon */}
                            <div className="flex justify-center mb-8">
                                <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 rotate-3">
                                    <Quote className="w-6 h-6 text-white fill-current" />
                                </div>
                            </div>

                            {/* Quote text */}
                            <p className="text-slate-700 dark:text-slate-200 text-lg md:text-2xl leading-relaxed text-center font-light italic mb-12 max-w-3xl mx-auto">
                                "{story.quote}"
                            </p>

                            {/* Author info */}
                            <div className="flex flex-col items-center gap-4">
                                {story.image ? (
                                    <img 
                                        src={story.image} 
                                        alt={story.author}
                                        className="w-16 h-16 rounded-full object-cover ring-4 ring-teal-500/20 shadow-lg"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-teal-600 dark:to-teal-700 rounded-full flex items-center justify-center text-white font-display font-black text-lg shadow-lg ring-4 ring-teal-500/20">
                                        {story.initials}
                                    </div>
                                )}
                                <div className="text-center">
                                    <p className="font-bold text-slate-900 dark:text-white text-lg">{story.author}</p>
                                    <p className="text-teal-600 dark:text-teal-400 text-[11px] font-black uppercase tracking-[0.25em] mt-1">{story.org}</p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation controls */}
                {stories.length > 1 && (
                    <div className="flex items-center justify-center gap-6 mt-10">
                        {/* Previous button */}
                        <button
                            onClick={prev}
                            className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-teal-600 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 group"
                            aria-label="Previous story"
                        >
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>

                        {/* Dots */}
                        <div className="flex items-center gap-2">
                            {stories.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goTo(i)}
                                    aria-label={`Go to story ${i + 1}`}
                                    className={`transition-all duration-500 rounded-full ${
                                        i === current
                                            ? 'w-10 h-3 bg-teal-500 shadow-md shadow-teal-500/30'
                                            : 'w-3 h-3 bg-slate-200 dark:bg-slate-700 hover:bg-teal-300 dark:hover:bg-teal-600'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Next button */}
                        <button
                            onClick={next}
                            className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-teal-600 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 group"
                            aria-label="Next story"
                        >
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function Partners() {
    const { data: apiPartners } = useQuery<ApiPartner[]>({
        queryKey: ['partners'],
        queryFn: () => apiFetch<ApiPartner[]>('/partners'),
        staleTime: 60_000,
    })

    const { data: homeContent } = usePageContent<{ successStories?: SuccessStoriesContent }>('home')
    const content = homeContent?.successStories

    // Only real records from the API/CMS are shown; no hard-coded sample content.
    const partners = (apiPartners ?? []).map((p, i) => ({ name: p.name, abbr: p.abbr, color: COLORS[i % COLORS.length], logo: p.logo }))

    const stories: Testimonial[] = content?.items ?? []

    if (partners.length === 0 && stories.length === 0) return null

    return (
        <section id="partners" className="relative section-padding bg-white dark:bg-slate-950 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

            <Container>
                {partners.length > 0 && (
                    <>
                        <SectionHeader
                            subtitle="Trusted Partners"
                            title="Strategic Institutional Alliances"
                            description="We collaborate with Malawi's most influential government bodies, development banks, and international organizations."
                        />

                        {/* Partners grid */}
                        <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 ${stories.length > 0 ? 'mb-32' : ''}`}>
                            {partners.map((partner, i) => (
                                <PartnerLogo key={partner.name} partner={partner} index={i} />
                            ))}
                        </div>
                    </>
                )}

                {stories.length > 0 && (
                    <>
                        {/* Success Stories Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-teal-600 mb-4 block">
                                {content?.subtitle || "Corporate Voice"}
                            </span>
                            <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">
                                {content?.title || "Success Stories"}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-base mt-4 max-w-2xl mx-auto">
                                {content?.description || "Hear what our clients and partners have to say about working with Fortune Construction."}
                            </p>
                        </motion.div>

                        {/* Success Stories Slider */}
                        <SuccessStoriesSlider stories={stories} />
                    </>
                )}
            </Container>
        </section>
    )
}
