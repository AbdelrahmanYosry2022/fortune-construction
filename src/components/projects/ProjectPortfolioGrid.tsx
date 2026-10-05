import { CalendarCheck } from 'lucide-react'
import type { ProjectRecord } from '@/lib/projectPresentation'
import { ProjectCaseStudyCard } from './ProjectCaseStudyCard'

interface ProjectPortfolioGridProps {
    isLoading: boolean
    projects: ProjectRecord[]
}

export function ProjectPortfolioGrid({ isLoading, projects }: ProjectPortfolioGridProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            </div>
        )
    }

    if (!projects.length) {
        return (
            <div className="relative overflow-hidden rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-[0_18px_70px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900 md:p-16">
                <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                    <CalendarCheck className="h-9 w-9" />
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-950 dark:text-white md:text-3xl">No projects match this filter</h3>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-500">
                    Try another project type or delivery status to continue browsing the portfolio.
                </p>
            </div>
        )
    }

    return (
        <div className="grid items-stretch gap-6 2xl:grid-cols-2">
            {projects.map((project, index) => (
                <ProjectCaseStudyCard key={project._id} project={project} index={index} />
            ))}
        </div>
    )
}
