import { Image, Container, PageHero } from '@fortune/shared-ui'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'
import { ContactForm } from '@/components/contact/ContactForm'
import { SeoHead } from '@/components/SeoHead'
import { contactStructuredData, seoProfiles } from '@/lib/seo'

import { usePageContent } from '@/hooks/usePageContent'

interface SiteSettings {
    companyName: string; tagline: string; phone: string; email: string; address: string; workingHoursDisplay: string;
}

interface ContactContent {
    hero?: { title?: string; description?: string; image?: string }
}

export default function ContactPage() {
    const { data: settings } = useQuery<SiteSettings>({
        queryKey: ['settings'],
        queryFn: () => apiFetch<SiteSettings>('/settings'),
        staleTime: 60_000,
    })

    const { data: contactContent } = usePageContent<ContactContent>('contact')
    const hero = contactContent?.hero

    // Contact details come only from Site Settings; an empty value hides its row.
    const address = settings?.address?.trim() || ''
    const phone = settings?.phone?.trim() || ''
    const email = settings?.email?.trim() || ''
    const workingHours = settings?.workingHoursDisplay?.trim() || ''

    return (
        <div className="flex flex-col w-full bg-background min-h-screen">
            <SeoHead profile={{ ...seoProfiles.contact, structuredData: contactStructuredData({ phone, email, address }) }} />
            <PageHero 
                title={hero?.title || "Let's Build Something Together"}
                description={hero?.description || "Ready to start your next infrastructure project? Get in touch with our team of experts today."}
                imageSrc={hero?.image || "/assets/images/site/lunzu-05.webp"}
                imageAlt={hero?.title || "Fortune Construction site works at Lunzu"}
            />

            {/* Main Content */}
            <section className="relative section-padding overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 -z-10" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                
                <Container>
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
                        {/* Contact Info Column */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-5 space-y-12"
                        >
                            <div>
                                <motion.span 
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black tracking-[0.3em] uppercase text-teal-600 bg-teal-50 dark:bg-teal-900/20 rounded-full"
                                >
                                    Get In Touch
                                </motion.span>
                                <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-8 tracking-tight">Let's Build Something <span className="text-teal-500">Legendary</span></h2>
                                <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed text-lg">
                                    Fortune Construction is Malawi's premier choice for high-impact infrastructure. From strategic consultation to massive civil engineering execution, our team is ready to deliver world-class excellence for your next vision.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { icon: <MapPin className="w-6 h-6" />, title: 'Corporate Headquarters', content: address },
                                    { icon: <Phone className="w-6 h-6" />, title: 'Strategic Inquiries', content: phone },
                                    { icon: <Mail className="w-6 h-6" />, title: 'Official Email', content: email },
                                    { icon: <Clock className="w-6 h-6" />, title: 'Business Hours', content: workingHours },
                                ].filter((item) => item.content).map((item, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start group hover:shadow-xl hover:border-teal-500/30 transition-all duration-500"
                                    >
                                        <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center text-teal-600 mr-6 flex-shrink-0 group-hover:bg-teal-600 group-hover:text-white group-hover:rounded-xl transition-all duration-500">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 text-lg">{item.title}</h4>
                                            <div className="text-slate-500 dark:text-slate-400 font-light leading-relaxed text-sm">{item.content}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Form Column */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 md:p-14 rounded-3xl shadow-2xl shadow-slate-200 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-500" />
                            <div className="mb-10">
                                <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-3">Project Consultation</h3>
                                <p className="text-slate-500 dark:text-slate-400">Complete the secure form below. A senior representative will contact you within 24 hours.</p>
                            </div>
                            <ContactForm />
                        </motion.div>
                    </div>
                </Container>
            </section>

            {/* Map Placeholder */}
            <section className="h-[500px] relative group overflow-hidden border-t border-slate-100 dark:border-slate-800">
                <Image 
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop&fm=webp" 
                    alt="Map view" 
                    className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-110 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-10 py-6 rounded-2xl font-display font-black text-slate-900 dark:text-white shadow-2xl flex items-center text-xl border border-white dark:border-slate-800"
                    >
                        <div className="w-3 h-3 rounded-full bg-teal-500 animate-ping absolute -top-1 -right-1" />
                        <MapPin className="text-teal-500 mr-4 w-7 h-7" /> Lilongwe, Malawi
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
