import { Image, Container, SectionHeader } from '@fortune/shared-ui'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'

interface ApiPartner { _id: string; name: string; abbr?: string; logo?: string; website?: string; description?: string; order: number }

interface PartnersSectionProps {
    variant?: 'simple' | 'detailed'
}

export default function PartnersSection({ variant = 'simple' }: PartnersSectionProps) {
    const { data: apiPartners } = useQuery<ApiPartner[]>({
        queryKey: ['partners'],
        queryFn: () => apiFetch<ApiPartner[]>('/partners'),
        staleTime: 60_000,
    })

    // Only real partners from the API are shown; hide the section when there are none.
    const partners = (apiPartners ?? []).map(p => ({
        name: p.name,
        type: '',
        logo: p.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.abbr || p.name)}&background=06162d&color=fff&size=128`,
    }))

    if (partners.length === 0) return null

    if (variant === 'simple') {
        return (
            <section className="py-16 bg-white dark:bg-slate-950 overflow-hidden border-y border-slate-100 dark:border-slate-800">
                <Container>
                    <div className="text-center mb-12">
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 dark:text-slate-500">Global Strategic Alliances</span>
                    </div>
                    {/* CSS Marquee animation */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10" />
                        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10" />
                        
                        <div className="flex space-x-16 animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
                            {[...partners, ...partners].map((partner, i) => (
                                <div key={i} className="flex-shrink-0 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700 hover:scale-110">
                                    <Image src={partner.logo} alt={partner.name} className="h-16 w-auto max-w-[120px] object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>
        )
    }

    return (
        <section className="relative section-padding overflow-hidden">
            <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900/50 -z-10" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
            
            <Container>
                <SectionHeader
                    subtitle="Our Network"
                    title="Corporate Partnerships"
                    description="We collaborate with premier government bodies, financial institutions, and global NGOs to deliver engineering excellence across Malawi."
                />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {partners.map((partner, i) => (
                        <motion.div 
                            key={partner.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col items-center text-center group"
                        >
                            <div className="relative w-20 h-20 mb-6 group-hover:scale-110 transition-transform duration-500">
                                <div className="absolute inset-0 bg-teal-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Image 
                                    src={partner.logo} 
                                    alt={partner.name} 
                                    className="h-full w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700 opacity-40 group-hover:opacity-100 relative z-10" 
                                />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1 group-hover:text-teal-600 transition-colors">{partner.name}</h4>
                            <span className="text-[10px] text-teal-600 dark:text-teal-500 font-black uppercase tracking-widest">{partner.type}</span>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
