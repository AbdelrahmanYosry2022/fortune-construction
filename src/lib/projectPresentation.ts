import { projectVisualFallback } from '@/lib/visualFallbacks'

export type ProjectStatus = 'Ongoing' | 'Completed'

export interface ProjectRecord {
    _id: string
    title: string
    category: string
    status: ProjectStatus
    location: string
    clientName: string
    projectValue: string
    budget: string
    duration: string
    yearCompleted: string
    overview: string
    scopeOfWork: string[]
    technologies: string[]
    challenge: string
    solution: string
    result: string
    coverImage: string
    galleryImages: string[]
    startDate?: string
    endDate?: string
    coordinates?: {
        lat: number
        lng: number
    }
}

export interface RawProject {
    _id?: string
    id?: string
    title: string
    category?: string
    status?: string
    location?: string
    clientName?: string
    client?: string
    projectValue?: string
    budget?: string | number
    duration?: string
    yearCompleted?: string | number
    completionDate?: string
    overview?: string
    description?: string
    scopeOfWork?: string[] | string
    technologies?: string[] | string
    methodsUsed?: string[] | string
    challenge?: string
    solution?: string
    result?: string
    coverImage?: string
    image?: string
    galleryImages?: string[]
    startDate?: string
    endDate?: string
    latitude?: number | string
    longitude?: number | string
    coordinates?: {
        lat?: number | string
        lng?: number | string
    }
}

const PROJECT_COORDINATES: Record<string, { lat: number; lng: number }> = {
    lilongwe: { lat: -13.9626, lng: 33.7741 },
    blantyre: { lat: -15.7861, lng: 35.0058 },
    mzuzu: { lat: -11.4656, lng: 34.0207 },
    nkhata: { lat: -11.6066, lng: 34.2907 },
    salima: { lat: -13.7804, lng: 34.4587 },
    zomba: { lat: -15.385, lng: 35.3188 },
    kasungu: { lat: -13.0333, lng: 33.4833 },
}

const CATEGORY_SCOPE: Record<string, string[]> = {
    Roads: ['Earthworks and sub-base preparation', 'Asphalt surfacing and drainage', 'Road safety furniture and final handover'],
    Bridges: ['Foundation and piling works', 'Structural concrete and steel installation', 'Approach roads and safety systems'],
    Commercial: ['Shell and core construction', 'MEP coordination', 'Facade, fit-out readiness, and commissioning'],
    Residential: ['Civil and structural works', 'Utility connections', 'External works and handover'],
    Industrial: ['Heavy-duty foundations', 'Utility yards and access roads', 'Operational safety and commissioning'],
    Government: ['Public-sector project delivery', 'Compliance documentation', 'Quality assurance and handover'],
    Infrastructure: ['Civil works delivery', 'Drainage and access infrastructure', 'Quality assurance and final handover'],
}

const CATEGORY_METHODS: Record<string, string[]> = {
    Roads: ['Geotechnical stabilization', 'Asphalt pavement systems', 'Stormwater drainage modeling'],
    Bridges: ['Deep foundations', 'Reinforced concrete systems', 'Segmental construction sequencing'],
    Commercial: ['Fast-track construction planning', 'Energy-conscious building envelope', 'MEP coordination'],
    Residential: ['Standardized delivery methods', 'Durable material specification', 'Community handover planning'],
    Industrial: ['Heavy-load slab design', 'Utility coordination', 'Phased operational commissioning'],
    Government: ['Stakeholder governance', 'Public safety controls', 'Formal QA/QC reporting'],
    Infrastructure: ['Civil engineering controls', 'Phased construction logistics', 'QA/QC inspection protocols'],
}

function asArray(value?: string[] | string): string[] {
    if (Array.isArray(value)) return value.filter(Boolean)
    if (!value) return []
    return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean)
}

function formatMoney(value?: string | number): string {
    if (value === undefined || value === null || value === '') return 'Available on request'
    if (typeof value === 'number') return `$${value.toLocaleString('en-US')}`
    return value.startsWith('$') || value.toLowerCase().includes('request') ? value : value
}

function getYear(endDate?: string, explicit?: string | number, completionDate?: string): string {
    if (explicit) return String(explicit)
    if (completionDate) return completionDate
    if (!endDate) return 'In progress'
    const year = new Date(endDate).getFullYear()
    return Number.isNaN(year) ? 'In progress' : String(year)
}

function getDuration(startDate?: string, endDate?: string, explicit?: string): string {
    if (explicit) return explicit
    if (!startDate || !endDate) return 'Timeline available on request'
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Timeline available on request'
    const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
    return months >= 12 ? `${Math.round(months / 12)} years` : `${months} months`
}

function getStatus(status?: string, endDate?: string): ProjectStatus {
    if (status?.toLowerCase().includes('ongoing')) return 'Ongoing'
    if (status?.toLowerCase().includes('complete')) return 'Completed'
    if (!endDate) return 'Ongoing'
    return new Date(endDate).getTime() > Date.now() ? 'Ongoing' : 'Completed'
}

function inferCategory(rawCategory?: string, title = ''): string {
    const source = `${rawCategory || ''} ${title}`.toLowerCase()
    if (source.includes('road') || source.includes('highway')) return 'Roads'
    if (source.includes('bridge')) return 'Bridges'
    if (source.includes('commercial') || source.includes('hub')) return 'Commercial'
    if (source.includes('residential') || source.includes('housing')) return 'Residential'
    if (source.includes('industrial')) return 'Industrial'
    if (source.includes('government') || source.includes('city hall')) return 'Government'
    return rawCategory || 'Infrastructure'
}

function getCoordinates(project: RawProject): { lat: number; lng: number } | undefined {
    const lat = Number(project.coordinates?.lat ?? project.latitude)
    const lng = Number(project.coordinates?.lng ?? project.longitude)
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat && lng) return { lat, lng }

    const location = (project.location || '').toLowerCase()
    const key = Object.keys(PROJECT_COORDINATES).find((name) => location.includes(name))
    return key ? PROJECT_COORDINATES[key] : undefined
}

export function normalizeProject(project: RawProject): ProjectRecord {
    const category = inferCategory(project.category, project.title)
    const status = getStatus(project.status, project.endDate)
    const scope = asArray(project.scopeOfWork)
    const technologies = [...asArray(project.technologies), ...asArray(project.methodsUsed)]
    const coverImage = project.coverImage || project.image || projectVisualFallback(category)

    return {
        _id: project._id || project.id || project.title,
        title: project.title,
        category,
        status,
        location: project.location || 'Malawi',
        clientName: project.clientName || project.client || 'Client information available on request',
        projectValue: formatMoney(project.projectValue || project.budget),
        budget: formatMoney(project.budget),
        duration: getDuration(project.startDate, project.endDate, project.duration),
        yearCompleted: getYear(project.endDate, project.yearCompleted, project.completionDate),
        overview: project.overview || project.description || `A ${category.toLowerCase()} project delivered with Fortune Construction's disciplined approach to quality, safety, and practical engineering outcomes.`,
        scopeOfWork: scope.length ? scope : CATEGORY_SCOPE[category] || CATEGORY_SCOPE.Infrastructure,
        technologies: technologies.length ? technologies : CATEGORY_METHODS[category] || CATEGORY_METHODS.Infrastructure,
        challenge: project.challenge || 'The project required careful coordination across site logistics, stakeholder expectations, material delivery, and quality controls.',
        solution: project.solution || 'Fortune Construction applied structured planning, experienced site supervision, and disciplined engineering controls to keep delivery aligned with programme, safety, and quality targets.',
        result: project.result || 'The completed work strengthened local infrastructure, improved usability, and created a durable asset for the client and surrounding communities.',
        coverImage,
        galleryImages: project.galleryImages?.length ? project.galleryImages : [coverImage],
        startDate: project.startDate,
        endDate: project.endDate,
        coordinates: getCoordinates(project),
    }
}
