import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react'
import { Container } from '@fortune/shared-ui'
import { FooterMap } from './footer/FooterMap'
import { FooterLinks } from './footer/FooterLinks'
import { SITE } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'

interface SiteSettings {
    companyName: string; tagline: string; phone: string; email: string; address: string;
    foundedYear: number; socialFacebook: string; socialTwitter: string; socialLinkedin: string; socialYoutube: string;
}

// Privacy Policy and Terms of Service stay hidden until those pages exist.
const LEGAL_LINKS = [{ label: 'Sitemap', href: '/sitemap.xml' }]

export default function Footer() {
    const { data: settings } = useQuery<SiteSettings>({
        queryKey: ['settings'],
        queryFn: () => apiFetch<SiteSettings>('/settings'),
        staleTime: 60_000,
    })

    const companyName = settings?.companyName || SITE.name
    const foundedYear = settings?.foundedYear || SITE.foundedYear

    const socialLinks = [
        { icon: <Facebook className="w-4 h-4" />, href: settings?.socialFacebook || '', label: 'Facebook' },
        { icon: <Twitter className="w-4 h-4" />, href: settings?.socialTwitter || '', label: 'Twitter' },
        { icon: <Linkedin className="w-4 h-4" />, href: settings?.socialLinkedin || '', label: 'LinkedIn' },
        { icon: <Youtube className="w-4 h-4" />, href: settings?.socialYoutube || '', label: 'YouTube' },
    ].filter(s => s.href)

    return (
        <footer id="footer" className="bg-slate-950 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <FooterMap />

            {/* Main footer content */}
            <div className="relative z-10 pt-24 pb-12">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-12 mb-20">
                        {/* Brand Column */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center mb-10 group">
                                <img
                                    src="/Logo-new-01.png"
                                    alt={`${SITE.name} Logo`}
                                    className="h-12 md:h-16 w-auto object-contain brightness-0 invert transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed mb-10 font-light max-w-xs">
                                Since {foundedYear}, Fortune Construction has been Malawi's premier engineering firm, architecting national progress with uncompromising integrity.
                            </p>

                            {/* Strategic Social Presence */}
                            {socialLinks.length > 0 && (
                                <div className="flex gap-4">
                                    {socialLinks.map((s) => (
                                        <a
                                            key={s.label}
                                            href={s.href}
                                            aria-label={s.label}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-11 h-11 bg-white/5 hover:bg-teal-600 rounded-xl flex items-center justify-center text-white/40 hover:text-white border border-white/5 transition-all duration-500 group/social"
                                        >
                                            <div className="group-hover/social:scale-110 transition-transform duration-300">
                                                {s.icon}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Links Columns */}
                        <FooterLinks />

                        {/* Newsletter stays hidden until there is a backend that stores subscriptions. */}
                    </div>

                    {/* Bottom Legal Bar */}
                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                &copy; {new Date().getFullYear()} {companyName} Limited
                            </p>
                            <div className="hidden md:block w-1 h-1 rounded-full bg-slate-800" />
                            <p className="text-slate-600 text-[10px] font-medium uppercase tracking-widest">
                                Registered in the Republic of Malawi
                            </p>
                        </div>
                        
                        <div className="flex gap-8">
                            {LEGAL_LINKS.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="text-slate-500 hover:text-teal-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:translate-y-[-1px]"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </Container>
            </div>
        </footer>
    )
}
