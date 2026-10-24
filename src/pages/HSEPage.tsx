import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Container, SectionHeader, PageHero } from '@fortune/shared-ui'
import PartnersSection from '@/components/PartnersSection'
import { ShieldCheck, HardHat, Leaf, Award, Download, Search, Type, Smile, Phone, Mail, MapPin, Clock, Share2, Globe, Settings, Users, Briefcase, Building2, Construction, CheckCircle2, AlertCircle, Info, ExternalLink, ChevronRight } from 'lucide-react'
import { usePageContent } from '@/hooks/usePageContent'
import { SeoHead } from '@/components/SeoHead'
import { seoProfiles } from '@/lib/seo'

interface HSEContent {
    hero?: { title?: string; description?: string; image?: string }
    policies?: { items?: { title: string; description: string; icon?: string }[] }
    safetyStats?: { items?: { value: string; label: string }[] }
    certifications?: { title?: string; subtitle?: string; description?: string; items?: { title: string; image?: string }[] }
}

const POLICY_ICON_MAP: Record<string, any> = {
    ShieldCheck, HardHat, Leaf, Award, Download, Search, Type, Smile, Phone, Mail, MapPin, Clock, Share2, Globe, Settings, Users, Briefcase, Building2, Construction, CheckCircle2, AlertCircle, Info, ExternalLink, ChevronRight
}

function isImageUrl(str?: string) {
    if (!str) return false
    return str.startsWith('http') || str.startsWith('/') || str.startsWith('data:')
}

function renderPolicyIcon(icon?: string) {
    if (!icon) return <ShieldCheck className="w-10 h-10" />
    if (isImageUrl(icon)) return <img src={icon} alt="" className="w-10 h-10 object-contain" />
    const IconComp = POLICY_ICON_MAP[icon]
    if (IconComp) return <IconComp className="w-10 h-10" />
    return <ShieldCheck className="w-10 h-10" />
}

export default function HSEPage() {
    const { data: hseContent } = usePageContent<HSEContent>('hse')

    const policies = hseContent?.policies?.items?.length ? hseContent.policies.items : [
        { title: 'Health & Safety', description: 'Our "Zero Harm" policy ensures rigorous training, daily site briefings, and strict adherence to international safety protocols. Every worker returns home safely, every day.', icon: 'ShieldCheck' },
        { title: 'Quality Control', description: 'We source premium materials, conduct exhaustive structural testing, and utilize advanced engineering technologies to guarantee the longevity and resilience of our infrastructure.', icon: 'HardHat' },
        { title: 'Environmental Policy', description: "Dedicated to preserving Malawi's natural beauty, we minimize construction waste, optimize resource efficiency, and actively implement sustainable building practices.", icon: 'Leaf' },
    ]

    // Safety stats and certifications come only from page content; each block is hidden when empty.
    const stats = hseContent?.safetyStats?.items ?? []

    const certs = hseContent?.certifications
    const certItems = certs?.items ?? []

    const hero = hseContent?.hero

    return (
        <div className="flex flex-col w-full bg-background min-h-screen">
            <SeoHead profile={seoProfiles.hse} />
            <PageHero 
                title={hero?.title || <>Zero Compromise on <span className="text-teal-500">Safety & Quality</span></>}
                description={hero?.description || "Our commitment to Health, Safety, and Environment (HSE) and rigorous Quality Assurance is the foundation of every project we undertake."}
                imageSrc={hero?.image || "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop&fm=webp"}
                imageAlt={hero?.title || "Safety on construction site"}
            />

            {/* Core Policies */}
            <section className="relative section-padding overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 -z-10" />
                <Container>
                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                        {policies.map((policy: any, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-xl shadow-slate-200 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-500"
                            >
                                <div className="w-24 h-24 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-[2.5rem] flex items-center justify-center mb-10 group-hover:bg-teal-600 group-hover:text-white group-hover:rounded-2xl group-hover:rotate-6 transition-all duration-500 shadow-sm">
                                    {renderPolicyIcon(policy.icon)}
                                </div>
                                <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">{policy.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light">{policy.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Safety Stats Banner */}
            {stats.length > 0 && (
                <section className="py-24 bg-slate-900 dark:bg-black text-white relative overflow-hidden dark">
                    <div className="absolute inset-0 bg-[url('/assets/images/site/lunzu-03.webp')] bg-cover bg-center opacity-10 mix-blend-overlay scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-slate-900 opacity-60" />

                    <Container className="relative z-10">
                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center`}>
                            {stats.map((stat: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                    className="pt-8 md:pt-0"
                                >
                                    <div className="text-6xl md:text-7xl font-display font-black text-teal-400 mb-4 tracking-tighter drop-shadow-2xl">{stat.value}</div>
                                    <div className="text-[10px] tracking-[0.3em] uppercase text-teal-50/50 font-black">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </Container>
                </section>
            )}

            {/* Certifications */}
            {certItems.length > 0 && (
                <section className="relative section-padding bg-white dark:bg-slate-950 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                    <Container>
                        <div className="max-w-4xl mx-auto text-center mb-24">
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black tracking-[0.2em] uppercase text-teal-600 bg-teal-50 dark:bg-teal-900/20 rounded-full"
                            >
                                {certs?.subtitle || "Recognized Excellence"}
                            </motion.span>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-8">{certs?.title || "Our Accreditations"}</h2>
                            {certs?.description && (
                                <p className="text-slate-500 dark:text-slate-400 text-lg font-light leading-relaxed">
                                    {certs.description}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                            {certItems.map((cert: any, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -5 }}
                                    className="aspect-square bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center p-10 shadow-sm hover:shadow-2xl hover:border-teal-500/30 transition-all duration-500 group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                    <div className="text-center">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            {cert.image && isImageUrl(cert.image) ? (
                                                <img src={cert.image} alt={cert.title} className="w-16 h-16 mx-auto object-contain relative z-10" />
                                            ) : cert.image ? (
                                                <div className="w-16 h-16 mx-auto flex items-center justify-center relative z-10 text-slate-300 group-hover:text-teal-500 transition-colors duration-500">
                                                    {renderPolicyIcon(cert.image)}
                                                </div>
                                            ) : (
                                                <Award className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 group-hover:text-teal-500 transition-colors duration-500 relative z-10" />
                                            )}
                                        </div>
                                        <span className="font-bold text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-[0.2em] transition-colors duration-500">{cert.title}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Container>
                </section>
            )}

            {/* Partners Grid (renders nothing when there are no partners in the database) */}
            <PartnersSection variant="detailed" />

            {/* "Download Policy Framework (PDF)" section removed: there is no PDF to download. */}
        </div>
    )
}
