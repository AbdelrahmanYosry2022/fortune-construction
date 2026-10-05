import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
    getCategoryIcon,
    ProjectCategoryFilter,
    ProjectCategoryOption,
    ProjectStatusFilter,
    STATUS_FILTERS,
    STATUS_META,
} from './portfolioConfig'

interface CommandButtonProps {
    active: boolean
    icon: LucideIcon
    label: string
    onClick: () => void
}

function CommandButton({ active, icon: Icon, label, onClick }: CommandButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group/filter inline-flex h-12 shrink-0 items-center gap-2.5 rounded-2xl border px-4 text-sm font-black transition-all duration-300 md:h-14 md:px-5 ${
                active
                    ? 'border-teal-700 bg-teal-700 text-white shadow-lg shadow-teal-900/15'
                    : 'border-slate-200 bg-white text-slate-600 shadow-sm hover:border-teal-300 hover:text-slate-950 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-teal-500/50 dark:hover:text-white'
            }`}
        >
            <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    active
                        ? 'bg-white/15 text-white'
                        : 'bg-slate-50 text-slate-500 group-hover/filter:bg-teal-50 group-hover/filter:text-teal-700 dark:bg-slate-900 dark:text-slate-300'
                }`}
            >
                <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="whitespace-nowrap">{label}</span>
        </button>
    )
}

interface ProjectPortfolioFiltersProps {
    categories: ProjectCategoryOption[]
    category: ProjectCategoryFilter
    onCategoryChange: (category: ProjectCategoryFilter) => void
    onClearFilters: () => void
    onSearchChange: (value: string) => void
    onStatusChange: (status: ProjectStatusFilter) => void
    searchQuery: string
    status: ProjectStatusFilter
}

export function ProjectPortfolioFilters({
    categories,
    category,
    onCategoryChange,
    onClearFilters,
    onSearchChange,
    onStatusChange,
    searchQuery,
    status,
}: ProjectPortfolioFiltersProps) {
    const activeFilters = category !== 'All' || status !== 'All' || searchQuery.trim().length > 0
    const activeCategoryLabel = category === 'All' ? 'All sectors' : category

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(330px,430px)] xl:items-stretch">
                <div className="contents">
                    <label className="relative block min-h-14 min-w-0">
                        <span className="sr-only">Search projects</span>
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                            value={searchQuery}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder="Search projects, locations, clients..."
                            className="h-full min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-teal-500"
                        />
                    </label>

                    <div className="flex min-h-14 min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="min-w-0">
                            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Current View</div>
                            <div className="mt-1 truncate text-sm font-black text-slate-900 dark:text-white">
                                {activeCategoryLabel} / {status === 'All' ? 'All statuses' : status}
                            </div>
                        </div>
                        {activeFilters && (
                            <button
                                type="button"
                                onClick={onClearFilters}
                                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-wider text-slate-500 shadow-sm transition-colors hover:border-teal-300 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                            >
                                <X className="h-4 w-4" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="contents">
                    <section className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="mb-3 flex items-center justify-between gap-4 px-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Project Type</span>
                            <span className="max-w-[55%] truncate rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700 shadow-sm dark:bg-slate-950">
                                {activeCategoryLabel}
                            </span>
                        </div>
                        <div className="portfolio-filter-scroll flex flex-1 max-w-full items-center gap-2 overflow-x-auto px-1 pb-5 pt-1">
                            <CommandButton
                                label="All Projects"
                                icon={SlidersHorizontal}
                                active={category === 'All'}
                                onClick={() => onCategoryChange('All')}
                            />
                            {categories.map((item) => (
                                <CommandButton
                                    key={item._id || item.slug || item.name}
                                    label={item.name}
                                    icon={getCategoryIcon(item)}
                                    active={category === item.name}
                                    onClick={() => onCategoryChange(item.name)}
                                />
                            ))}
                        </div>
                    </section>

                    <section className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="mb-3 flex items-center justify-between gap-4 px-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Delivery Status</span>
                            <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700 shadow-sm dark:bg-slate-950">
                                {status === 'All' ? 'All' : status}
                            </span>
                        </div>
                        <div className="grid flex-1 grid-cols-3 items-center gap-2">
                            {STATUS_FILTERS.map((item) => {
                                const meta = STATUS_META[item]
                                return (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => onStatusChange(item)}
                                        className={`flex h-12 min-w-0 items-center justify-center gap-2 rounded-2xl px-2 text-xs font-black transition-all duration-300 md:h-14 ${
                                            status === item
                                                ? 'bg-teal-700 text-white shadow-lg shadow-teal-900/15'
                                                : 'bg-white text-slate-600 hover:text-slate-950 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white'
                                        }`}
                                    >
                                        <meta.icon className="h-4 w-4 shrink-0" />
                                        <span className="min-w-0 truncate">{meta.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
