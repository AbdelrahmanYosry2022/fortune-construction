import { Image, PageHero } from '@fortune/shared-ui'
import { motion } from 'framer-motion'
import { ShieldCheck, HardHat, Leaf, Award, Download, Search, Type, Smile, Phone, Mail, MapPin, Clock, Share2, Globe, Settings, Users, Briefcase, Building2, Construction, CheckCircle2, AlertCircle, Info, ExternalLink, ChevronRight, Route, Home, CheckCircle, Shield, Target, Linkedin, Twitter } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'
import { usePageContent } from '@/hooks/usePageContent'
import { ReactNode } from 'react'
import { SeoHead } from '@/components/SeoHead'
import { seoProfiles } from '@/lib/seo'

function EmptyState({ icon: Icon, title, description }: { icon?: any, title: string, description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && <div className="mb-4 text-gray-400"><Icon className="w-16 h-16" /></div>}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 max-w-md mb-6">{description}</p>}
    </div>
  )
}

interface ApiTeamMember {
    _id: string;
    name: string;
    role: string;
    photo?: string;
    bio?: string;
    socialLinks?: {
        linkedin?: string;
        twitter?: string;
    };
    order: number;
}

interface AboutContent {
    hero?: { title?: string; description?: string; image?: string }
    vision?: { title?: string; description?: string }
    mission?: { title?: string; description?: string }
    timeline?: { title?: string; subtitle?: string; items?: { year: string; title: string; desc: string }[] }
    coreValues?: { title?: string; subtitle?: string; items?: { title: string; desc: string; icon?: string }[] }
}

const ICON_MAP: Record<string, any> = {
    ShieldCheck, HardHat, Leaf, Award, Download, Search, Type, Smile, Phone, Mail, MapPin, Clock, Share2, Globe, Settings, Users, Briefcase, Building2, Construction, CheckCircle2, AlertCircle, Info, ExternalLink, ChevronRight, Route, Home, CheckCircle, Shield, Target
}

function isImageUrl(str?: string) {
    if (!str) return false
    return str.startsWith('http') || str.startsWith('/') || str.startsWith('data:')
}

function renderIcon(icon?: string, fallback: ReactNode = <Shield />) {
    if (!icon) return fallback
    if (isImageUrl(icon)) return <img src={icon} alt="" className="w-8 h-8 object-contain" />
    const IconComp = ICON_MAP[icon]
    if (IconComp) return <IconComp className="w-8 h-8" />
    return fallback
}


export default function AboutPage() {
    const { data: apiTeam } = useQuery<ApiTeamMember[]>({
        queryKey: ['team'],
        queryFn: () => apiFetch<ApiTeamMember[]>('/team'),
        staleTime: 60_000,
    })

    const { data: aboutContent } = usePageContent<AboutContent>('about')

    const leaders = apiTeam?.map((m: ApiTeamMember) => ({
        name: m.name,
        role: m.role,
        img: m.photo || '',
        links: {
            linkedin: m.socialLinks?.linkedin?.trim() || '',
            twitter: m.socialLinks?.twitter?.trim() || '',
        },
    })) || []

    const vision = aboutContent?.vision
    const mission = aboutContent?.mission
    const timeline = aboutContent?.timeline
    const coreValues = aboutContent?.coreValues

    const timelineItems = timeline?.items?.length ? timeline.items : [
        { year: '2006', title: 'Company Founded', desc: 'Established in Lilongwe as a specialized contractor for residential projects.' },
        { year: '2012', title: 'First Government Contract', desc: 'Awarded a major road infrastructure project, marking our entry into the public sector.' },
        { year: '2018', title: 'ISO Certification', desc: 'Achieved international recognition for quality management and safety standards.' },
        { year: '2026', title: 'National Leader', desc: 'Celebrating 20 years with over 150 completed landmark projects across Malawi.' }
    ]

    const valueItems = coreValues?.items?.length ? coreValues.items : [
        { icon: 'Shield', title: 'Safety First', desc: 'Zero compromises when it comes to the health and safety of our workforce and the public.' },
        { icon: 'CheckCircle', title: 'Uncompromising Quality', desc: 'Rigorous material testing and engineering precision in every phase of construction.' },
        { icon: 'Users', title: 'Community Impact', desc: 'Building sustainably and empowering local talent to foster long-term national development.' }
    ]

    const hero = aboutContent?.hero

    return (
        <div className="flex flex-col w-full">
            <SeoHead profile={seoProfiles.about} />
            <PageHero 
                title={hero?.title || <>Two Decades of Building <span className="text-teal-500">Malawi's Future</span></>}
                description={hero?.description || "Since 2006, Fortune Construction has been a cornerstone of infrastructure development, delivering excellence through engineering precision and unwavering commitment to safety."}
                imageSrc={hero?.image || "https://images.unsplash.com/photo-1541888086925-920a0f6707dd?q=80&w=2000&auto=format&fit=crop&fm=webp"}
                imageAlt={hero?.title || "Construction in Malawi"}
            />

            {/* Vision & Mission */}
            <section className="relative section-padding overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 -z-10" />
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 px-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-2xl shadow-2xl shadow-slate-200 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 relative group overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-teal-500" />
                        <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center text-teal-600 mb-8 group-hover:scale-110 transition-transform duration-500">
                            <Target className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-6">{vision?.title || 'Our Vision'}</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg font-light">
                            {vision?.description || 'To be the premier civil engineering and construction firm in East Africa, recognized for delivering world-class infrastructure that drives economic growth and improves the quality of life in the communities we serve.'}
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="bg-slate-900 dark:bg-slate-950 p-10 md:p-14 rounded-2xl shadow-2xl relative group overflow-hidden dark"
                    >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-teal-600" />
                        <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-500 mb-8 group-hover:scale-110 transition-transform duration-500">
                            <Shield className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6 tracking-tight">{mission?.title || 'Our Mission'}</h2>
                        <p className="text-slate-200 leading-relaxed text-lg font-light">
                            {mission?.description || 'To provide exceptional construction services through innovation, rigorous quality control, and an uncompromising commitment to Health, Safety, and Environment (HSE) standards, ensuring every project stands the test of time.'}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Interactive Timeline */}
            <section className="relative section-padding overflow-hidden">
                <div className="absolute inset-0 bg-white dark:bg-slate-950 -z-10" />
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-slate-50 dark:from-slate-900 to-transparent -z-10" />
                
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase text-teal-600 bg-teal-50 dark:bg-teal-900/20 rounded-full"
                        >
                            {timeline?.subtitle || 'Our Journey'}
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white leading-tight"
                        >
                            {timeline?.title || 'A Legacy of Excellence'}
                        </motion.h2>
                    </div>

                    <div className="relative">
                        {/* Central Line */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-teal-500/30 to-transparent transform md:-translate-x-1/2" />

                        {timelineItems.map((item: any, index: number) => (
                            <motion.div 
                                key={item.year}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`relative flex flex-col md:flex-row gap-8 mb-20 last:mb-0 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* Timeline Dot */}
                                <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-teal-500 transform -translate-x-1 md:-translate-x-1/2 mt-2.5 z-10 shadow-[0_0_15px_rgba(20,184,166,0.5)] ring-4 ring-white dark:ring-slate-950" />
                                
                                {/* Spacing for Desktop */}
                                <div className="hidden md:block w-1/2" />
                                
                                {/* Content Card */}
                                <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${index % 2 === 0 ? 'md:pr-12 text-left md:text-right' : 'md:pl-12 text-left'}`}>
                                    <div className="group relative">
                                        <div className={`absolute top-0 ${index % 2 === 0 ? 'md:-right-2' : 'md:-left-2'} hidden md:block w-4 h-4 bg-white dark:bg-slate-900 border-t border-l border-slate-100 dark:border-slate-800 transform ${index % 2 === 0 ? 'rotate-[135deg]' : '-rotate-45'} translate-y-6 z-10`} />
                                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 hover:border-teal-500/20 transition-all duration-500 overflow-hidden">
                                            <div className={`absolute top-0 left-0 w-1.5 h-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity ${index % 2 === 0 ? 'md:left-auto md:right-0' : ''}`} />
                                            <div className="text-teal-600 dark:text-teal-400 font-display font-black text-4xl mb-3 tracking-tighter opacity-20 group-hover:opacity-100 transition-opacity duration-500">{item.year}</div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-teal-600 transition-colors">{item.title}</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="relative section-padding overflow-hidden">
                <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900/50 -z-10" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <motion.span 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black tracking-[0.2em] uppercase text-teal-600 bg-teal-50 dark:bg-teal-900/20 rounded-full"
                        >
                            {coreValues?.subtitle || 'What Drives Us'}
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-display font-bold text-slate-900 dark:text-white"
                        >
                            {coreValues?.title || 'Our Core Values'}
                        </motion.h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {valueItems.map((value: any, idx: number) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group text-center"
                            >
                                <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 rounded-[2rem] flex items-center justify-center text-teal-600 mb-10 mx-auto transition-all duration-500 group-hover:bg-teal-600 group-hover:text-white group-hover:rounded-2xl group-hover:rotate-6">
                                    <div className="scale-125">{renderIcon(value.icon)}</div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{value.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Leadership Team */}
            <section className="relative section-padding bg-white dark:bg-slate-950 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <div className="inline-block w-12 h-1 bg-teal-500 rounded-full mb-6 mx-auto" />
                        <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-6">Our Leadership</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed text-lg">
                            An elite team of experienced professionals committed to delivering engineering excellence in every project across Malawi.
                        </p>
                    </div>
                    {leaders.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                            {leaders.map((leader: any, idx: number) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group"
                                >
                                    <div className="relative overflow-hidden rounded-2xl mb-6 aspect-[4/5] shadow-lg shadow-slate-200 dark:shadow-black/20">
                                        <Image 
                                            src={leader.img} 
                                            alt={leader.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                            <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">{leader.role}</p>
                                            {(leader.links.linkedin || leader.links.twitter) && (
                                                <div className="mt-4 flex items-center gap-3">
                                                    {leader.links.linkedin && (
                                                        <a
                                                            href={leader.links.linkedin}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            aria-label={`${leader.name} LinkedIn profile`}
                                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-900 transition-colors hover:bg-teal-400 hover:text-white"
                                                            onClick={(event) => event.stopPropagation()}
                                                        >
                                                            <Linkedin className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                    {leader.links.twitter && (
                                                        <a
                                                            href={leader.links.twitter}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            aria-label={`${leader.name} Twitter profile`}
                                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-900 transition-colors hover:bg-teal-400 hover:text-white"
                                                            onClick={(event) => event.stopPropagation()}
                                                        >
                                                            <Twitter className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-teal-600 transition-colors">{leader.name}</h3>
                                    <p className="text-teal-600 dark:text-teal-500 text-[10px] font-black uppercase tracking-[0.2em]">{leader.role}</p>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-20">
                            <EmptyState
                                icon={Users}
                                title="Leadership Profiles Pending"
                                description="The team member profiles are currently being updated. Please check back soon."
                            />
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
