import { Image } from '@fortune/shared-ui'
import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ProjectRecord } from '@/lib/projectPresentation'

interface MalawiProjectMapProps {
    onSelect: (id: string) => void
    projects: ProjectRecord[]
    selectedId?: string
}

function getMarkerPosition(project: ProjectRecord) {
    const lat = project.coordinates?.lat ?? -13.5
    const lng = project.coordinates?.lng ?? 34
    const x = ((lng - 32.6) / (35.9 - 32.6)) * 100
    const y = ((-9.3 - lat) / (-9.3 + 17.2)) * 100

    return {
        x: Math.min(92, Math.max(8, x)),
        y: Math.min(92, Math.max(8, y)),
    }
}

export function MalawiProjectMap({ projects, selectedId, onSelect }: MalawiProjectMapProps) {
    const selected = projects.find((project) => project._id === selectedId) || projects[0]
    const locatedProjects = projects.filter((project) => project.coordinates)

    return (
        <section className="relative overflow-hidden bg-slate-950 text-white">
            <div className="mx-auto grid max-w-7xl lg:grid-cols-[1fr_430px]">
                <div className="relative min-h-[590px] overflow-hidden p-6 md:p-10">
                    <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:48px_48px]" />
                    <div className="relative z-10 mb-8 max-w-2xl">
                        <span className="text-[10px] font-black uppercase tracking-[0.28em] text-teal-300">Interactive Project Map</span>
                        <h2 className="mt-4 text-3xl font-display font-bold tracking-tight md:text-5xl">Project Footprint Across Malawi</h2>
                        <p className="mt-5 text-base leading-8 text-slate-300">
                            Explore regional delivery activity and open a matching case study from each project location.
                        </p>
                    </div>

                    <div className="relative mx-auto h-[400px] max-w-[370px]">
                        <svg viewBox="0 0 220 390" className="h-full w-full drop-shadow-2xl" role="img" aria-label="Stylized map of Malawi">
                            <path
                                d="M119 7 C144 33 151 57 139 86 C129 111 151 141 139 169 C129 193 103 202 114 232 C123 258 151 276 144 305 C139 329 112 344 109 383 C93 356 75 333 79 303 C83 274 102 258 89 231 C75 202 89 181 98 160 C109 134 91 114 100 88 C108 63 100 35 119 7 Z"
                                fill="#0f766e"
                                stroke="#5eead4"
                                strokeWidth="2"
                            />
                            <path
                                d="M116 38 C128 73 115 112 126 145 C137 180 103 207 119 245 C130 273 117 309 103 344"
                                fill="none"
                                stroke="#ccfbf1"
                                strokeOpacity=".55"
                                strokeWidth="3"
                            />
                        </svg>

                        {locatedProjects.map((project) => {
                            const point = getMarkerPosition(project)
                            const active = project._id === selected?._id

                            return (
                                <button
                                    type="button"
                                    key={project._id}
                                    onClick={() => onSelect(project._id)}
                                    className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white text-slate-950 shadow-xl transition-transform hover:scale-110"
                                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                                    aria-label={`Select ${project.title}`}
                                >
                                    <span className={`h-3 w-3 rounded-full ${active ? 'bg-teal-500' : 'bg-slate-950'}`} />
                                </button>
                            )
                        })}
                    </div>
                </div>

                {selected && (
                    <aside className="border-t border-white/10 bg-white p-6 text-slate-950 dark:bg-slate-900 dark:text-white lg:border-l lg:border-t-0 lg:border-white/10">
                        <div className="relative mb-6 aspect-[4/3] overflow-hidden bg-slate-200">
                            <Image src={selected.coverImage} alt={selected.title} className="h-full w-full object-cover" />
                            <span className="absolute left-4 top-4 bg-teal-500 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                                {selected.status}
                            </span>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">{selected.category}</div>
                        <h3 className="mt-3 text-2xl font-display font-bold leading-tight">{selected.title}</h3>
                        <div className="mt-4 flex items-center text-sm font-semibold text-slate-500 dark:text-slate-300">
                            <MapPin className="mr-2 h-4 w-4 text-teal-600" />
                            {selected.location}
                        </div>
                        <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">{selected.overview}</p>
                        <Link to={`/projects/${selected._id}`} className="mt-8 inline-flex items-center text-[11px] font-black uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                            Open Case Study <ArrowRight className="ml-3 h-4 w-4" />
                        </Link>
                    </aside>
                )}
            </div>
        </section>
    )
}
