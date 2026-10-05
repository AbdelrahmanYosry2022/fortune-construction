import Services from '@/components/Services'
import { SeoHead } from '@/components/SeoHead'
import { seoProfiles, servicesStructuredData } from '@/lib/seo'
import { PageHero } from '@fortune/shared-ui'

export default function ServicesPage() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-white dark:bg-slate-950">
            <SeoHead profile={{ ...seoProfiles.services, structuredData: servicesStructuredData() }} />
            <PageHero
                title={<>Construction Services for <span className="text-teal-500">National Progress</span></>}
                description="Fortune Construction delivers full-scope civil engineering, building, structural, and infrastructure services across Malawi."
                imageSrc="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2200&auto=format&fit=crop&fm=webp"
                imageAlt="Construction team working on a large building site"
            />
            <Services />
        </div>
    )
}
