import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { DataUnavailableState } from '../components/errors/DataUnavailableState'
import { getApiErrorMessage } from '../lib/errorHandling'
import { Trash2, Mail, MailOpen, Search, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { GlobalModal } from '@fortune/shared-ui'

interface Message {
  _id: string; name: string; email: string; phone?: string;
  message: string; isRead: boolean; createdAt: string;
}

export default function Messages() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useQuery<Message[]>({
    queryKey: ['messages', filter],
    queryFn: () => api.get('/messages', { params: filter !== '' ? { isRead: filter } : {} }).then(r => r.data),
  })
  const messages = data ?? []
  // `!data`, not `isError`: a load paused while offline must not look like an empty list either.
  const loadFailed = !data
  const deleteTarget = messages.find(m => m._id === deleteId)

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/messages/${id}/read`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['messages'] }); qc.invalidateQueries({ queryKey: ['stats'] }) },
    onError: (error) => toast.error(`Failed to mark message as read: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/messages/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['messages'] }); qc.invalidateQueries({ queryKey: ['stats'] }); toast.success('Deleted') },
    onError: (error) => toast.error(`Failed to delete message: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  const filtered = messages.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  )

  const unread = messages.filter(m => !m.isRead).length

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Contact Messages</h1>
          <p className="text-sm text-slate-500 mt-1">{loadFailed ? 'Messages could not be loaded' : `${messages.length} total · ${unread} unread messages`}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all" 
            placeholder="Search messages by name, email, or content..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <select 
          className="h-11 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all cursor-pointer min-w-[160px]" 
          value={filter} 
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">All Messages</option>
          <option value="false">Unread Only</option>
          <option value="true">Read Messages</option>
        </select>
      </div>

      {/* Messages list */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-50 dark:divide-slate-800">
        {loadFailed && (
          <DataUnavailableState
            className="m-6"
            resourceLabel="messages"
            error={error}
            message={`Could not load messages: ${getApiErrorMessage(error, 'please try again')}`}
            onRetry={() => refetch()}
          />
        )}
        {!loadFailed && filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400 dark:text-slate-600 font-medium">No messages found</div>
        )}
        {filtered.map(m => (
          <div
            key={m._id}
            className={`p-6 transition-all duration-300 relative group ${!m.isRead ? 'bg-teal-50/20 dark:bg-teal-900/5' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'}`}
          >
            {!m.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500" />}
            
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 border transition-colors ${m.isRead ? 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700' : 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/30'}`}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1.5">
                    <p className={`font-bold text-base leading-none ${m.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>{m.name}</p>
                    {!m.isRead && <span className="flex h-2 w-2 rounded-full bg-teal-500" />}
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 ml-auto md:ml-0">{new Date(m.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap mb-4">
                    <a href={`mailto:${m.email}`} className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{m.email}</a>
                    {m.phone && <span className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{m.phone}</span>}
                  </div>
                  <div 
                    className={`relative bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 transition-all ${expanded !== m._id ? 'cursor-pointer hover:border-teal-500/30' : ''}`}
                    onClick={() => { setExpanded(expanded === m._id ? null : m._id); if (!m.isRead) markRead.mutate(m._id) }}
                  >
                    <p className={`text-sm text-slate-600 dark:text-slate-300 leading-relaxed ${expanded !== m._id ? 'line-clamp-2' : 'whitespace-pre-wrap'}`}>
                      {m.message}
                    </p>
                    {expanded !== m._id && m.message.length > 150 && (
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 dark:from-slate-800/40 to-transparent flex items-end justify-center pb-1 rounded-b-xl">
                        <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Show more</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {!m.isRead && (
                  <button 
                    onClick={() => markRead.mutate(m._id)} 
                    className="h-9 px-3 flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/30 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition-all" 
                    title="Mark as read"
                  >
                    <MailOpen className="w-3.5 h-3.5" /> Read
                  </button>
                )}
                <button 
                  onClick={() => setDeleteId(m._id)} 
                  disabled={remove.isPending}
                  className="h-9 w-9 flex items-center justify-center bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-500 rounded-full transition-all disabled:opacity-50"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <GlobalModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Message"
        description={deleteTarget ? `Delete the message from “${deleteTarget.name}”? This cannot be undone.` : 'Delete this message? This cannot be undone.'}
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
