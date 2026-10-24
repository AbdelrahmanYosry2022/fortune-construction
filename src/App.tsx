import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, HardHat, Construction, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import Hero from '@/components/Hero'
import Impact from '@/components/Impact'
import Services from '@/components/Services'
import Partners from '@/components/Partners'
import { apiFetch } from '@/lib/apiClient'
import { Image, Button } from '@fortune/shared-ui'
import { normalizeProject, RawProject } from '@/lib/projectPresentation'
import { SeoHead } from '@/components/SeoHead'
import { organizationStructuredData, seoProfiles } from '@/lib/seo'

function App() {
    const { data: apiProjects, isLoading: projectsLoading } = useQuery<RawProject[]>({
        queryKey: ['projects'],
        queryFn: () => apiFetch<RawProject[]>('/projects'),
        staleTime: 60_000,
    })

    const featuredProjects = (apiProjects ?? []).slice(0, 3).map(normalizeProject)

    return (
        <div className="flex flex-col w-full bg-background">
            <SeoHead profile={{ ...seoProfiles.home, structuredData: organizationStructuredData() }} />
            <Hero />
            <Impact />
            <Services />
            
            {/* About Teaser Section */}
            <section className="relative section-padding overflow-hidden bg-slate-900 dark:bg-black text-white dark">
                <div className="absolute inset-0 bg-[url('/assets/images/site/lunzu-03.webp')] bg-cover bg-center opacity-10 mix-blend-overlay scale-110" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/40 to-transparent opacity-80" />
                
                <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex-1 text-center lg:text-left"
                    >
                        <motion.span 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="inline-block px-4 py-1.5 mb-8 text-[10px] font-black tracking-[0.3em] uppercase text-teal-400 bg-teal-500/10 rounded-full border border-teal-500/20"
                        >
                            Corporate Heritage
                        </motion.span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-8 tracking-tight">Building Malawi's Future <span className="text-teal-500 block lg:inline">With Precision</span></h2>
                        <p className="text-slate-300 text-lg md:text-xl mb-12 leading-relaxed font-light max-w-2xl mx-auto lg:mx-0">
                            For over two decades, Fortune Construction has defined the skyline of Malawi. Our engineering mastery and uncompromising commitment to safety make us the premier choice for national-scale infrastructure.
                        </p>
                <div className="flex flex-col sm:flex-row items-stretch justify-center lg:justify-start gap-6">
                            <Link to="/about" className="flex">
                                <Button size="lg" className="shadow-2xl shadow-teal-500/20 px-10 h-20 text-base font-bold uppercase tracking-widest bg-teal-600 hover:bg-teal-500 text-white border-none w-full sm:w-auto">
                                    Our Full Story <ArrowRight className="w-5 h-5 ml-3" />
                                </Button>
                            </Link>
                            <div className="flex items-center gap-6 px-10 py-4 bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl min-w-[300px] justify-center group/badge hover:bg-slate-800/60 transition-all duration-500">
                                <div className="text-teal-400 font-display font-black text-5xl group-hover/badge:scale-110 transition-transform duration-500 leading-none">20+</div>
                                <div className="text-[13px] font-black text-white uppercase tracking-[0.2em] leading-tight text-left">Years of<br />Elite Excellence</div>
                            </div>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="flex-1 w-full relative"
                    >
                        <div className="relative aspect-[4/5] lg:aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group">
                            <Image 
                                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop&fm=webp" 
                                alt="Construction Engineering Mastery" 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                            <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                <p className="text-white text-sm font-light italic leading-relaxed">
                                    "We don't just execute projects; we architect the foundations of national progress through elite engineering."
                                </p>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-600/20 rounded-full blur-3xl" />
                    </motion.div>
                </div>
            </section>

            {/* Projects Teaser Section */}
            <section className="relative section-padding overflow-hidden">
                <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 -z-10" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center lg:items-end mb-20 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center md:text-left"
                        >
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-teal-600 mb-4 block">Proven Performance</span>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Featured Portfolio</h2>
                        </motion.div>
                        <Link to="/projects">
                            <Button variant="outline" size="lg" className="font-black uppercase tracking-widest text-[10px] h-14 px-8 border-slate-200 dark:border-slate-800 hover:border-teal-500/30 hover:bg-teal-50 dark:hover:bg-teal-900/10">
                                View Full Portfolio <ArrowRight className="w-4 h-4 ml-3" />
                            </Button>
                        </Link>
                    </div>

                    {!projectsLoading && featuredProjects.length === 0 && (
                        <div className="border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
                            <p className="text-base leading-8 text-slate-500 dark:text-slate-400">
                                Our project portfolio is being updated.
                            </p>
                        </div>
                    )}

                    {featuredProjects.length > 0 && (
                        <div className="grid md:grid-cols-3 gap-8">
                            {featuredProjects.map((project, i) => (
                                <motion.div 
                                    key={project._id} 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                    className="group overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/30"
                                >
                                    <div className="aspect-[4/3] relative overflow-hidden">
                                        <Image 
                                            src={project.coverImage} 
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            alt={project.title}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                                            <Link to={`/projects/${project._id}`} className="text-white font-black tracking-[0.2em] uppercase text-[10px] flex items-center group/link">
                                                View Case Study <ArrowRight className="w-3.5 h-3.5 ml-2 transform group-hover/link:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                        <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                                            <span className="bg-teal-500 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-xl">
                                                {project.category}
                                            </span>
                                            <span className="bg-white/95 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-950 shadow-xl">
                                                {project.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-7 flex flex-col flex-grow relative">
                                        <div className="absolute top-0 left-7 w-12 h-1 bg-teal-500 -translate-y-full" />
                                        <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-5 group-hover:text-teal-600 transition-colors">
                                            {project.title}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-5 text-xs dark:border-slate-800">
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Value</div>
                                                <div className="mt-1 font-bold text-slate-900 dark:text-white">{project.projectValue}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Year</div>
                                                <div className="mt-1 font-bold text-slate-900 dark:text-white">{project.yearCompleted}</div>
                                            </div>
                                        </div>
                                        <div className="mt-5 flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                                            <MapPin className="w-4 h-4 mr-2 shrink-0 text-teal-500" />
                                            <span>{project.location}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Partners />

            {/* Contact Call to Action */}
            <section className="relative py-32 px-6 overflow-hidden bg-[#06162d] text-white dark">
                <div className="absolute inset-0 bg-[url('/assets/images/site/lunzu-06.webp')] bg-cover bg-center opacity-10 mix-blend-overlay scale-110" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl mx-auto text-center relative z-10"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-teal-500/10 rounded-[2.5rem] border border-teal-500/20 mb-12 text-teal-500 shadow-2xl shadow-teal-500/10 rotate-3 hover:rotate-0 transition-transform duration-500 mx-auto">
                        <HardHat className="w-12 h-12" />
                    </div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-8 tracking-tight leading-[1.1]">Ready to Engineer <span className="text-teal-500 block md:inline">The Impossible?</span></h2>
                    <p className="text-slate-200 text-xl md:text-2xl mb-16 max-w-3xl mx-auto font-light leading-relaxed">
                        Let's collaborate to build infrastructure that stands the test of time. Join Malawi's most elite engineering teams in crafting the future.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <Link to="/contact">
                            <Button size="lg" className="shadow-2xl shadow-teal-500/20 px-12 h-16 text-base font-bold uppercase tracking-widest bg-teal-600 hover:bg-teal-500 text-white border-none transition-all hover:-translate-y-1">
                                Secure Consultation <Construction className="w-5 h-5 ml-3" />
                            </Button>
                        </Link>
                        <Link to="/careers">
                            <Button variant="outline" size="lg" className="px-12 h-16 text-base font-bold uppercase tracking-widest text-white border-white/40 bg-white/5 hover:bg-white/10 hover:border-teal-400 transition-all hover:-translate-y-1 group">
                                <span className="group-hover:text-teal-400 transition-colors">Join Our Team</span>
                            </Button>
                        </Link>
                    </div>
                </motion.div>
                
                {/* Background Decor */}
                <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-teal-600/5 rounded-full blur-[120px] pointer-events-none" />
            </section>
        </div>
    )
}

export default App
