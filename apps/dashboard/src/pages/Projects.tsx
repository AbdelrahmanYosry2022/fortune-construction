import { useMemo, useState } from 'react'
import { useFieldArray } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, uploadImage } from '../lib/api'
import { DataUnavailableState } from '../components/errors/DataUnavailableState'
import { isNetworkUnavailableError } from '../lib/errorHandling'
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
    yearCompleted,
    scopeOfWork: (data.scopeOfWork || []).filter(Boolean),
    technologies: (data.technologies || []).filter(Boolean),
    galleryImages: data.galleryImages || [],
    coordinates: {
      lat: data.coordinates?.lat === '' ? undefined : data.coordinates?.lat,
      lng: data.coordinates?.lng === '' ? undefined : data.coordinates?.lng,
    },
  }
}

export default function Projects() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  const form = useFormSchema({
    schema: projectSchema,
    defaultValues: EMPTY_FORM,
  })

  const {
    data: projects = [],
    error: projectsError,
    isError: projectsHasError,
    isLoading,
    refetch: retryProjects,
  } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data),
  })

  const {
    data: categories = [],
    error: categoriesError,
    isError: categoriesHasError,
    refetch: retryCategories,
  } = useQuery<ProjectCategory[]>({
    queryKey: ['project-categories'],
    queryFn: () => api.get('/project-categories').then((r) => r.data),
  })

  const categoryOptions = categories
    .filter((category) => category.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((category) => ({ label: category.name, value: category.name }))

  const save = useMutation({
    mutationFn: (data: ProjectFormData) =>
      editingId ? api.put(`/projects/${editingId}`, cleanProjectPayload(data)) : api.post('/projects', cleanProjectPayload(data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project saved successfully!')
      setModalOpen(false)
    },
    onError: () => toast.error('Failed to save project'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully')
    },
  })

  const openAdd = () => {
    setEditingId(null)
    form.reset({ ...EMPTY_FORM, category: categoryOptions[0]?.value || '' })
    setModalOpen(true)
  }

  const openEdit = (project: Project) => {
    setEditingId(project._id)
    form.reset(normalizeProjectForForm(project))
    setModalOpen(true)
  }

  const handleImageUpload = async (file: File | null) => {
    if (!file) return
    setUploadingGallery(false)
    setUploading(true)
    try {
      const url = await uploadImage(file)
      form.setValue('coverImage', url)
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploadingGallery(true)
    try {
      const uploadPromises = Array.from(files).map((file) => uploadImage(file))
      const urls = await Promise.all(uploadPromises)
      const current = form.getValues('galleryImages') || []
      form.setValue('galleryImages', [...current, ...urls])
    } catch {
      toast.error('Gallery upload failed')
    } finally {
      setUploadingGallery(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    const current = form.getValues('galleryImages') || []
    form.setValue('galleryImages', current.filter((_, i) => i !== index))
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

  if (projectsHasError && isNetworkUnavailableError(projectsError)) {
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
          onRetry={() => void retryProjects()}
          resourceLabel="project records"
          title="Projects temporarily unavailable"
        />
      </div>
    )
  }

  const categoriesUnavailable = categoriesHasError && isNetworkUnavailableError(categoriesError)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">{projects.length} projects total</p>
        </div>
        <Button onClick={openAdd} className="shadow-lg shadow-teal-500/20">
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
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
                <Button variant="destructive" onClick={() => setDeleteId(project._id)} className="h-9 px-4">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <GlobalModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        type="destructive"
        actionText="Delete"
        onAction={() => {
          if (deleteId) remove.mutate(deleteId)
          setDeleteId(null)
        }}
      />

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
                <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={(event) => handleImageUpload(event.target.files?.[0] || null)} />
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
                {uploading ? 'Uploading...' : 'Upload Cover Image'}
              </Button>
              {form.watch('coverImage') && (
                <img src={form.watch('coverImage')} className="h-44 w-full rounded-2xl border border-slate-200 object-cover" alt="preview" />
              )}
              <div className="grid grid-cols-3 gap-3">
                {(form.watch('galleryImages') || []).map((img, idx) => (
                  <div key={img} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200">
                    <img src={img} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <div className="relative flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:border-teal-500">
                  {uploadingGallery ? <Loader2 className="h-6 w-6 animate-spin text-teal-500" /> : <><Plus className="mb-1 h-6 w-6" /><span className="text-xs">Add Photos</span></>}
                  <input type="file" accept="image/*" multiple className="absolute inset-0 cursor-pointer opacity-0" onChange={(event) => handleGalleryUpload(event.target.files)} />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle title="Map Location" description="Optional coordinates for placing the project on the Malawi map." />
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput name="coordinates.lat" label="Latitude" type="number" placeholder="-13.9626" />
                <FormInput name="coordinates.lng" label="Longitude" type="number" placeholder="33.7741" />
              </div>
            </section>

            <div className="sticky bottom-0 flex gap-3 border-t border-slate-100 bg-white py-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {save.isPending ? 'Saving...' : 'Save Project'}
              </Button>
            </div>
          </form>
        </Form>
      </GlobalModal>
    </div>
  )
}
