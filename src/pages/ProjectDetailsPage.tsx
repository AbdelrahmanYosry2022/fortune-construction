import { useMemo, useState } from 'react'
import { Image, PageHero, Button } from '@fortune/shared-ui'
import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import {
    ArrowLeft,
    ArrowRight,
    Briefcase,
    Calendar,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    Layers3,
    MapPin,
    Ruler,
    ShieldCheck,
    Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'
import { normalizeProject, RawProject } from '@/lib/projectPresentation'
import { SeoHead } from '@/components/SeoHead'
import { projectSeoProfile, seoProfiles } from '@/lib/seo'
import { DataUnavailableState } from '@/components/errors/DataUnavailableState'
import { isNetworkUnavailableError } from '@/lib/errorHandling'
import Lightbox from 'react-18-image-lightbox'
import 'react-18-image-lightbox/style.css'

function FactTile({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
    return (
        <div className="border border-slate-200 bg-white p-5 transition-colors hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-10 w-10 items-center justify-center bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                <Icon className="h-5 w-5" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</div>
            <div className="mt-2 text-base font-bold leading-snug text-slate-950 dark:text-white">{value}</div>
        </div>
    )
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
    return (
        <div className="mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.26em] text-teal-700 dark:text-teal-300">{eyebrow}</span>
            <h2 className="mt-3 text-3xl font-display font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">{title}</h2>
        </div>
    )
}

function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="space-y-4">
            {items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-300" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    )
}

function ChallengePanel({ title, body, icon: Icon, dark = false }: { title: string; body: string; icon: LucideIcon; dark?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className={`border p-8 ${
                dark
                    ? 'border-slate-800 bg-slate-950 text-white'
                    : 'border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white'
            }`}
        >
            <div className={`mb-6 flex h-12 w-12 items-center justify-center ${dark ? 'bg-teal-500/10 text-teal-300' : 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'}`}>
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-display font-bold">{title}</h3>
            <p className={`mt-5 text-base leading-8 ${dark ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>{body}</p>
        </motion.div>
    )
}

export default function ProjectDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const [isOpen, setIsOpen] = useState(false)
    const [photoIndex, setPhotoIndex] = useState(0)

    const { data: apiProject, error, isLoading, isError, refetch } = useQuery<RawProject>({
        queryKey: ['project', id],
        queryFn: () => apiFetch<RawProject>(`/projects/${id}`),
        enabled: !!id,
        retry: false,
    })

    const project = useMemo(
        () => (apiProject ? normalizeProject(apiProject) : undefined),
        [apiProject],
    )

    if (isLoading) return (
        <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        </div>
    )

    if (isError && isNetworkUnavailableError(error)) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-slate-50 px-6 py-16 dark:bg-slate-950">
                <SeoHead profile={seoProfiles.appError} />
                <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">
                    <DataUnavailableState
                        error={error}
                        onRetry={() => void refetch()}
                        resourceLabel="project details"
                        title="Project details temporarily unavailable"
                    />
                    <Link to="/projects" className="mt-6 inline-flex items-center self-start text-sm font-bold text-teal-700 dark:text-teal-300">
                        <ArrowLeft className="mr-2 h-5 w-5" /> Back to Projects
                    </Link>
                </main>
            </div>
        )
    }

    if (isError || !project) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center bg-slate-50 px-6 text-center dark:bg-slate-950">
                <SeoHead profile={projectSeoProfile(undefined, id)} />
                <h1 className="mb-4 text-3xl font-display font-bold text-slate-950 dark:text-white">Project Not Found</h1>
                <Link to="/projects" className="inline-flex items-center bg-teal-600 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white">
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back to Projects
                </Link>
            </div>
        )
    }

    const images = project.galleryImages.length ? project.galleryImages : [project.coverImage]
    const seoProfile = projectSeoProfile(project, id)

    return (
        <div className="flex min-h-screen w-full flex-col bg-white dark:bg-slate-950">
            <SeoHead profile={seoProfile} />
            <PageHero
                title={project.title}
                description={`${project.category} case study in ${project.location}`}
                imageSrc={project.coverImage}
                imageAlt={project.title}
            />

            <section className="relative -mt-16 z-20 px-6">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                    <FactTile icon={MapPin} label="Location" value={project.location} />
                    <FactTile icon={Briefcase} label="Client" value={project.clientName} />
                    <FactTile icon={Calendar} label="Year" value={project.yearCompleted} />
                    <FactTile icon={CircleDollarSign} label="Value" value={project.projectValue} />
                    <FactTile icon={Clock3} label="Duration" value={project.duration} />
                    <FactTile icon={ShieldCheck} label="Status" value={project.status} />
                </div>
            </section>

            <section className="px-6 py-16 md:py-24">
                <div className="mx-auto max-w-7xl">
                    <Link to="/projects" className="mb-12 inline-flex items-center text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300">
                        <ArrowLeft className="mr-3 h-4 w-4" />
                        Return to Portfolio
                    </Link>

                    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
                        <aside className="lg:sticky lg:top-28 lg:self-start">
                            <div className="border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                                <div className="text-[10px] font-black uppercase tracking-[0.26em] text-teal-700 dark:text-teal-300">Project Snapshot</div>
                                <h2 className="mt-4 text-2xl font-display font-bold text-slate-950 dark:text-white">{project.title}</h2>
                                <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">{project.overview}</p>
                                <div className="mt-8 grid gap-3">
                                    {project.technologies.slice(0, 4).map((tech) => (
                                        <div key={tech} className="flex items-center border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                                            <Wrench className="mr-3 h-4 w-4 text-teal-600" />
                                            {tech}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        <div>
                            <SectionTitle eyebrow="Overview" title="A closer look at the assignment" />
                            <p className="max-w-4xl text-lg leading-9 text-slate-600 dark:text-slate-300">{project.overview}</p>

                            <div className="mt-12 grid gap-6 md:grid-cols-2">
                                <div className="border border-slate-200 p-8 dark:border-slate-800">
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                                        <Layers3 className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-6 text-2xl font-display font-bold text-slate-950 dark:text-white">Scope of Work</h3>
                                    <BulletList items={project.scopeOfWork} />
                                </div>
                                <div className="border border-slate-200 p-8 dark:border-slate-800">
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                                        <Ruler className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-6 text-2xl font-display font-bold text-slate-950 dark:text-white">Methods Used</h3>
                                    <BulletList items={project.technologies} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 px-6 py-16 dark:bg-slate-900/50 md:py-24">
                <div className="mx-auto max-w-7xl">
                    <SectionTitle eyebrow="Delivery Story" title="Challenge, solution, and final result" />
                    <div className="grid gap-6 lg:grid-cols-3">
                        <ChallengePanel icon={Wrench} title="Key Challenge" body={project.challenge} />
                        <ChallengePanel icon={ShieldCheck} title="Engineering Solution" body={project.solution} dark />
                        <ChallengePanel icon={CheckCircle2} title="Final Result" body={project.result} />
                    </div>
                </div>
            </section>

            <section className="px-6 py-16 md:py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <SectionTitle eyebrow="Visual Record" title="Project gallery" />
                        <p className="max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                            High-resolution visual references help clients understand scale, progress, and final delivery quality.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        {images.map((img, idx) => (
                            <button
                                type="button"
                                key={`${img}-${idx}`}
                                onClick={() => {
                                    setPhotoIndex(idx)
                                    setIsOpen(true)
                                }}
                                className={`group relative min-h-[230px] overflow-hidden bg-slate-200 ${idx === 0 ? 'md:col-span-2 md:row-span-2 md:min-h-[480px]' : ''}`}
                            >
                                <Image src={img} alt={`${project.title} gallery ${idx + 1}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-slate-950/0 transition-colors group-hover:bg-slate-950/30" />
                                <span className="absolute bottom-4 left-4 translate-y-2 text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                                    View Image
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-slate-950 px-6 py-20 text-white">
                <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.26em] text-teal-300">Build with confidence</span>
                        <h2 className="mt-4 max-w-3xl text-3xl font-display font-bold tracking-tight md:text-5xl">
                            Discuss a project with Fortune Construction.
                        </h2>
                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                            Connect with the team to review requirements, constraints, delivery models, and project readiness.
                        </p>
                    </div>
                    <Link to="/contact">
                        <Button size="lg" className="h-14 bg-teal-600 px-8 text-[11px] font-black uppercase tracking-[0.18em] text-white hover:bg-teal-500">
                            Contact Our Team <ArrowRight className="ml-3 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            {isOpen && images.length > 0 && (
                <Lightbox
                    mainSrc={images[photoIndex]}
                    nextSrc={images[(photoIndex + 1) % images.length]}
                    prevSrc={images[(photoIndex + images.length - 1) % images.length]}
                    onCloseRequest={() => setIsOpen(false)}
                    onMovePrevRequest={() => setPhotoIndex((photoIndex + images.length - 1) % images.length)}
                    onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % images.length)}
                />
            )}
        </div>
    )
}
