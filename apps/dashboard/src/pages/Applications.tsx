import React, { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, resolveUploadUrl } from '../lib/api'
import { DataUnavailableState } from '../components/errors/DataUnavailableState'
import { getApiErrorMessage } from '../lib/errorHandling'
import { Trash2, ChevronDown, Search, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { GlobalModal } from '@fortune/shared-ui'

interface Application {
  _id: string; fullName: string; email: string; phone: string;
  position: string; coverLetter: string; cvFile?: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected'; createdAt: string;
}

const STATUSES = ['new', 'reviewed', 'shortlisted', 'rejected'] as const

export default function Applications() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useQuery<Application[]>({
    queryKey: ['applications', filterStatus],
    queryFn: () => api.get('/applications', { params: filterStatus ? { status: filterStatus } : {} }).then(r => r.data),
  })
  const apps = useMemo(() => data ?? [], [data])
  // `!data`, not `isError`: a load paused while offline must not look like an empty list either.
  const loadFailed = !data
  const deleteTarget = apps.find(a => a._id === deleteId)

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/applications/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['applications'] }); qc.invalidateQueries({ queryKey: ['stats'] }); toast.success('Status updated') },
    onError: (error) => toast.error(`Failed to update application status: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/applications/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['applications'] }); qc.invalidateQueries({ queryKey: ['stats'] }); toast.success('Deleted') },
    onError: (error) => toast.error(`Failed to delete application: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  const normalizedSearch = useMemo(() => search.trim().toLowerCase(), [search])
  const filtered = useMemo(() => {
    if (!normalizedSearch) return apps

    return apps.filter((application) =>
      application.fullName.toLowerCase().includes(normalizedSearch) ||
      application.email.toLowerCase().includes(normalizedSearch) ||
      application.position.toLowerCase().includes(normalizedSearch)
    )
  }, [apps, normalizedSearch])

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Job Applications</h1>
          <p className="text-sm text-slate-500 mt-1">{loadFailed ? 'Applications could not be loaded' : `${apps.length} total applications found`}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all" 
            placeholder="Search by name, email, or position..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <select 
          className="h-11 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all cursor-pointer min-w-[160px]" 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {loadFailed ? (
          <DataUnavailableState
            className="m-6"
            resourceLabel="applications"
            error={error}
            message={`Could not load applications: ${getApiErrorMessage(error, 'please try again')}`}
            onRetry={() => refetch()}
          />
        ) : filtered.length === 0 ? (
          <div className="px-6 py-20 text-center text-slate-400 dark:text-slate-600">
            <p className="mx-auto max-w-xs text-sm font-medium leading-6">
              No applications found matching your criteria
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Applicant</th>
                  <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Position</th>
                  <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Status</th>
                  <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filtered.map(a => (
                  <React.Fragment key={a._id}>
                    <tr className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-sm flex-shrink-0 border border-teal-100 dark:border-teal-900/30">
                            {a.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-none mb-1.5">{a.fullName}</p>
                            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 tracking-tight">{a.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{a.position}</span>
                      </td>
                      <td className="px-6 py-5">
                        <select
                          className={`text-[10px] font-bold uppercase tracking-wider rounded-full border px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all
                            ${a.status === 'new' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30' : ''}
                            ${a.status === 'reviewed' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30' : ''}
                            ${a.status === 'shortlisted' ? 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-900/30' : ''}
                            ${a.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30' : ''}
                          `}
                          value={a.status}
                          onChange={e => updateStatus.mutate({ id: a._id, status: e.target.value })}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-5 text-slate-400 dark:text-slate-500 text-xs font-medium">{new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 justify-end">
                          {a.cvFile && (
                            <a
                              href={resolveUploadUrl(a.cvFile)}
                              target="_blank"
                              rel="noreferrer"
                              className="h-8 px-3 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
                            >
                              <FileText className="w-3.5 h-3.5 text-teal-500" /> CV
                            </a>
                          )}
                          <button
                            onClick={() => setExpanded(expanded === a._id ? null : a._id)}
                            className={`h-8 w-8 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-full transition-all ${expanded === a._id ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400' : ''}`}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded === a._id ? 'rotate-180' : ''}`} />
                          </button>
                          <button
                            onClick={() => setDeleteId(a._id)}
                            disabled={remove.isPending}
                            className="h-8 w-8 flex items-center justify-center bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-500 rounded-full transition-all disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded === a._id && (
                      <tr key={`${a._id}-exp`} className="bg-slate-50/50 dark:bg-slate-900/50">
                        <td colSpan={5} className="px-10 py-8 border-l-2 border-teal-500">
                          <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Cover Letter / Introduction</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">{a.coverLetter || 'No cover letter provided'}</p>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Contact Details</h4>
                              <div className="bg-white dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{a.phone}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{a.email}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <GlobalModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Application"
        description={deleteTarget ? `Delete the application from “${deleteTarget.fullName}” (${deleteTarget.position})? This cannot be undone.` : 'Delete this application? This cannot be undone.'}
        type="destructive"
        actionText="Delete"
        onAction={() => {
          if (deleteId) remove.mutate(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
