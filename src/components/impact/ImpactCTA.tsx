import { Button } from '@fortune/shared-ui'
import { Link } from 'react-router-dom'

export function ImpactCTA() {
    return (
        <div className="mt-24 bg-slate-900 dark:bg-black rounded-[2.5rem] p-10 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/images/site/lunzu-04.webp')] bg-cover bg-center opacity-5 mix-blend-overlay scale-110 group-hover:scale-100 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10 text-center lg:text-left">
                <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                    Ready to build something <span className="text-teal-500 underline decoration-teal-500/30 underline-offset-8">remarkable?</span>
                </h3>
                <p className="text-slate-400 text-lg md:text-xl font-light">Join Malawi's most prestigious organizations in defining the future of infrastructure.</p>
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row gap-4">
                <Link to="/contact">
                    <Button
                        size="lg"
                        className="h-16 px-10 bg-teal-600 hover:bg-teal-500 text-white font-bold uppercase tracking-widest text-sm shadow-xl shadow-teal-500/20 transition-all duration-500 transform hover:-translate-y-1"
                    >
                        Secure Consultation
                    </Button>
                </Link>
            </div>
        </div>
    )
}
