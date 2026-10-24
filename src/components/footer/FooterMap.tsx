import { MapPin, Phone, Mail } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'

interface SiteSettings {
    companyName: string; phone: string; email: string; address: string;
}

export function FooterMap() {
    const { data: settings } = useQuery<SiteSettings>({
        queryKey: ['settings'],
        queryFn: () => apiFetch<SiteSettings>('/settings'),
        staleTime: 60_000,
    })

    // Contact details come only from Site Settings; an empty value hides its item.
    const address = settings?.address?.trim() || ''
    const phone = settings?.phone?.trim() || ''
    const email = settings?.email?.trim() || ''

    return (
        <div className="bg-slate-900 dark:bg-black border-b border-white/5">
            {/* Contact quick info */}
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-teal-500/20 to-transparent" />
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                    <div className="flex-1">
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-teal-500 mb-4 block">Regional Presence</span>
                        <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">Visit Our Headquarters</h3>
                        <p className="text-slate-400 font-light max-w-xl leading-relaxed">
                            Our corporate headquarters in Lilongwe serves as the strategic hub for our operations across Malawi. Connect with our experts to discuss your infrastructure vision.
                        </p>
                    </div>
                    
                    <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: <MapPin className="w-5 h-5" />, label: 'Physical Address', value: address, href: SITE.mapsUrl },
                            { icon: <Phone className="w-5 h-5" />, label: 'Direct Line', value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
                            { icon: <Mail className="w-5 h-5" />, label: 'Support Email', value: email, href: `mailto:${email}` },
                        ].filter((item) => item.value).map((item, i) => (
                            <a 
                                key={i}
                                href={item.href || '#'} 
                                className="flex items-start gap-4 group/item"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-teal-500 group-hover/item:bg-teal-600 group-hover/item:text-white transition-all duration-500 flex-shrink-0">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{item.label}</p>
                                    <span className="text-xs text-slate-300 group-hover/item:text-white transition-colors block">{item.value}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
