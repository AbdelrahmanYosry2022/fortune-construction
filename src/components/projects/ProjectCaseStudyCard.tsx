import { Image } from '@fortune/shared-ui'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { ProjectRecord } from '@/lib/projectPresentation'
import { projectVisualFallback } from '@/lib/visualFallbacks'

function DetailCell({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</div>
            <div className="mt-1 text-sm font-bold leading-5 text-slate-900 dark:text-white">{value}</div>
        </div>
    )
}

function SummaryColumn({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="rounded bg-slate-50 p-4 dark:bg-slate-900/70">
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</div>
            <div className="line-clamp-4 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{children}</div>
        </div>
    )
}

export function ProjectCaseStudyCard({ project, index }: { project: ProjectRecord; index: number }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.25) }}
            className="grid h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_26px_80px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-950 lg:grid-cols-[44%_1fr] 2xl:grid-cols-1"
        >
            <Link to={`/projects/${project._id}`} className="relative block min-h-[260px] overflow-hidden bg-slate-100 lg:min-h-[340px] 2xl:min-h-[300px]">
                <Image
                    src={project.coverImage}
                    alt={project.title}
                    fallbackSrc={projectVisualFallback(project.category)}
                    fallbackClassName="bg-slate-900 object-cover p-0"
                    className="h-full min-h-[260px] w-full object-cover transition-transform duration-700 hover:scale-105 lg:min-h-[340px] 2xl:min-h-[300px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
                <span className="absolute left-5 top-5 rounded bg-white/95 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-900 shadow-sm">
                    {project.category}
                </span>
            </Link>

            <div className="flex min-h-[340px] flex-1 flex-col p-7 lg:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-display font-bold tracking-tight text-slate-950 dark:text-white md:text-3xl">
                            {project.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500">
                            <span className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-teal-700" />
                                {project.location}
                            </span>
                            <span className="rounded bg-teal-50 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                                {project.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-4 dark:border-slate-800 dark:bg-slate-950">
                    <DetailCell label="Client" value={project.clientName} />
                    <DetailCell label="Value" value={project.projectValue} />
                    <DetailCell label="Year" value={project.yearCompleted} />
                    <DetailCell label="Duration" value={project.duration} />
                </div>

                <div className="mt-5 grid flex-1 gap-4 md:grid-cols-[1fr_1fr_1.5fr]">
                    <SummaryColumn label="Scope">
                        {project.scopeOfWork.slice(0, 2).join(', ')}
                    </SummaryColumn>
                    <SummaryColumn label="Methods">
                        {project.technologies.slice(0, 3).join(', ')}
                    </SummaryColumn>
                    <SummaryColumn label="Challenge / Solution / Result">
                        <strong>Challenge:</strong> {project.challenge}
                        <br />
                        <strong>Solution:</strong> {project.solution}
                        <br />
                        <strong>Result:</strong> {project.result}
                    </SummaryColumn>
                </div>

                <Link
                    to={`/projects/${project._id}`}
                    className="ml-auto mt-5 inline-flex items-center gap-2 text-sm font-black text-teal-700 transition-colors hover:text-slate-950 dark:text-teal-300 dark:hover:text-white"
                >
                    View Case Study
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </motion.article>
    )
}
