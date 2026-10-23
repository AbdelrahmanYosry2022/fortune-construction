import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { DataUnavailableState } from '../components/errors/DataUnavailableState'
import { getApiErrorMessage } from '../lib/errorHandling'
import { Plus, Pencil, Trash2, Loader2, MapPin, Clock, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { toast } from 'sonner'
import { 
  useFormSchema, 
  jobSchema, 
  JobFormData, 
  FormInput, 
  Form, 
  Button,
  GlobalModal,
  Card
} from '@fortune/shared-ui'

interface Job extends JobFormData {
  _id: string;
}

const EMPTY_FORM: JobFormData = { title: '', location: '', type: 'Full-time', description: '', requirements: [], isActive: true }

export default function Jobs() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deactivateJob, setDeactivateJob] = useState<Job | null>(null)
  const [reqInput, setReqInput] = useState('')

  const form = useFormSchema({
    schema: jobSchema,
    defaultValues: EMPTY_FORM
  })

  const { data, isLoading, error, refetch } = useQuery<Job[]>({
    queryKey: ['jobs-all'],
    queryFn: () => api.get('/jobs/all').then(r => r.data),
  })
  const jobs = data ?? []
  // `!data`, not `isError`: a load paused while offline must not look like an empty list either.
  const loadFailed = !data
  const deleteTarget = jobs.find(j => j._id === deleteId)

  const save = useMutation({
    mutationFn: (data: JobFormData) => 
      editingId ? api.put(`/jobs/${editingId}`, data) : api.post('/jobs', data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['jobs-all'] })
      toast.success('Job saved successfully!')
      setModalOpen(false) 
    },
    onError: (error) => toast.error(`Failed to save job: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/jobs/${id}`),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['jobs-all'] })
      toast.success('Job deleted') 
    },
    onError: (error) => toast.error(`Failed to delete job: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.put(`/jobs/${id}`, { isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs-all'] }); toast.success('Status updated') },
    onError: (error, { isActive }) => toast.error(`Failed to ${isActive ? 'activate' : 'deactivate'} job: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  const openAdd = () => { 
    setEditingId(null)
    form.reset(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (j: Job) => { 
    setEditingId(j._id)
    form.reset({
      title: j.title,
      location: j.location,
      type: j.type,
      description: j.description,
      requirements: [...j.requirements],
      isActive: j.isActive
    })
    setReqInput('')
    setModalOpen(true)
  }

  const addReq = () => { 
    if (reqInput.trim()) { 
      const currentReqs = form.getValues('requirements') || []
      form.setValue('requirements', [...currentReqs, reqInput.trim()])
      setReqInput('') 
    } 
  }

  const removeReq = (i: number) => {
    const currentReqs = form.getValues('requirements') || []
    form.setValue('requirements', currentReqs.filter((_, idx) => idx !== i))
  }

  const onSubmit = (data: JobFormData) => {
    save.mutate(data)
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-sky-500 animate-spin" /></div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Job Positions</h1>
          <p className="text-sm text-slate-500 mt-1">{loadFailed ? 'Job positions could not be loaded' : `${jobs.filter(j => j.isActive).length} active · ${jobs.length} total`}</p>
        </div>
        {!loadFailed && (
          <Button onClick={openAdd} className="shadow-lg shadow-teal-500/20">
            <Plus className="w-4 h-4 mr-2" /> Add Position
          </Button>
        )}
      </div>

      {loadFailed && (
        <DataUnavailableState
          resourceLabel="job positions"
          error={error}
          message={`Could not load job positions: ${getApiErrorMessage(error, 'please try again')}`}
          onRetry={() => refetch()}
        />
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {jobs.map(j => (
          <Card key={j._id} className={`p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-100 dark:border-slate-800 ${!j.isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{j.title}</h3>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-800"><MapPin className="w-3 h-3 text-teal-500" />{j.location}</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-800"><Clock className="w-3 h-3 text-teal-500" />{j.type}</span>
                </div>
              </div>
              <button
                onClick={() => j.isActive ? setDeactivateJob(j) : toggle.mutate({ id: j._id, isActive: true })}
                className={`flex-shrink-0 transition-all duration-300 ${j.isActive ? 'text-teal-500 hover:text-teal-600' : 'text-slate-300 hover:text-slate-400'} hover:scale-110`}
                title={j.isActive ? 'Deactivate' : 'Activate'}
              >
                {j.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">{j.description}</p>
            {j.requirements.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                {j.requirements.slice(0, 3).map((r, i) => (
                  <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/30 rounded-md px-2 py-1">{r}</span>
                ))}
                {j.requirements.length > 3 && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 self-center">+{j.requirements.length - 3} more</span>}
              </div>
            )}
            <div className="flex gap-3 w-full mt-auto">
              <Button variant="outline" onClick={() => openEdit(j)} className="flex-1 h-9 text-xs font-bold uppercase tracking-wider">
                <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
              </Button>
              <Button variant="destructive" onClick={() => setDeleteId(j._id)} disabled={remove.isPending} className="h-9 px-4">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <GlobalModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Job"
        description={deleteTarget ? `Delete “${deleteTarget.title}”? It will be removed from the careers page. This cannot be undone.` : 'Delete this job position? This cannot be undone.'}
        type="destructive"
        actionText="Delete"
        onAction={() => {
          if (deleteId) remove.mutate(deleteId)
          setDeleteId(null)
        }}
      />

      <GlobalModal
        open={!!deactivateJob}
        onOpenChange={(open) => !open && setDeactivateJob(null)}
        title="Deactivate Job"
        description={`Deactivate “${deactivateJob?.title ?? ''}”? It will be hidden from the careers page until you activate it again.`}
        type="destructive"
        actionText="Deactivate"
        onAction={() => {
          if (deactivateJob) toggle.mutate({ id: deactivateJob._id, isActive: false })
          setDeactivateJob(null)
        }}
      />

      <GlobalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingId ? 'Edit Position' : 'Add Position'}
        type="custom"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1 max-h-[70vh] overflow-y-auto">
            <FormInput name="title" label="Job Title *" placeholder="e.g. Senior Engineer" />
            
            <div className="grid grid-cols-2 gap-3">
              <FormInput name="location" label="Location" placeholder="Lilongwe, Malawi" />
              <FormInput 
                name="type" 
                label="Type" 
                type="select" 
                options={[
                  { label: 'Full-time', value: 'Full-time' },
                  { label: 'Part-time', value: 'Part-time' },
                  { label: 'Contract', value: 'Contract' },
                  { label: 'Internship', value: 'Internship' }
                ]} 
              />
            </div>
            
            <FormInput name="description" label="Description" type="textarea" rows={3} />
            
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Requirements</label>
              <div className="flex gap-2 mb-2">
                <input 
                  className="flex h-10 w-full rounded-md border border-input bg-white/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                  value={reqInput} 
                  onChange={e => setReqInput(e.target.value)} 
                  placeholder="Add a requirement..." 
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addReq())} 
                />
                <Button type="button" variant="secondary" onClick={addReq} className="px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch('requirements')?.map((r, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs bg-sky-50 text-sky-700 border border-sky-100 rounded-md px-2 py-1">
                    {r}
                    <button type="button" onClick={() => removeReq(i)} className="hover:text-red-500 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700">Active</label>
              <button 
                type="button" 
                onClick={() => form.setValue('isActive', !form.watch('isActive'))} 
                className={form.watch('isActive') ? 'text-green-500' : 'text-gray-400'}
              >
                {form.watch('isActive') ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
              </button>
            </div>

            <div className="flex gap-3 pt-4 pb-2 sticky bottom-0 bg-white">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {save.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </GlobalModal>
    </div>
  )
}
