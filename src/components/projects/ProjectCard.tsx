import { Image } from '@fortune/shared-ui';
import { MapPin, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProjectCardProps } from '@/types'

export function ProjectCard({
    project,
    isHovered,
    onMouseEnter,
    onMouseLeave,
    onClick,
}: ProjectCardProps) {
    return (
        <div
            className={cn(
                'relative h-full min-h-[360px] overflow-hidden rounded-3xl cursor-pointer group shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1',
                project.size === 'wide' ? 'md:col-span-2' : project.size === 'tall' ? 'md:row-span-2' : ''
            )}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        >
            <div className="absolute inset-0 bg-slate-900 z-10 opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
            
            <Image
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            />

            {/* Overlay Content */}
            <div
                className={cn(
                    'absolute inset-0 z-20 flex flex-col justify-end p-8 transition-all duration-500 transform',
                    isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                )}
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                
                <span className="text-teal-400 text-[10px] font-black tracking-[0.3em] uppercase mb-3">
                    {project.category}
                </span>
                <h3 className="font-display text-2xl font-bold text-white mb-3 tracking-tight">{project.title}</h3>
                <div className="flex items-center gap-5 text-white/60 text-[10px] font-black uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-teal-500" />{project.location}</span>
                    <span className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-teal-500" />
                        {project.startDate && new Date(project.startDate).getFullYear()}
                    </span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed font-light line-clamp-3 mb-6">{project.description}</p>
                
                <div className="inline-flex items-center text-white text-[10px] font-black uppercase tracking-[0.2em] group/btn">
                    Explore Project <div className="w-8 h-px bg-teal-500 ml-3 transition-all duration-500 group-hover/btn:w-12" />
                </div>
            </div>

            {/* Default Category badge */}
            <div
                className={cn(
                    'absolute top-6 left-6 z-20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl transition-all duration-500',
                    project.category === 'Infrastructure' ? 'bg-teal-500 text-white' :
                        project.category === 'Commercial' ? 'bg-slate-800 text-white' :
                            'bg-slate-900 text-white',
                    isHovered ? 'opacity-0 scale-90 -translate-y-2' : 'opacity-100 scale-100 translate-y-0'
                )}
            >
                {project.category}
            </div>
        </div>
    )
}
