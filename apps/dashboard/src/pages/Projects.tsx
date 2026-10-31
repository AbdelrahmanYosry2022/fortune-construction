import { useMemo, useRef, useState } from 'react'
import { useFieldArray } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, uploadImage } from '../lib/api'
import { DataUnavailableState } from '../components/errors/DataUnavailableState'
import { PROJECT_TRASH_QUERY_KEY, ProjectTrashPanel, RecentlyDeletedButton } from '../components/projects/ProjectTrash'
import { getApiErrorMessage } from '../lib/errorHandling'
import { Plus, Pencil, Trash2, Loader2, MapPin, DollarSign, Clock, ImagePlus, X, ListPlus } from 'lucide-react'
import { toast } from 'sonner'
import {
  useFormSchema,
  projectSchema,
  ProjectFormData,
  FormInput,
  Form,
  Button,
  GlobalModal,
  Card,
} from '@fortune/shared-ui'

interface Project extends Omit<ProjectFormData, 'projectValue' | 'budget' | 'yearCompleted'> {
  _id: string;
  projectValue?: string | number;
  budget?: string | number;
  yearCompleted?: string | number;
}

interface ProjectCategory {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  order?: number;
  isActive: boolean;
}

// POST and DELETE /projects/:id/gallery answer with the project's whole stored gallery.
interface ProjectGalleryResponse {
  galleryImages: string[];
}

// A few uploads at a time: fast enough, and one failed photo no longer cancels the whole batch.
const GALLERY_UPLOAD_CONCURRENCY = 3

const EMPTY_FORM: ProjectFormData = {
  title: '',
  category: '',
  status: 'Ongoing',
  location: '',
  clientName: '',
  projectValue: '',
  budget: '',
  duration: '',
  yearCompleted: '',
  overview: '',
  scopeOfWork: [],
  technologies: [],
  coverImage: '',
  challenge: '',
  solution: '',
  result: '',
  galleryImages: [],
  coordinates: { lat: '', lng: '' },
}

function parseCurrencyAmount(value?: string | number | null) {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value === 'number') return Number.isFinite(value) ? value : ''
  const normalized = value.trim().toLowerCase().replace(/,/g, '')
  const numeric = normalized.match(/(\d+(?:\.\d+)?)/)?.[1]
  if (!numeric) return ''
  const multiplier = normalized.includes('b') ? 1_000_000_000 : normalized.includes('m') ? 1_000_000 : normalized.includes('k') ? 1_000 : 1
  const amount = Number(numeric) * multiplier
  return Number.isFinite(amount) ? Math.round(amount) : ''
}

function parseYear(value?: string | number | null) {
  if (value === undefined || value === null || value === '') return ''
  const year = typeof value === 'number' ? value : Number(String(value).match(/\d{4}/)?.[0] || value)
  return Number.isInteger(year) ? year : ''
}

function formatUsd(value?: string | number | null) {
  const amount = parseCurrencyAmount(value)
  if (amount === '') return ''
  return `$${amount.toLocaleString('en-US')} USD`
}

function toDate(value?: string | Date) {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function calculateDuration(startValue?: string | Date, endValue?: string | Date) {
  const start = toDate(startValue)
  const end = toDate(endValue)
  if (!start || !end || end <= start) return ''
  const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (!years) return `~${months} month${months === 1 ? '' : 's'}`
  if (!remainingMonths) return `~${years} year${years === 1 ? '' : 's'}`
  return `~${years} year${years === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`
}

function getCompletionYear(status?: string, endValue?: string | Date, explicit?: string | number) {
  if (status === 'Completed') {
    const end = toDate(endValue)
    if (end) return String(end.getFullYear())
  }
  return explicit === undefined || explicit === null || explicit === '' ? '' : String(explicit)
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
      <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-xs font-medium text-slate-500">{description}</p>
    </div>
  )
}

function ArrayField({
  control,
  name,
  label,
  placeholder,
}: {
  control: any;
  name: 'scopeOfWork' | 'technologies';
  label: string;
  placeholder: string;
}) {
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</label>
        <Button type="button" variant="outline" className="h-9 px-3 text-xs" onClick={() => append('')}>
          <ListPlus className="mr-2 h-3.5 w-3.5" /> Add
        </Button>
      </div>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <FormInput name={`${name}.${index}`} label={`Item ${index + 1}`} placeholder={placeholder} />
            <Button type="button" variant="destructive" className="mt-7 h-12 px-3" onClick={() => remove(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {!fields.length && (
          <button
            type="button"
            onClick={() => append('')}
            className="flex h-14 w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:border-teal-400 hover:text-teal-700"
          >
            Add first item
          </button>
        )}
      </div>
    </div>
  )
}

function normalizeProjectForForm(project: Project): ProjectFormData {
  const { _id, projectValue, budget, yearCompleted, ...restProject } = project
  return {
    ...EMPTY_FORM,
    ...restProject,
    projectValue: parseCurrencyAmount(projectValue),
    budget: parseCurrencyAmount(budget),
    yearCompleted: parseYear(yearCompleted),
    scopeOfWork: project.scopeOfWork || [],
    technologies: project.technologies || [],
    galleryImages: project.galleryImages || [],
    coordinates: {
      lat: project.coordinates?.lat ?? '',
      lng: project.coordinates?.lng ?? '',
    },
  }
}

function cleanProjectPayload(data: ProjectFormData) {
  const duration = calculateDuration(data.startDate, data.endDate)
  const yearCompleted = getCompletionYear(data.status, data.endDate, data.yearCompleted)

  const parsedProjectValue = parseCurrencyAmount(data.projectValue)
  const parsedBudget = parseCurrencyAmount(data.budget)

  return {
    ...data,
    projectValue: parsedProjectValue === '' ? undefined : parsedProjectValue,
    budget: parsedBudget === '' ? undefined : parsedBudget,
    duration,
    yearCompleted: yearCompleted === '' ? undefined : yearCompleted,
    scopeOfWork: (data.scopeOfWork || []).filter(Boolean),
    technologies: (data.technologies || []).filter(Boolean),
    galleryImages: data.galleryImages || [],
    coordinates: {
      lat: data.coordinates?.lat === '' ? undefined : data.coordinates?.lat,
      lng: data.coordinates?.lng === '' ? undefined : data.coordinates?.lng,
    },
  }
}

// An existing project's photos are saved on their own through /projects/:id/gallery, so an
// update never sends galleryImages: the list in a form opened earlier would replace the stored
// one and drop photos added since (in another tab, by someone else, or by another dashboard).
function cleanProjectUpdatePayload(data: ProjectFormData) {
  const { galleryImages: _savedSeparately, ...payload } = cleanProjectPayload(data)
  return payload
}

export default function Projects() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [trashTarget, setTrashTarget] = useState<{ id: string; title: string } | null>(null)
  const [trashOpen, setTrashOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [removingImages, setRemovingImages] = useState<string[]>([])
  // Removing a photo from a saved project takes effect at once, so it asks first, on the photo itself.
  const [confirmingRemoval, setConfirmingRemoval] = useState<string | null>(null)
  // Bumped whenever the form is opened for another project, so a slow upload
  // never writes its URLs into a different project's form.
  const formSessionRef = useRef(0)
  const [formSession, setFormSession] = useState(0)
  // A photo batch can keep running after its form is closed. Its progress (and the Save block)
  // belongs to the form that started it, not to whichever form is open now.
  const [galleryUpload, setGalleryUpload] = useState<{ session: number; done: number; total: number } | null>(null)
  const uploadingGallery = galleryUpload !== null && galleryUpload.session === formSession
  // The project the form currently shows (null for a new one). Saved gallery changes are only
  // shown while the form still shows the project they were made on.
  const formProjectIdRef = useRef<string | null>(null)
  // Gallery requests go out one at a time, so a response (the project's whole list at that
  // moment) is never overtaken by an older one and the form never shows a stale list.
  const galleryQueueRef = useRef<Promise<unknown>>(Promise.resolve())
  const isUploading = uploading || uploadingGallery

  const form = useFormSchema({
    schema: projectSchema,
    defaultValues: EMPTY_FORM,
  })

  const {
    data: projectsData,
    error: projectsError,
    isLoading,
    refetch: retryProjects,
  } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data),
  })
  const projects = projectsData ?? []

  const {
    data: categoriesData,
    error: categoriesError,
    isError: categoriesHasError,
    refetch: retryCategories,
  } = useQuery<ProjectCategory[]>({
    queryKey: ['project-categories'],
    queryFn: () => api.get('/project-categories').then((r) => r.data),
  })
  const categories = categoriesData ?? []

  const categoryOptions = categories
    .filter((category) => category.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((category) => ({ label: category.name, value: category.name }))

  const save = useMutation({
    mutationFn: (data: ProjectFormData) =>
      editingId ? api.put(`/projects/${editingId}`, cleanProjectUpdatePayload(data)) : api.post('/projects', cleanProjectPayload(data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project saved successfully!')
      setModalOpen(false)
    },
    onError: (error) => toast.error(`Failed to save project: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  // DELETE /projects/:id only moves the project to the trash; it can be restored for 30 days.
  const moveToTrash = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: PROJECT_TRASH_QUERY_KEY })
      qc.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Project moved to trash')
    },
    onError: (error) => toast.error(`Failed to move project to trash: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  const openAdd = () => {
    formSessionRef.current += 1
    setFormSession(formSessionRef.current)
    formProjectIdRef.current = null
    setConfirmingRemoval(null)
    setEditingId(null)
    form.reset({ ...EMPTY_FORM, category: categoryOptions[0]?.value || '' })
    setModalOpen(true)
  }

  const openEdit = (project: Project) => {
    formSessionRef.current += 1
    setFormSession(formSessionRef.current)
    formProjectIdRef.current = project._id
    setConfirmingRemoval(null)
    setEditingId(project._id)
    form.reset(normalizeProjectForForm(project))
    setModalOpen(true)
  }

  const queueGalleryChange = (request: () => Promise<{ data: ProjectGalleryResponse }>) => {
    const change = galleryQueueRef.current.then(request)
    galleryQueueRef.current = change.catch(() => undefined)
    return change.then((response) => response.data.galleryImages)
  }

  // The server's answer is the project's whole list. It goes into the cached project list at once
  // (so reopening the project mid-batch starts from it) and into the form if it shows that project.
  const showSavedGallery = (projectId: string, galleryImages: string[]) => {
    qc.setQueryData<Project[]>(['projects'], (list) =>
      list?.map((project) => (project._id === projectId ? { ...project, galleryImages } : project)),
    )
    if (formProjectIdRef.current === projectId) form.setValue('galleryImages', galleryImages)
  }

  const handleImageUpload = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    const session = formSessionRef.current
    try {
      const url = await uploadImage(file)
      if (session !== formSessionRef.current) return
      form.setValue('coverImage', url)
    } catch (error) {
      toast.error(`Cover image upload failed: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 })
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryUpload = async (files: File[]) => {
    if (files.length === 0) return
    const session = formSessionRef.current
    // Captured once, so every photo of this run lands on the project it was picked for, even if
    // the form is closed or opened for another project before the uploads finish.
    const projectId = editingId
    // The end-of-batch message names the project, since another form may be open by then.
    const projectTitle = String(form.getValues('title') || '').trim()
    const target = projectTitle ? `“${projectTitle}”` : 'the project'
    setGalleryUpload({ session, done: 0, total: files.length })

    const urls: Array<string | undefined> = new Array(files.length)
    const failures: string[] = []
    let saved = 0
    let nextIndex = 0
    let done = 0

    const uploadNext = async () => {
      while (nextIndex < files.length) {
        const index = nextIndex++
        const file = files[index]
        try {
          urls[index] = await uploadImage(file)
        } catch (error) {
          failures.push(`${file.name}: ${getApiErrorMessage(error, 'upload failed')}`)
        }
        const url = urls[index]
        if (projectId && url) {
          // An existing project gets each photo as soon as it is uploaded. Only this URL is sent,
          // never the whole list, so photos added meanwhile somewhere else are kept.
          try {
            const galleryImages = await queueGalleryChange(() =>
              api.post<ProjectGalleryResponse>(`/projects/${projectId}/gallery`, { urls: [url] }),
            )
            saved += 1
            showSavedGallery(projectId, galleryImages)
          } catch (error) {
            failures.push(`${file.name} was uploaded but not added to the project: ${getApiErrorMessage(error, 'please try again')}`)
          }
        }
        done += 1
        const progress = done
        setGalleryUpload((current) => (current?.session === session ? { ...current, done: progress } : current))
      }
    }

    try {
      await Promise.all(Array.from({ length: Math.min(GALLERY_UPLOAD_CONCURRENCY, files.length) }, uploadNext))
      let added = saved
      if (projectId) {
        if (saved) qc.invalidateQueries({ queryKey: ['projects'] })
      } else {
        // A new project keeps its photos in the form until it is created.
        const uploaded = urls.filter((url): url is string => Boolean(url))
        if (session !== formSessionRef.current) {
          toast.error('The project form was closed before the photos finished uploading. Please add them again.', { duration: 10000 })
          return
        }
        if (uploaded.length) {
          const current = form.getValues('galleryImages') || []
          form.setValue('galleryImages', [...current, ...uploaded])
        }
        added = uploaded.length
      }
      if (failures.length) {
        toast.error(`${failures.length} of ${files.length} photos could not be added${projectId ? ` to ${target}` : ''}. ${failures[0]}`, { duration: 10000 })
      } else {
        toast.success(`${added} photo${added === 1 ? '' : 's'} ${projectId ? `saved to ${target}` : 'uploaded'}`)
      }
    } finally {
      setGalleryUpload((current) => (current?.session === session ? null : current))
    }
  }

  const removeGalleryImage = async (url: string) => {
    const projectId = editingId
    if (!projectId) {
      const current = form.getValues('galleryImages') || []
      form.setValue('galleryImages', current.filter((image) => image !== url))
      return
    }

    // An existing project loses the photo right away; the form follows the server's answer.
    setRemovingImages((current) => [...current, url])
    try {
      const galleryImages = await queueGalleryChange(() =>
        api.delete<ProjectGalleryResponse>(`/projects/${projectId}/gallery`, { data: { url } }),
      )
      showSavedGallery(projectId, galleryImages)
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Photo removed from the project')
    } catch (error) {
      toast.error(`Failed to remove photo: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 })
    } finally {
      setRemovingImages((current) => current.filter((image) => image !== url))
    }
  }

  const watchedStartDate = form.watch('startDate')
  const watchedEndDate = form.watch('endDate')
  const computedDuration = useMemo(
    () => calculateDuration(watchedStartDate, watchedEndDate),
    [watchedStartDate, watchedEndDate],
  )

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div>
  }

  // Any failed load (not only network errors) must say so instead of showing an empty list.
  // Cached projects stay visible if a background refetch fails.
  if (!projectsData) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Projects</h1>
            <p className="mt-1 text-sm text-slate-500">Project records are temporarily unavailable.</p>
          </div>
        </div>
        <DataUnavailableState
          error={projectsError}
          message={`Could not load projects: ${getApiErrorMessage(projectsError, 'please try again')}`}
          onRetry={() => void retryProjects()}
          resourceLabel="project records"
          title="Projects temporarily unavailable"
        />
      </div>
    )
  }

  const categoriesUnavailable = categoriesHasError && !categoriesData

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">{projects.length} projects total</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <RecentlyDeletedButton onClick={() => setTrashOpen(true)} />
          <Button onClick={openAdd} className="shadow-lg shadow-teal-500/20">
            <Plus className="mr-2 h-4 w-4" /> Add Project
          </Button>
        </div>
      </div>

      {categoriesUnavailable && (
        <DataUnavailableState
          error={categoriesError}
          message="Project category options are temporarily unavailable. Existing project validation remains inline inside the form."
          onRetry={() => void retryCategories()}
          resourceLabel="project categories"
          title="Project categories temporarily unavailable"
        />
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Card key={project._id} className="group flex h-full flex-col overflow-hidden border-slate-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
              {project.coverImage ? (
                <img src={project.coverImage} alt={project.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-700"><ImagePlus className="h-10 w-10" /></div>
              )}
              <span className="absolute left-4 top-4 rounded-full bg-teal-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                {project.category}
              </span>
              <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-lg">
                {project.status || 'Ongoing'}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="mb-4 line-clamp-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-teal-600 dark:text-white">{project.title}</h3>
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500 dark:text-slate-400"><MapPin className="h-4 w-4 text-teal-500" />{project.location}</div>
                <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500 dark:text-slate-400"><DollarSign className="h-4 w-4 text-teal-500" />{project.projectValue || project.budget || 'Available on request'}</div>
                <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500 dark:text-slate-400"><Clock className="h-4 w-4 text-teal-500" />{project.duration || project.yearCompleted || 'Timeline available on request'}</div>
              </div>
              <div className="mt-auto flex gap-3 border-t border-slate-50 pt-5 dark:border-slate-800">
                <Button variant="outline" onClick={() => openEdit(project)} className="h-9 flex-1 text-xs font-bold uppercase tracking-wider">
                  <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setTrashTarget({ id: project._id, title: project.title })}
                  className="h-9 px-4"
                  aria-label={`Move ${project.title} to trash`}
                  title="Move to trash"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <GlobalModal
        open={!!trashTarget}
        onOpenChange={(open) => !open && setTrashTarget(null)}
        title="Move project to trash"
        description={trashTarget ? `Move “${trashTarget.title}” to the trash? You can restore it from Recently deleted for 30 days.` : undefined}
        type="destructive"
        actionText="Move to trash"
        onAction={() => {
          if (trashTarget) moveToTrash.mutate(trashTarget.id)
          setTrashTarget(null)
        }}
      />

      <ProjectTrashPanel open={trashOpen} onOpenChange={setTrashOpen} />

      <GlobalModal open={modalOpen} onOpenChange={setModalOpen} title={editingId ? 'Edit Project' : 'Add Project'} type="custom">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => save.mutate(data))} className="max-h-[76vh] space-y-7 overflow-y-auto px-1">
            <section className="space-y-4">
              <SectionTitle title="Basic Information" description="Core information used across the portfolio, filters, and project detail page." />
              <FormInput name="title" label="Project Title *" placeholder="e.g. Lilongwe Grand Bridge" />
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput name="category" label="Category *" type="select" options={categoryOptions} placeholder="Select category" />
                <FormInput name="status" label="Status" type="select" options={[{ label: 'Ongoing', value: 'Ongoing' }, { label: 'Completed', value: 'Completed' }]} />
                <FormInput name="location" label="Location *" placeholder="Lilongwe, Malawi" />
                <FormInput name="clientName" label="Client Name" placeholder="Client information available on request" />
                <FormInput name="startDate" label="Start Date" type="date" />
                <FormInput name="endDate" label="End Date" type="date" />
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle title="Commercial Details" description="USD figures and calculated timeline details shown in project cards and case studies." />
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput name="projectValue" label="Project Value (USD)" type="number" min="1" placeholder="15000000" />
                <FormInput name="budget" label="Budget (USD)" type="number" min="1" placeholder="15000000" />
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Calculated Duration</div>
                  <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{computedDuration || 'Select valid start and end dates'}</div>
                </div>
                <FormInput name="yearCompleted" label="Year Completed" type="number" min="1900" max={new Date().getFullYear() + 20} placeholder="2026" />
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle title="Case Study Content" description="Detailed content shown on the public project card and detail page." />
              <FormInput name="overview" label="Project Overview" type="textarea" rows={4} placeholder="Summarize the project context, purpose, and delivery approach..." />
              <div className="grid gap-5 lg:grid-cols-2">
                <ArrayField control={form.control} name="scopeOfWork" label="Scope of Work" placeholder="e.g. Asphalt surfacing and drainage" />
                <ArrayField control={form.control} name="technologies" label="Technologies / Methods" placeholder="e.g. Reinforced concrete systems" />
              </div>
              <FormInput name="challenge" label="Key Challenge" type="textarea" rows={3} placeholder="Describe the main challenge..." />
              <FormInput name="solution" label="Solution" type="textarea" rows={3} placeholder="Describe the solution approach..." />
              <FormInput name="result" label="Final Result" type="textarea" rows={3} placeholder="Describe the outcome..." />
            </section>

            <section className="space-y-4">
              <SectionTitle title="Media" description="High-quality visuals used in the portfolio and gallery." />
              <FormInput name="coverImage" label="Cover Image URL" placeholder="https://..." />
              <Button type="button" variant="outline" className="relative w-full overflow-hidden" disabled={uploading}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null
                    event.target.value = ''
                    void handleImageUpload(file)
                  }}
                />
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
                {uploading ? 'Uploading...' : 'Upload Cover Image'}
              </Button>
              {form.watch('coverImage') && (
                <img src={form.watch('coverImage')} className="h-44 w-full rounded-2xl border border-slate-200 object-cover" alt="preview" />
              )}
              <p className="pt-2 text-sm font-bold text-slate-700 dark:text-slate-200">Gallery</p>
              <p className="text-xs font-medium text-slate-500">
                {editingId
                  ? 'Gallery photos are saved to the project as soon as they upload or are removed. The cover image and other fields are saved with Save Project.'
                  : 'Gallery photos are saved with the project when you create it.'}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {(form.watch('galleryImages') || []).map((img, idx) => {
                  const removing = removingImages.includes(img)
                  return (
                    <div key={img} className={`group relative aspect-square overflow-hidden rounded-xl border border-slate-200${removing ? ' opacity-50' : ''}`}>
                      <img src={img} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => (editingId ? setConfirmingRemoval(img) : void removeGalleryImage(img))}
                        disabled={removing}
                        aria-label={`Remove photo ${idx + 1}`}
                        className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        {removing ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                      </button>
                      {confirmingRemoval === img && !removing && (
                        <div role="alertdialog" aria-label={`Remove photo ${idx + 1} from the project?`} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/80 p-2 text-center">
                          <span className="text-[11px] font-bold leading-tight text-white">Remove from project?</span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => { setConfirmingRemoval(null); void removeGalleryImage(img) }}
                              className="rounded-lg bg-red-500 px-2 py-1 text-[11px] font-bold text-white hover:bg-red-600"
                            >
                              Remove
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingRemoval(null)}
                              className="rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                            >
                              Keep
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div className="relative flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:border-teal-500">
                  {uploadingGallery ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                      <span className="mt-1 text-xs">{galleryUpload?.done ?? 0}/{galleryUpload?.total ?? 0}</span>
                    </>
                  ) : <><Plus className="mb-1 h-6 w-6" /><span className="text-xs">Add Photos</span></>}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    disabled={uploadingGallery}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(event) => {
                      const files = Array.from(event.target.files || [])
                      event.target.value = ''
                      void handleGalleryUpload(files)
                    }}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle title="Map Location" description="Optional coordinates for placing the project on the Malawi map." />
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput name="coordinates.lat" label="Latitude" type="number" step="any" placeholder="-13.9626" />
                <FormInput name="coordinates.lng" label="Longitude" type="number" step="any" placeholder="33.7741" />
              </div>
            </section>

            <div className="sticky bottom-0 flex gap-3 border-t border-slate-100 bg-white py-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={save.isPending || isUploading}>
                {save.isPending || isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {save.isPending ? 'Saving...' : isUploading ? 'Waiting for uploads...' : 'Save Project'}
              </Button>
            </div>
          </form>
        </Form>
      </GlobalModal>
    </div>
  )
}
