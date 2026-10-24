import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Container, PageHero, Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@fortune/shared-ui'
import { ShieldCheck, HardHat, Leaf, Award, Download, Search, Type, Smile, Phone, Mail, MapPin, Clock, Share2, Globe, Settings, Users, Briefcase, Building2, Construction, CheckCircle2, AlertCircle, Info, ExternalLink, ChevronRight, Route, Home, CheckCircle, TrendingUp } from 'lucide-react'
import ApplicationForm from '@/components/ApplicationForm'
import { apiFetch } from '@/lib/apiClient'
import { usePageContent } from '@/hooks/usePageContent'
import { SeoHead } from '@/components/SeoHead'
import { seoProfiles } from '@/lib/seo'

const ICON_MAP: Record<string, any> = {
    ShieldCheck, HardHat, Leaf, Award, Download, Search, Type, Smile, Phone, Mail, MapPin, Clock, Share2, Globe, Settings, Users, Briefcase, Building2, Construction, CheckCircle2, AlertCircle, Info, ExternalLink, ChevronRight, Route, Home, CheckCircle, TrendingUp
}

function isImageUrl(str?: string) {
    if (!str) return false
    return str.startsWith('http') || str.startsWith('/') || str.startsWith('data:')
}

function renderBenefitIcon(icon?: string) {
    if (!icon) return <Briefcase className="w-7 h-7" />
    if (isImageUrl(icon)) return <img src={icon} alt="" className="w-7 h-7 object-contain" />
    const IconComp = ICON_MAP[icon]
    if (IconComp) return <IconComp className="w-7 h-7" />
    return <Briefcase className="w-7 h-7" />
}


function EmptyState({ icon: Icon, title, description }: { icon?: any, title: string, description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && <div className="mb-4 text-gray-400"><Icon className="w-16 h-16" /></div>}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 max-w-md mb-6">{description}</p>}
    </div>
  )
}

interface ApiJob {
    _id: string; title: string; location: string; type: string;
    description: string; requirements: string[]; isActive: boolean;
}

interface CareersContent {
    hero?: { title?: string; description?: string; image?: string }
    benefits?: { title?: string; subtitle?: string; items?: { title: string; desc: string; icon?: string }[] }
}

export default function CareersPage() {
    const { data: apiJobs } = useQuery<ApiJob[]>({
        queryKey: ['jobs'],
        queryFn: () => apiFetch<ApiJob[]>('/jobs'),
        staleTime: 60_000,
    })

    const { data: careersContent } = usePageContent<CareersContent>('careers')

    const jobs = apiJobs?.filter(j => j.isActive) || []

    const benefitsData = careersContent?.benefits
    const benefitItems = benefitsData?.items?.length ? benefitsData.items : [
        { title: 'Career Growth', desc: 'Clear progression paths and continuous professional development programs.', icon: 'TrendingUp' },
        { title: 'Major Projects', desc: 'Work on landmark infrastructure that shapes the future of Malawi.', icon: 'Building2' },
        { title: 'Competitive Package', desc: 'Industry-leading salary, health insurance, and performance bonuses.', icon: 'Briefcase' },
        { title: 'Safety First Culture', desc: 'A work environment where your health and wellbeing are the top priority.', icon: 'HardHat' },
    ]

    const hero = careersContent?.hero

    return (
        <div className="flex flex-col w-full bg-background min-h-screen">
            <SeoHead profile={seoProfiles.careers} />
            <PageHero 
                title={hero?.title || <>Build Your Future with <span className="text-teal-500">Fortune</span></>}
                description={hero?.description || "Join a team of driven professionals dedicated to engineering excellence. We don't just build infrastructure; we build careers."}
                imageSrc={hero?.image || "/assets/images/site/lunzu-06.webp"}
                imageAlt={hero?.title || "Fortune Construction team on site at Lunzu"}
            />

            {/* Benefits */}
            <section className="relative section-padding overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 -z-10" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                
                <Container>
                    <div className="text-center mb-20">
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase text-teal-600 bg-teal-50 dark:bg-teal-900/20 rounded-full"
                        >
                            {benefitsData?.subtitle || 'Why Join Us'}
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white leading-tight"
                        >
                            {benefitsData?.title || 'More Than Just a Job'}
                        </motion.h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefitItems.map((benefit, i) => (
                            <motion.div 
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="group relative bg-white dark:bg-slate-900 p-8 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-t-xl" />
                                <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-lg flex items-center justify-center text-teal-600 mb-8 transition-colors group-hover:bg-teal-600 group-hover:text-white">
                                    {renderBenefitIcon(benefit.icon)}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{benefit.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 font-light leading-relaxed">{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Jobs & Form Layout */}
            <section className="relative section-padding bg-white dark:bg-slate-950">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-slate-50 dark:from-slate-900 to-transparent -z-10" />
                <Container>
                    <div className="grid lg:grid-cols-12 gap-16">
                        {/* Jobs List */}
                        <div className="lg:col-span-7">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-1 bg-teal-500 rounded-full" />
                                <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Open Positions</h2>
                            </div>
                            {jobs.length > 0 ? (
                                <Accordion type="single" collapsible className="space-y-6">
                                    {jobs.map((job: ApiJob) => (
                                        <AccordionItem key={job._id} value={job._id}>
                                            <AccordionTrigger className="hover:no-underline">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between w-full pr-4 gap-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold transition-colors">{job.title}</h3>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                            <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-teal-500" /> {job.location}</span>
                                                            <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-teal-500" /> {job.type}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="pt-4">
                                                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-lg">{job.description}</p>
                                                    <div className="space-y-6">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-[0.2em] flex items-center">
                                                            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3" />
                                                            Candidate Requirements
                                                        </h4>
                                                        <div className="grid md:grid-cols-2 gap-3">
                                                            {job.requirements.map((req: string, idx: number) => (
                                                                <div key={idx} className="flex items-start bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                                                                    <div className="w-1 h-1 rounded-full bg-teal-500 mt-2.5 mr-3 flex-shrink-0" />
                                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight">{req}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <EmptyState
                                        icon={Briefcase}
                                        title="No open positions"
                                        description="We don't have any job openings at the moment. Please check back later or submit your CV for future opportunities."
                                    />
                                </div>
                            )}
                        </div>

                        {/* Application Form Column */}
                        <div className="lg:col-span-5">
                            <div className="sticky top-28">
                                <ApplicationForm />
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    )
}
