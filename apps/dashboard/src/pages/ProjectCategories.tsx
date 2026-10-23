import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { api } from '../lib/api'
import { DataUnavailableState } from '../components/errors/DataUnavailableState'
import { getApiErrorMessage } from '../lib/errorHandling'
import { BadgeCheck, Layers3, Loader2, Pencil, Plus, Power, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Card, Form, FormInput, GlobalModal, useFormSchema } from '@fortune/shared-ui'

interface ProjectCategory {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  isActive: boolean;
}

const categorySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().optional(),
  icon: z.string().optional(),
  order: z.coerce.number().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

const EMPTY_FORM: CategoryFormData = {
  name: '',
  slug: '',
  icon: 'Layers3',
  order: '',
  isActive: true,
}

export default function ProjectCategories() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProjectCategory | null>(null)

  const form = useFormSchema({
    schema: categorySchema,
    defaultValues: EMPTY_FORM,
  })

  const { data: categories, error, isLoading, refetch } = useQuery<ProjectCategory[]>({
    queryKey: ['project-categories'],
    queryFn: () => api.get('/project-categories').then((r) => r.data),
  })

  const save = useMutation({
    mutationFn: (data: CategoryFormData) =>
      editingId ? api.put(`/project-categories/${editingId}`, data) : api.post('/project-categories', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-categories'] })
      toast.success('Category saved successfully')
      setModalOpen(false)
    },
    onError: (error) => toast.error(`Failed to save category: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  const disable = useMutation({
    mutationFn: (category: ProjectCategory) =>
      category.isActive
        ? api.delete(`/project-categories/${category._id}`)
        : api.put(`/project-categories/${category._id}`, { isActive: true }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['project-categories'] })
      // DELETE answers "Category deleted" or "Category disabled because it is used by projects"
      toast.success(typeof res.data?.message === 'string' ? res.data.message : 'Category updated')
    },
    onError: (error, category) =>
      toast.error(`Failed to ${category.isActive ? 'delete' : 're-enable'} category: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  const openAdd = () => {
    setEditingId(null)
    form.reset(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (category: ProjectCategory) => {
    setEditingId(category._id)
    form.reset(category)
    setModalOpen(true)
  }

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div>
  }

  if (!categories) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Project Categories</h1>
            <p className="mt-1 text-sm text-slate-500">Manage the public project filter taxonomy.</p>
          </div>
        </div>
        <DataUnavailableState
          resourceLabel="project categories"
          error={error}
          message={`Could not load project categories: ${getApiErrorMessage(error, 'please try again')}`}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Project Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Manage the public project filter taxonomy.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {categories.map((category) => (
          <Card key={category._id} className="flex items-center justify-between gap-5 border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                <Layers3 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white">{category.name}</h3>
                  {category.isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700">
                      <BadgeCheck className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">Disabled</span>
                  )}
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-500">/{category.slug} • icon: {category.icon || 'Layers3'} • order: {category.order || 0}</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" className="h-10 px-3" onClick={() => openEdit(category)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant={category.isActive ? 'destructive' : 'outline'}
                className="h-10 px-3"
                disabled={disable.isPending}
                onClick={() => (category.isActive ? setDeleteTarget(category) : disable.mutate(category))}
              >
                {category.isActive ? <Trash2 className="h-4 w-4" /> : <Power className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <GlobalModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Category"
        description={`Delete “${deleteTarget?.name}”? If any projects still use this category it is disabled instead (hidden from the public project filters, and you can re-enable it here later). Otherwise it is deleted permanently and this cannot be undone.`}
        type="destructive"
        actionText="Delete"
        onAction={() => {
          if (deleteTarget) disable.mutate(deleteTarget)
          setDeleteTarget(null)
        }}
      />

      <GlobalModal open={modalOpen} onOpenChange={setModalOpen} title={editingId ? 'Edit Category' : 'Add Category'} type="custom">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => save.mutate(data))} className="space-y-4">
            <FormInput name="name" label="Category Name *" placeholder="Roads" />
            <FormInput name="slug" label="Slug" placeholder="roads" />
            <FormInput name="icon" label="Icon Key" placeholder="Route" />
            <FormInput name="order" label="Display Order" type="number" min="0" placeholder="1" />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Category
              </Button>
            </div>
          </form>
        </Form>
      </GlobalModal>
    </div>
  )
}
