import { useState, type ReactNode } from 'react'
import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArchiveRestore, ImagePlus, Loader2, RotateCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button, GlobalModal } from '@fortune/shared-ui'
import { api } from '../../lib/api'
import { getApiErrorMessage } from '../../lib/errorHandling'
import { DataUnavailableState } from '../errors/DataUnavailableState'

// Trashed projects have their own query: the ['projects'] list never contains them.
export const PROJECT_TRASH_QUERY_KEY = ['projects-trash'] as const

// Must match the API's TTL index on Project.deletedAt.
const TRASH_RETENTION_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

const RESTORE_MUTATION_KEY = ['projects-trash', 'restore'] as const
const PURGE_MUTATION_KEY = ['projects-trash', 'purge'] as const

export interface TrashedProject {
  _id: string
  title: string
  category?: string
  coverImage?: string
  deletedAt: string
  purgeAt?: string
}

async function fetchProjectTrash(): Promise<TrashedProject[]> {
  const { data } = await api.get('/projects/trash')
  // Anything but a list (e.g. an older API answering another route) must show as a failed load,
  // never as an empty trash.
  if (!Array.isArray(data)) throw new Error('Unexpected response from the server')
  return data as TrashedProject[]
}

export function useProjectTrash(options: { refetchOnMount?: boolean | 'always' } = {}) {
  return useQuery<TrashedProject[]>({
    queryKey: PROJECT_TRASH_QUERY_KEY,
    queryFn: fetchProjectTrash,
    ...options,
  })
}

function toValidDate(value?: string | null) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function formatDay(date?: Date) {
  if (!date) return 'an unknown date'
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function getPurgeDate(project: TrashedProject) {
  const purgeAt = toValidDate(project.purgeAt)
  if (purgeAt) return purgeAt
  const deletedAt = toValidDate(project.deletedAt)
  return deletedAt ? new Date(deletedAt.getTime() + TRASH_RETENTION_DAYS * DAY_MS) : undefined
}

export function RecentlyDeletedButton({ onClick }: { onClick: () => void }) {
  const { data } = useProjectTrash()
  const count = data?.length ?? 0

  return (
    <Button variant="outline" onClick={onClick}>
      <ArchiveRestore className="mr-2 h-4 w-4" />
      {count > 0 ? `Recently deleted (${count})` : 'Recently deleted'}
    </Button>
  )
}

export function ProjectTrashPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  // Mounted only while open, so every opening reloads the trash from the server.
  if (!open) return null
  return <ProjectTrashPanelContent onClose={() => onOpenChange(false)} />
}

function ProjectTrashPanelContent({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [purgeTarget, setPurgeTarget] = useState<TrashedProject | null>(null)
  const { data: trash, error, isLoading, refetch } = useProjectTrash({ refetchOnMount: 'always' })

  // Callbacks live on the mutation options (not on mutate()) so they still run if the panel is closed mid-request.
  // Returning the invalidation keeps the row disabled until the refreshed list arrives.
  const restore = useMutation({
    mutationKey: RESTORE_MUTATION_KEY,
    mutationFn: (id: string) => api.post(`/projects/${id}/restore`),
    onSuccess: () => {
      toast.success('Project restored')
      return Promise.all([
        qc.invalidateQueries({ queryKey: ['projects'] }),
        qc.invalidateQueries({ queryKey: PROJECT_TRASH_QUERY_KEY }),
        qc.invalidateQueries({ queryKey: ['stats'] }),
      ])
    },
    onError: (error) => toast.error(`Failed to restore project: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  const purge = useMutation({
    mutationKey: PURGE_MUTATION_KEY,
    mutationFn: (id: string) => api.delete(`/projects/${id}/permanent`),
    onSuccess: () => {
      toast.success('Project permanently deleted')
      return qc.invalidateQueries({ queryKey: PROJECT_TRASH_QUERY_KEY })
    },
    onError: (error) => toast.error(`Failed to permanently delete project: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  // Every pending request, not only the latest one, so each busy row stays disabled.
  const restoringIds = useMutationState({
    filters: { mutationKey: RESTORE_MUTATION_KEY, status: 'pending' },
    select: (mutation) => mutation.state.variables as string,
  })
  const purgingIds = useMutationState({
    filters: { mutationKey: PURGE_MUTATION_KEY, status: 'pending' },
    select: (mutation) => mutation.state.variables as string,
  })

  let body: ReactNode
  if (isLoading && !trash) {
    body = <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div>
  } else if (!trash) {
    // A failed load must say so instead of looking like an empty trash.
    body = (
      <DataUnavailableState
        error={error}
        message={`Could not load deleted projects: ${getApiErrorMessage(error, 'please try again')}`}
        onRetry={() => void refetch()}
        resourceLabel="deleted projects"
        title="Recently deleted temporarily unavailable"
      />
    )
  } else if (trash.length === 0) {
    body = (
      <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm font-medium text-slate-500 dark:border-slate-800">
        Nothing in the trash.
      </div>
    )
  } else {
    body = (
      <ul className="space-y-3">
        {trash.map((project) => {
          const restoring = restoringIds.includes(project._id)
          const purging = purgingIds.includes(project._id)
          const busy = restoring || purging
          return (
            <li
              key={project._id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                  {project.coverImage ? (
                    <img src={project.coverImage} alt={project.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-700"><ImagePlus className="h-6 w-6" /></div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{project.title}</h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">Deleted {formatDay(toValidDate(project.deletedAt))}</p>
                  <p className="mt-0.5 text-xs font-medium text-red-600 dark:text-red-400">Permanently deleted on {formatDay(getPurgeDate(project))}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" disabled={busy} onClick={() => restore.mutate(project._id)}>
                  {restoring ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="mr-2 h-3.5 w-3.5" />}
                  {restoring ? 'Restoring...' : 'Restore'}
                </Button>
                <Button variant="destructive" size="sm" disabled={busy} onClick={() => setPurgeTarget(project)}>
                  {purging ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-2 h-3.5 w-3.5" />}
                  {purging ? 'Deleting...' : 'Delete permanently'}
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <>
      <GlobalModal
        open
        onOpenChange={(next) => !next && onClose()}
        title="Recently deleted"
        description={`Deleted projects are kept here for ${TRASH_RETENTION_DAYS} days, then removed for good. Restore a project to put it back.`}
        type="custom"
      >
        {body}
      </GlobalModal>

      {/* Rendered after the panel so it stacks on top of it. */}
      <GlobalModal
        open={!!purgeTarget}
        onOpenChange={(next) => !next && setPurgeTarget(null)}
        title="Delete project permanently"
        description={purgeTarget ? `Permanently delete “${purgeTarget.title}”? This cannot be undone.` : undefined}
        type="destructive"
        actionText="Delete permanently"
        onAction={() => {
          if (purgeTarget) purge.mutate(purgeTarget._id)
          setPurgeTarget(null)
        }}
      />
    </>
  )
}
