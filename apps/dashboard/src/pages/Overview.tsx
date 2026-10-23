import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { DataUnavailableState } from '../components/errors/DataUnavailableState'
import { getApiErrorMessage } from '../lib/errorHandling'
import { FolderKanban, MessageSquare, Briefcase, HardHat, Mail, Clock, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, Button } from '@fortune/shared-ui'

function StatCard({ label, value, icon: Icon, color, badge, onClick }: {
  label: string; value: number; icon: React.ElementType; color: string; badge?: string; onClick?: () => void
}) {
  return (
    <Card onClick={onClick} className={`p-6 flex flex-row items-center gap-5 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : ''} bg-white dark:bg-slate-900 rounded-2xl`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20 ${color}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-3xl font-display font-bold text-slate-900 dark:text-white leading-none mb-1">{value ?? 0}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</p>
      </div>
      {badge && (
        <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/20 px-2.5 py-1 rounded-full border border-teal-100 dark:border-teal-900/30 uppercase tracking-tight">{badge}</span>
      )}
    </Card>
  )
}

export default function Overview() {
  const navigate = useNavigate()
  const { data: stats, error, isLoading, refetch } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/stats').then(r => r.data),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Dashboard data could not be loaded.</p>
        </div>
        <DataUnavailableState
          error={error}
          message={`Could not load the dashboard overview: ${getApiErrorMessage(error, 'please try again')}`}
          onRetry={() => void refetch()}
          resourceLabel="dashboard overview"
          title="Overview data unavailable"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back! Here's your business performance summary.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard label="Total Projects" value={stats?.projects} icon={FolderKanban} color="bg-teal-600" onClick={() => navigate('/projects')} />
        <StatCard label="Job Positions" value={stats?.jobs} icon={HardHat} color="bg-slate-800" onClick={() => navigate('/jobs')} />
        <StatCard
          label="Applications"
          value={stats?.applications}
          icon={Briefcase}
          color="bg-slate-700"
          badge={stats?.newApplications > 0 ? `${stats.newApplications} new` : undefined}
          onClick={() => navigate('/applications')}
        />
        <StatCard
          label="Messages"
          value={stats?.messages}
          icon={MessageSquare}
          color="bg-teal-500"
          badge={stats?.unreadMessages > 0 ? `${stats.unreadMessages} unread` : undefined}
          onClick={() => navigate('/messages')}
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6 border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
        <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Quick Management</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => navigate('/projects')} className="shadow-lg shadow-teal-500/10">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
          <Button variant="secondary" onClick={() => navigate('/jobs')}>
            <Plus className="w-4 h-4 mr-2" /> New Job
          </Button>
          <Button variant="outline" onClick={() => navigate('/applications')}>
            <Briefcase className="w-4 h-4 mr-2" /> Applications
          </Button>
          <Button variant="outline" onClick={() => navigate('/messages')}>
            <Mail className="w-4 h-4 mr-2" /> Messages
          </Button>
        </div>
      </Card>

      {/* Recent rows */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card className="border-none shadow-sm p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h2 className="text-base font-bold text-gray-900">Recent Applications</h2>
            <button onClick={() => navigate('/applications')} className="text-xs text-sky-600 hover:text-sky-700 font-semibold">View All</button>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.recentApplications?.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No applications yet</p>
            )}
            {stats?.recentApplications?.map((a: { _id: string; fullName: string; position: string; status: string; createdAt: string }) => (
              <div key={a._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold text-xs flex-shrink-0">
                    {a.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{a.fullName}</p>
                    <p className="text-xs text-gray-400">{a.position}</p>
                  </div>
                </div>
                <span className={`badge-${a.status} px-2 py-0.5 rounded-full text-xs font-medium`}>{a.status}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Messages */}
        <Card className="border-none shadow-sm p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h2 className="text-base font-bold text-gray-900">Recent Messages</h2>
            <button onClick={() => navigate('/messages')} className="text-xs text-sky-600 hover:text-sky-700 font-semibold">View All</button>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.recentMessages?.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No messages yet</p>
            )}
            {stats?.recentMessages?.map((m: { _id: string; name: string; email: string; message: string; isRead: boolean; createdAt: string }) => (
              <div key={m._id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${m.isRead ? 'bg-gray-200' : 'bg-sky-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{m.name}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{m.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
