import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { Button } from '@fortune/shared-ui'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'
import { SITE } from '@/lib/constants'

interface SiteSettings {
    companyName: string
    tagline: string
    phone: string
    email: string
    address: string
    workingHoursDisplay: string
}

export function ContactInfo() {
    const { data: settings } = useQuery<SiteSettings>({
        queryKey: ['settings'],
        queryFn: () => apiFetch<SiteSettings>('/settings'),
        staleTime: 60_000,
    })

    // Phone, email and address come only from Site Settings; an empty value hides its row.
    const phone = settings?.phone?.trim() || ''
    const email = settings?.email?.trim() || ''
    const address = settings?.address?.trim() || ''
    const workingHours = settings?.workingHoursDisplay || SITE.workingHours
    const companyName = settings?.companyName || SITE.name
    const tagline = settings?.tagline || SITE.tagline
    const phoneHref = `tel:${phone.replace(/\s/g, '')}`

    const CONTACT_INFO = [
        {
            icon: <Phone className="w-5 h-5" />,
            label: 'Strategic Inquiries',
            value: phone,
            href: phoneHref,
        },
        {
            icon: <Mail className="w-5 h-5" />,
            label: 'Official Correspondence',
            value: email,
            href: `mailto:${email}`,
        },
        {
            icon: <MapPin className="w-5 h-5" />,
            label: 'Corporate Headquarters',
            value: address,
            href: SITE.mapsUrl,
        },
        {
            icon: <Clock className="w-5 h-5" />,
            label: 'Business Operations',
            value: workingHours,
            href: null,
        },
    ].filter((item) => item.value)
    return (
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-10 md:p-12 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-teal-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                <h3 className="font-display text-3xl font-bold mb-3 tracking-tight">{companyName}</h3>
                <p className="text-slate-400 text-sm mb-10 font-light leading-relaxed">{tagline}</p>

                <div className="space-y-8">
                    {CONTACT_INFO.map((item) => (
                        <div key={item.label} className="flex items-start gap-5 group/item">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-teal-500 border border-white/10 group-hover/item:bg-teal-600 group-hover/item:text-white transition-all duration-500">
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">{item.label}</p>
                                {item.href ? (
                                    <a href={item.href} className="text-white text-base font-medium hover:text-teal-400 transition-all duration-300">
                                        {item.value}
                                    </a>
                                ) : (
                                    <p className="text-white text-base font-medium">{item.value}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* The direct-line card only makes sense when a phone number is set. */}
            {phone && (
                <div className="bg-teal-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-teal-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <p className="font-display text-2xl font-bold mb-3 tracking-tight relative z-10">Expedited Response?</p>
                    <p className="text-teal-50/80 text-sm mb-8 font-light relative z-10">Our executive team monitors direct lines for urgent strategic consultations.</p>
                    <a href={phoneHref} className="relative z-10">
                        <Button
                            size="lg"
                            className="bg-white text-teal-600 hover:bg-teal-50 font-bold h-14 px-8 uppercase tracking-widest text-[10px] shadow-lg transition-all duration-500"
                        >
                            <Phone className="w-4 h-4 mr-3" />
                            Direct Line
                        </Button>
                    </a>
                </div>
            )}
        </div>
    )
}
