import type { ProjectRecord } from '@/lib/projectPresentation'
import { SITE } from '@/lib/constants'

export type SeoRouteKey =
    | 'home'
    | 'about'
    | 'projects'
    | 'services'
    | 'hse'
    | 'careers'
    | 'contact'
    | 'projectDetail'
    | 'notFound'
    | 'appError'

export interface SeoProfile {
    key: SeoRouteKey
    title: string
    description: string
    canonicalPath: string
    indexable?: boolean
    imagePath?: string
    social: SocialPreviewProfile
    structuredData?: Array<Record<string, unknown>>
}

export type StructuredDataItem = Record<string, unknown> & {
    '@context': 'https://schema.org'
    '@type': string | string[]
}

export interface SocialPreviewProfile {
    title: string
    description: string
    imagePath: string
    type: 'website'
}

const PRODUCTION_SITE_URL = 'https://fortuneconstruction.net'

function normalizeBaseUrl(value?: string): string {
    const candidate = (value || '').trim().replace(/\/+$/, '')
    if (!candidate) return PRODUCTION_SITE_URL

    try {
        const url = new URL(candidate)
        const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
        if (isLocalhost) return PRODUCTION_SITE_URL
        return url.origin
    } catch {
        return PRODUCTION_SITE_URL
    }
}

export function getPublicSiteUrl(): string {
    return normalizeBaseUrl(import.meta.env.VITE_PUBLIC_SITE_URL)
}

export function buildCanonicalUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const normalizedPath = cleanPath === '/' ? '/' : cleanPath.replace(/\/+$/, '')
    return `${getPublicSiteUrl()}${normalizedPath}`
}

export function absoluteSeoImage(path = '/Logo-new-01.png'): string {
    if (/^https?:\/\//i.test(path)) return path
    return buildCanonicalUrl(path)
}

const defaultImage = '/Logo-new-01.png'
const serviceStructuredDataItems = [
    {
        name: 'Roads & Infrastructure',
        description: "Road infrastructure including highways, drainage systems, bridges, culverts, and rehabilitation across Malawi's terrain.",
    },
    {
        name: 'Building & Commercial Construction',
        description: 'Commercial offices, government facilities, schools, hospitals, and residential estates.',
    },
    {
        name: 'Bridges & Structural Works',
        description: 'Bridge construction, steel structures, retaining walls, and structural rehabilitation.',
    },
]

function socialPreview(title: string, description: string, imagePath = defaultImage): SocialPreviewProfile {
    return {
        title,
        description,
        imagePath,
        type: 'website',
    }
}

export const seoProfiles: Record<Exclude<SeoRouteKey, 'projectDetail'>, SeoProfile> = {
    home: {
        key: 'home',
        title: 'Fortune Construction | Malawi Construction & Civil Engineering',
        description: "Fortune Construction delivers civil engineering, infrastructure, buildings, bridges, and project management services across Malawi.",
        canonicalPath: '/',
        indexable: true,
        imagePath: defaultImage,
        social: socialPreview(
            'Fortune Construction | Malawi Construction & Civil Engineering',
            "Discover Fortune Construction's civil engineering, infrastructure, and building work across Malawi.",
        ),
    },
    about: {
        key: 'about',
        title: 'About Fortune Construction | Building Malawi',
        description: "Learn about Fortune Construction's engineering heritage, safety culture, and infrastructure work across Malawi.",
        canonicalPath: '/about',
        indexable: true,
        imagePath: defaultImage,
        social: socialPreview(
            'About Fortune Construction | Building Malawi',
            "Learn about the values behind Fortune Construction's infrastructure work across Malawi.",
        ),
    },
    projects: {
        key: 'projects',
        title: 'Project Portfolio | Fortune Construction Malawi',
        description: "Explore Fortune Construction case studies across roads, bridges, buildings, infrastructure, and commercial projects in Malawi.",
        canonicalPath: '/projects',
        indexable: true,
        imagePath: defaultImage,
        social: socialPreview(
            'Project Portfolio | Fortune Construction Malawi',
            'Explore roads, bridges, buildings, and infrastructure projects delivered by Fortune Construction.',
        ),
    },
    services: {
        key: 'services',
        title: 'Construction Services | Fortune Construction Malawi',
        description: "Review Fortune Construction services for roads, infrastructure, commercial buildings, bridges, structural works, and project delivery.",
        canonicalPath: '/services',
        indexable: true,
        imagePath: defaultImage,
        social: socialPreview(
            'Construction Services | Fortune Construction Malawi',
            'Review Fortune Construction services for infrastructure, buildings, bridges, and project delivery.',
        ),
    },
    hse: {
        key: 'hse',
        title: 'Health, Safety & Quality | Fortune Construction',
        description: "See how Fortune Construction manages health, safety, environment, and quality assurance across construction projects.",
        canonicalPath: '/hse',
        indexable: true,
        imagePath: defaultImage,
        social: socialPreview(
            'Health, Safety & Quality | Fortune Construction',
            "See Fortune Construction's safety, quality, and environment standards.",
        ),
    },
    careers: {
        key: 'careers',
        title: 'Careers | Join Fortune Construction Malawi',
        description: "Find construction, engineering, project management, and HSE career opportunities with Fortune Construction in Malawi.",
        canonicalPath: '/careers',
        indexable: true,
        imagePath: defaultImage,
        social: socialPreview(
            'Careers | Join Fortune Construction Malawi',
            'Explore construction, engineering, project management, and HSE opportunities with Fortune Construction.',
        ),
    },
    contact: {
        key: 'contact',
        title: 'Contact Fortune Construction | Project Consultation in Malawi',
        description: "Contact Fortune Construction for infrastructure, building, civil engineering, and project consultation inquiries in Malawi.",
        canonicalPath: '/contact',
        indexable: true,
        imagePath: defaultImage,
        social: socialPreview(
            'Contact Fortune Construction | Project Consultation in Malawi',
            'Start a project consultation with Fortune Construction for infrastructure and building work in Malawi.',
        ),
    },
    notFound: {
        key: 'notFound',
        title: 'Page Not Found | Fortune Construction',
        description: 'The requested Fortune Construction page could not be found.',
        canonicalPath: '/404',
        indexable: false,
        imagePath: defaultImage,
        social: socialPreview(
            'Page Not Found | Fortune Construction',
            'The requested Fortune Construction page could not be found.',
        ),
    },
    appError: {
        key: 'appError',
        title: 'Service Temporarily Unavailable | Fortune Construction',
        description: 'Fortune Construction could not load this page right now. Please reload or return home.',
        canonicalPath: '/error',
        indexable: false,
        imagePath: defaultImage,
        social: socialPreview(
            'Service Temporarily Unavailable | Fortune Construction',
            'Fortune Construction could not load this page right now. Please reload or return home.',
        ),
    },
}

export function projectSocialPreview(project?: ProjectRecord): SocialPreviewProfile {
    const title = project?.title || 'Fortune Construction Project Case Study'
    const category = project?.category || 'Construction'
    const location = project?.location ? ` in ${project.location}` : ''
    return socialPreview(
        `${title} | Fortune Construction Case Study`,
        project?.overview || `${category} project case study${location} by Fortune Construction Malawi.`,
        project?.coverImage || defaultImage,
    )
}

export function projectSeoProfile(project?: ProjectRecord, id?: string): SeoProfile {
    const title = project?.title || 'Project Case Study'
    const location = project?.location ? ` in ${project.location}` : ''
    const category = project?.category || 'Construction'
    return {
        key: 'projectDetail',
        title: `${title} | Fortune Construction Case Study`,
        description: project?.overview || `${category} project case study${location} by Fortune Construction Malawi.`,
        canonicalPath: `/projects/${project?._id || id || '1'}`,
        indexable: Boolean(project),
        imagePath: project?.coverImage || defaultImage,
        social: projectSocialPreview(project),
    }
}

// Phone and email are only published when they are actually set (no placeholders).
function contactPoints(phone?: string, email?: string): { telephone?: string; email?: string } {
    const points: { telephone?: string; email?: string } = {}
    if (phone?.trim()) points.telephone = phone.trim()
    if (email?.trim()) points.email = email.trim()
    return points
}

function businessPostalAddress(): StructuredDataItem {
    return {
        '@context': 'https://schema.org',
        '@type': 'PostalAddress',
        streetAddress: SITE.address,
        addressLocality: 'Lilongwe',
        addressCountry: 'MW',
    }
}

function baseBusinessStructuredData(): StructuredDataItem {
    return {
        '@context': 'https://schema.org',
        '@type': ['Organization', 'HomeAndConstructionBusiness'],
        name: SITE.name,
        url: buildCanonicalUrl('/'),
        logo: absoluteSeoImage(defaultImage),
        description: SITE.tagline,
        ...contactPoints(SITE.phone, SITE.email),
        address: businessPostalAddress(),
        foundingDate: String(SITE.foundedYear),
        areaServed: 'Malawi',
    }
}

export function organizationStructuredData(): StructuredDataItem[] {
    return [baseBusinessStructuredData()]
}

export function contactStructuredData(contact?: Partial<{ phone: string; email: string; address: string }>): StructuredDataItem[] {
    const phone = contact?.phone || SITE.phone
    const email = contact?.email || SITE.email
    const address = contact?.address || SITE.address

    return [
        {
            ...baseBusinessStructuredData(),
            ...contactPoints(phone, email),
            address: {
                ...businessPostalAddress(),
                streetAddress: address,
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: `Contact ${SITE.name}`,
            url: buildCanonicalUrl('/contact'),
            mainEntity: {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: SITE.name,
                ...contactPoints(phone, email),
                address: {
                    ...businessPostalAddress(),
                    streetAddress: address,
                },
            },
        },
    ]
}

export function servicesStructuredData(): StructuredDataItem[] {
    return [
        baseBusinessStructuredData(),
        ...serviceStructuredDataItems.map((service) => ({
            '@context': 'https://schema.org' as const,
            '@type': 'Service',
            name: service.name,
            description: service.description,
            provider: {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: SITE.name,
                url: buildCanonicalUrl('/'),
            },
            areaServed: 'Malawi',
            url: buildCanonicalUrl('/services'),
        })),
    ]
}
