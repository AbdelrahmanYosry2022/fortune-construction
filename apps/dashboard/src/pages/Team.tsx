import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, uploadImage } from '../lib/api'
import { DataUnavailableState } from '../components/errors/DataUnavailableState'
import { getApiErrorMessage } from '../lib/errorHandling'
import { Plus, Pencil, Trash2, Loader2, ImagePlus, User } from 'lucide-react'
import { toast } from 'sonner'
import { 
  useFormSchema, 
  teamSchema, 
  TeamFormData, 
  FormInput, 
  Form, 
  Button,
  GlobalModal,
  Card
} from '@fortune/shared-ui'

interface Member extends TeamFormData {
  _id: string;
  order?: number;
}

const EMPTY_FORM: TeamFormData = { name: '', role: '', bio: '', photo: '', socialLinks: {} }

export default function Team() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const form = useFormSchema({
    schema: teamSchema,
    defaultValues: EMPTY_FORM
  })

  const { data, isLoading, error, refetch } = useQuery<Member[]>({
    queryKey: ['team'],
    queryFn: () => api.get('/team').then(r => r.data),
  })
  const members = data ?? []
  const deleteTarget = members.find(m => m._id === deleteId)

  const save = useMutation({
    mutationFn: (data: TeamFormData) => 
      editingId ? api.put(`/team/${editingId}`, data) : api.post('/team', data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['team'] })
      toast.success('Team member saved successfully!')
      setModalOpen(false) 
    },
    onError: (error) => toast.error(`Failed to save team member: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/team/${id}`),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['team'] })
      toast.success('Team member deleted') 
    },
    onError: (error) => toast.error(`Failed to delete team member: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  const handleImageUpload = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    try { 
      const url = await uploadImage(file)
      form.setValue('photo', url) 
    } 
    catch (error) { toast.error(`Image upload failed: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }) }
    finally { setUploading(false) }
  }

  const openAdd = () => { 
    setEditingId(null)
    form.reset(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (m: Member) => { 
    setEditingId(m._id)
    form.reset({
      name: m.name,
      role: m.role,
      bio: m.bio || '',
      photo: m.photo || '',
      socialLinks: m.socialLinks || {}
    })
    setModalOpen(true)
  }

  const onSubmit = (data: TeamFormData) => {
    save.mutate(data)
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-sky-500 animate-spin" /></div>

  // `!data`, not `isError`: a load paused while offline must not look like an empty list either.
  if (!data) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Leadership Team</h1>
            <p className="text-sm text-slate-500 mt-1">Manage the profiles of the visionary professionals leading Fortune Construction.</p>
          </div>
        </div>
        <DataUnavailableState
          resourceLabel="team members"
          error={error}
          message={`Could not load team members: ${getApiErrorMessage(error, 'please try again')}`}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Leadership Team</h1>
          <p className="text-sm text-slate-500 mt-1">Manage the profiles of the visionary professionals leading Fortune Construction.</p>
        </div>
        <Button onClick={openAdd} className="shadow-lg shadow-teal-500/20">
          <Plus className="w-4 h-4 mr-2" /> Add Member
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {members.map(m => (
          <Card key={m._id} className="p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 group">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4 ring-4 ring-teal-50 dark:ring-teal-900/20 ring-offset-4 ring-offset-white dark:ring-offset-slate-900">
              {m.photo
                ? <img src={m.photo} alt={m.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                : <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700"><User className="w-10 h-10" /></div>}
            </div>
            
            <div className="flex-1 w-full">
              <p className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{m.name}</p>
              <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 mt-1.5 uppercase tracking-[0.2em]">{m.role}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 line-clamp-3 leading-relaxed px-2">{m.bio}</p>
            </div>

            <div className="flex gap-2 w-full mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
              <Button variant="outline" onClick={() => openEdit(m)} className="flex-1 h-9 text-[10px] font-bold uppercase tracking-wider">
                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
              </Button>
              <Button variant="destructive" onClick={() => setDeleteId(m._id)} disabled={remove.isPending} className="h-9 px-3">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <GlobalModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Team Member"
        description={deleteTarget ? `Delete “${deleteTarget.name}”? This cannot be undone.` : 'Delete this team member? This cannot be undone.'}
        type="destructive"
        actionText="Delete"
        onAction={() => {
          if (deleteId) remove.mutate(deleteId)
          setDeleteId(null)
        }}
      />

      <GlobalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingId ? 'Edit Member' : 'Add Member'}
        type="custom"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1 max-h-[70vh] overflow-y-auto">
            {/* Avatar preview */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 ring-2 ring-sky-100 relative group">
                {form.watch('photo') ? (
                  <img src={form.watch('photo')} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><User className="w-8 h-8" /></div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImagePlus className="w-6 h-6 text-white" />
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => { const file = e.target.files?.[0] || null; e.target.value = ''; handleImageUpload(file) }} 
                  disabled={uploading}
                />
              </div>
              {uploading && <span className="text-xs text-slate-500 flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Uploading...</span>}
            </div>

            <FormInput name="name" label="Full Name *" placeholder="e.g. John Doe" />
            <FormInput name="role" label="Role / Title *" placeholder="e.g. Managing Director" />
            <FormInput name="bio" label="Biography *" type="textarea" rows={3} />
            
            <FormInput name="photo" label="Profile Image (URL or Upload)" placeholder="https://..." />
            <div className="flex items-end mb-4">
              <Button type="button" variant="outline" className="w-full relative overflow-hidden" disabled={uploading}>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => { const file = e.target.files?.[0] || null; e.target.value = ''; handleImageUpload(file) }} 
                />
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-2" />}
                {uploading ? 'Uploading...' : 'Upload Image'}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormInput name="socialLinks.linkedin" label="LinkedIn (optional)" placeholder="https://linkedin.com/in/..." />
              <FormInput name="socialLinks.twitter" label="Twitter (optional)" placeholder="https://twitter.com/..." />
            </div>

            <div className="flex gap-3 pt-4 pb-2 sticky bottom-0 bg-white">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {save.isPending ? 'Saving...' : 'Save Member'}
              </Button>
            </div>
          </form>
        </Form>
      </GlobalModal>
    </div>
  )
}
