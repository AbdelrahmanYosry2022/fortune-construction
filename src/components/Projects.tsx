import { useState } from 'react'
import { useUIStore } from '@/store/useUIStore'
import { Container, SectionHeader } from '@fortune/shared-ui'
import { ProjectCard } from './projects/ProjectCard'
import { ProjectFilter } from './projects/ProjectFilter'
import { ProjectModal } from './projects/ProjectModal'
import { Project, ProjectCategory } from '@/types'

const PROJECTS: Project[] = [
    {
        id: 'p1',
        title: 'Lilongwe–Salima Highway',
        location: 'Central Region, Malawi',
        startDate: '2023-01-01',
        category: 'Infrastructure',
        image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80',
        size: 'wide',
        description: '180km dual-carriageway rehabilitation project improving connectivity between Lilongwe and Salima.',
    },
    {
        id: 'p2',
        title: 'Mzuzu City Hall',
        location: 'Mzuzu, Northern Region',
        startDate: '2022-01-01',
        category: 'Commercial',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        size: 'tall',
        description: 'A flagship government administrative building serving the Northern Region.',
    },
    {
        id: 'p3',
        title: 'Shire River Bridge',
        location: 'Southern Region, Malawi',
        startDate: '2021-01-01',
        category: 'Infrastructure',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        size: 'normal',
        description: '280m reinforced concrete bridge spanning the Shire River, connecting two districts.',
    },
    {
        id: 'p4',
        title: 'Blantyre Commercial District',
        location: 'Blantyre, Malawi',
        startDate: '2023-01-01',
        category: 'Commercial',
        image: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80',
        size: 'normal',
        description: 'Multi-storey commercial complex housing retail, office, and hospitality spaces.',
    },
    {
        id: 'p5',
        title: 'Rural Feeder Roads Network',
        location: 'Kasungu, Malawi',
        startDate: '2022-01-01',
        category: 'Infrastructure',
        image: 'https://images.unsplash.com/photo-1558618047-3c29f4b2b1c5?w=800&q=80',
        size: 'normal',
        description: '320km of rural feeder roads bringing agricultural communities closer to markets.',
    },
    {
        id: 'p6',
        title: 'Zomba Pedestrian Bridge',
        location: 'Zomba, Malawi',
        startDate: '2020-01-01',
        category: 'Infrastructure',
        image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80',
        size: 'tall',
        description: 'Steel pedestrian bridge providing safe crossing over Mulunguzi Dam spillway.',
    },
]

const CATEGORIES: ProjectCategory[] = ['All', 'Infrastructure', 'Commercial', 'Residential', 'Industrial']

export default function Projects() {
    const { activeCategory, setActiveCategory, modalProjectId, openModal, closeModal } = useUIStore()
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    const filtered = activeCategory === 'All'
        ? PROJECTS
        : PROJECTS.filter((p) => p.category === activeCategory)

    const modalProject = PROJECTS.find((p) => p.id === modalProjectId)

    return (
        <section id="projects" className="relative section-padding overflow-hidden">
            <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 -z-10" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
            
            <Container>
                <SectionHeader
                    subtitle="Our Portfolio"
                    title="Landmark Projects Across Malawi"
                    description="Each project represents a commitment to quality, safety, and the communities we serve."
                />

                <ProjectFilter
                    categories={CATEGORIES}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />

                <div className="grid auto-rows-fr grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
                    {filtered.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            isHovered={hoveredId === project.id}
                            onMouseEnter={() => setHoveredId(project.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => openModal(project.id)}
                        />
                    ))}
                </div>
            </Container>

            {modalProject && (
                <ProjectModal project={modalProject} onClose={closeModal} />
            )}
        </section>
    )
}
