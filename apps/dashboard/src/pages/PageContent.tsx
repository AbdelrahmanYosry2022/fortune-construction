import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, uploadMedia } from '../lib/api'
import { DataUnavailableState } from '../components/errors/DataUnavailableState'
import { Loader2, Save, Plus, Trash2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Card, Input, Textarea, MediaUploadField } from '@fortune/shared-ui'

const PAGES = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'projects', label: 'Projects' },
  { key: 'hse', label: 'HSE & Quality' },
  { key: 'careers', label: 'Careers' },
  { key: 'contact', label: 'Contact' },
] as const

type PageKey = typeof PAGES[number]['key']

// Section config: defines what sections exist per page and how to edit them
const SECTION_CONFIG: Record<string, { label: string; fields: FieldConfig[] }[]> = {
  home: [
    {
      label: 'Hero',
      fields: [
        { key: 'badge', label: 'Badge Text', type: 'text' },
        { key: 'title', label: 'Hero Title', type: 'text' },
        { key: 'subtitle', label: 'Hero Subtitle', type: 'textarea' },
        { key: 'videos', label: 'Background Videos', type: 'array', itemFields: [
          { key: 'url', label: 'Video URL (path or link)', type: 'media', accept: 'video' },
        ]},
      ],
    },
    {
      label: 'Impact Metrics',
      fields: [
        { key: 'title', label: 'Section Title', type: 'text' },
        { key: 'subtitle', label: 'Subtitle', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'items', label: 'Metrics', type: 'array', itemFields: [
          { key: 'target', label: 'Target Number', type: 'number' },
          { key: 'suffix', label: 'Suffix (e.g. +)', type: 'text' },
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'description', label: 'Description', type: 'text' },
          { key: 'icon', label: 'Icon (preset or image)', type: 'media', accept: 'any' },
        ]},
      ],
    },
    {
      label: 'Success Stories',
      fields: [
        { key: 'title', label: 'Section Title', type: 'text' },
        { key: 'subtitle', label: 'Subtitle', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'items', label: 'Stories', type: 'array', itemFields: [
          { key: 'quote', label: 'Quote', type: 'textarea' },
          { key: 'author', label: 'Author', type: 'text' },
          { key: 'org', label: 'Organization', type: 'text' },
          { key: 'initials', label: 'Initials', type: 'text' },
          { key: 'image', label: 'Author Photo', type: 'media', accept: 'image' },
          { key: 'order', label: 'Order', type: 'number' },
        ]},
      ],
    },
  ],
  about: [
    {
      label: 'Hero',
      fields: [
        { key: 'title', label: 'Hero Title', type: 'text' },
        { key: 'description', label: 'Hero Description', type: 'textarea' },
        { key: 'image', label: 'Background Image', type: 'media', accept: 'image' },
      ]
    },
    {
      label: 'Vision',
      fields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ],
    },
    {
      label: 'Mission',
      fields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ],
    },
    {
      label: 'Timeline',
      fields: [
        { key: 'title', label: 'Section Title', type: 'text' },
        { key: 'subtitle', label: 'Subtitle', type: 'text' },
        { key: 'items', label: 'Milestones', type: 'array', itemFields: [
          { key: 'year', label: 'Year', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'desc', label: 'Description', type: 'text' },
        ]},
      ],
    },
    {
      label: 'Core Values',
      fields: [
        { key: 'title', label: 'Section Title', type: 'text' },
        { key: 'subtitle', label: 'Subtitle', type: 'text' },
        { key: 'items', label: 'Values', type: 'array', itemFields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'desc', label: 'Description', type: 'text' },
          { key: 'icon', label: 'Icon (preset or image)', type: 'media', accept: 'any' },
        ]},
      ],
    },
  ],
  hse: [
    {
      label: 'Hero',
      fields: [
        { key: 'title', label: 'Hero Title', type: 'text' },
        { key: 'description', label: 'Hero Description', type: 'textarea' },
        { key: 'image', label: 'Background Image', type: 'media', accept: 'image' },
      ]
    },
    {
      label: 'Policies',
      fields: [
        { key: 'items', label: 'Policy Cards', type: 'array', itemFields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'icon', label: 'Icon (preset or image)', type: 'media', accept: 'any' },
        ]},
      ],
    },
    {
      label: 'Safety Stats',
      fields: [
        { key: 'items', label: 'Statistics', type: 'array', itemFields: [
          { key: 'value', label: 'Value', type: 'text' },
          { key: 'label', label: 'Label', type: 'text' },
        ]},
      ],
    },
    {
      label: 'Certifications',
      fields: [
        { key: 'title', label: 'Section Title', type: 'text' },
        { key: 'subtitle', label: 'Subtitle', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'items', label: 'Certifications', type: 'array', itemFields: [
          { key: 'title', label: 'Certificate Name', type: 'text' },
          { key: 'image', label: 'Certificate Image (preset or image)', type: 'media', accept: 'any' },
        ]},
      ],
    },
  ],
  careers: [
    {
      label: 'Hero',
      fields: [
        { key: 'title', label: 'Hero Title', type: 'text' },
        { key: 'description', label: 'Hero Description', type: 'textarea' },
        { key: 'image', label: 'Background Image', type: 'media', accept: 'image' },
      ]
    },
    {
      label: 'Benefits',
      fields: [
        { key: 'title', label: 'Section Title', type: 'text' },
        { key: 'subtitle', label: 'Subtitle', type: 'text' },
        { key: 'items', label: 'Benefits', type: 'array', itemFields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'desc', label: 'Description', type: 'text' },
          { key: 'icon', label: 'Icon (preset or image)', type: 'media', accept: 'any' },
        ]},
      ],
    },
  ],
  contact: [
    {
      label: 'Hero',
      fields: [
        { key: 'title', label: 'Hero Title', type: 'text' },
        { key: 'description', label: 'Hero Description', type: 'textarea' },
        { key: 'image', label: 'Background Image', type: 'media', accept: 'image' },
      ]
    }
  ],
  projects: [
    {
      label: 'Hero',
      fields: [
        { key: 'title', label: 'Hero Title', type: 'text' },
        { key: 'description', label: 'Hero Description', type: 'textarea' },
        { key: 'image', label: 'Background Image', type: 'media', accept: 'image' },
      ]
    }
  ]
}

interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'array' | 'media'
  accept?: 'image' | 'video' | 'any'
  itemFields?: FieldConfig[]
}

// Map section labels to API section keys
function sectionKey(label: string): string {
  const map: Record<string, string> = {
    'Hero': 'hero',
    'Impact Metrics': 'impactMetrics',
    'Vision': 'vision',
    'Mission': 'mission',
    'Timeline': 'timeline',
    'Core Values': 'coreValues',
    'Policies': 'policies',
    'Safety Stats': 'safetyStats',
    'Certifications': 'certifications',
    'Benefits': 'benefits',
    'Success Stories': 'successStories',
  }
  return map[label] || label.toLowerCase().replace(/\s+/g, '')
}

export default function PageContentEditor() {
  const [activePage, setActivePage] = useState<PageKey>('home')
  const qc = useQueryClient()

  const { data: pageData, isLoading, error, refetch } = useQuery<Record<string, Record<string, unknown>>>({
    queryKey: ['pageContent', activePage],
    queryFn: () => api.get(`/content/${activePage}`).then(r => r.data),
  })

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-sky-500 animate-spin" /></div>

  const sections = SECTION_CONFIG[activePage] || []
  // Editors are only shown once this page's real data has loaded. If the first load failed,
  // an editor would start empty and "Save" would wipe the section on the live site.
  // (A failed background refetch keeps the last good data, so editing stays safe.)
  const contentLoaded = pageData !== undefined

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Page Content</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and update the dynamic content across your website pages.</p>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="border-b border-slate-100 pb-0 dark:border-slate-800">
        <div className="flex flex-wrap gap-2">
          {PAGES.map(p => (
            <button
              key={p.key}
              onClick={() => setActivePage(p.key)}
              className={`shrink-0 px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 -mb-[2px] ${
                activePage === p.key
                  ? 'text-teal-600 border-teal-500 bg-teal-50/50 dark:bg-teal-900/10'
                  : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      {!contentLoaded ? (
        <DataUnavailableState
          error={error}
          onRetry={() => void refetch()}
          resourceLabel="page content"
          title="Page content could not be loaded"
          message="Nothing can be edited until the current content loads, so existing sections are not overwritten. Please retry."
        />
      ) : (
      <div className="space-y-6">
        {sections.map(section => (
          <SectionEditor
            // The page is part of the key: each tab gets fresh editors with its own data,
            // instead of reusing another tab's editor state and saving it to the wrong page.
            key={`${activePage}:${section.label}`}
            page={activePage}
            sectionLabel={section.label}
            fields={section.fields}
            initialData={(pageData?.[sectionKey(section.label)] || {}) as Record<string, unknown>}
            onSaved={() => qc.invalidateQueries({ queryKey: ['pageContent', activePage] })}
          />
        ))}
      </div>
      )}
    </div>
  )
}

function SectionEditor({
  page,
  sectionLabel,
  fields,
  initialData,
  onSaved,
}: {
  page: string
  sectionLabel: string
  fields: FieldConfig[]
  initialData: Record<string, unknown>
  onSaved: () => void
}) {
  const [data, setData] = useState<Record<string, unknown>>(initialData)
  const [expanded, setExpanded] = useState(false)

  const save = useMutation({
    mutationFn: () => api.put(`/content/${page}/${sectionKey(sectionLabel)}`, data),
    onSuccess: () => {
      toast.success(`${sectionLabel} saved!`)
      onSaved()
    },
    onError: () => toast.error('Failed to save'),
  })

  const updateField = (key: string, value: unknown) => {
    setData(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Card className={`overflow-hidden border transition-all duration-300 ${expanded ? 'shadow-xl border-teal-500/20 ring-1 ring-teal-500/5' : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md'}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between p-6 transition-colors ${expanded ? 'bg-slate-50/50 dark:bg-slate-800/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${expanded ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <FileText className="w-5 h-5" />
          </div>
          <h3 className={`font-bold text-lg ${expanded ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{sectionLabel}</h3>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-all ${expanded ? 'rotate-180 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-600' : 'text-slate-400'}`}>
          <Plus className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-45' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="p-8 pt-4 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-6">
            {fields.map(field => (
              <FieldRenderer
                key={field.key}
                field={field}
                value={data[field.key]}
                onChange={(val) => updateField(field.key, val)}
              />
            ))}
          </div>

          <div className="pt-8 flex justify-end border-t border-slate-50 dark:border-slate-800">
            <Button onClick={() => save.mutate()} disabled={save.isPending} size="lg" className="min-w-[140px] shadow-lg shadow-teal-500/20">
              {save.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {save.isPending ? 'Saving...' : 'Save Section'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FieldConfig
  value: unknown
  onChange: (val: unknown) => void
}) {
  if (field.type === 'array' && field.itemFields) {
    const items = (Array.isArray(value) ? value : []) as Record<string, unknown>[]

    const addItem = () => {
      const empty: Record<string, unknown> = {}
      field.itemFields!.forEach(f => { empty[f.key] = f.type === 'number' ? 0 : '' })
      onChange([...items, empty])
    }

    const removeItem = (idx: number) => {
      onChange(items.filter((_, i) => i !== idx))
    }

    const updateItem = (idx: number, key: string, val: unknown) => {
      const updated = [...items]
      updated[idx] = { ...updated[idx], [key]: val }
      onChange(updated)
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-800">
          <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{field.label}</label>
          <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider">
            <Plus className="w-3 h-3 mr-1.5" /> Add New
          </Button>
        </div>
        <div className="grid gap-4">
          {items.map((item, idx) => (
            <div key={idx} className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-6 space-y-4 relative border border-slate-100 dark:border-slate-800 group hover:border-teal-500/20 transition-all duration-300">
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded uppercase tracking-wider">Item #{idx + 1}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {field.itemFields!.map(sub => (
                  <div key={sub.key} className={sub.type === 'textarea' || sub.type === 'media' ? 'sm:col-span-2' : ''}>
                    {sub.type === 'media' ? (
                      <MediaUploadField
                        value={(item[sub.key] as string) || ''}
                        onChange={(val) => updateItem(idx, sub.key, val)}
                        accept={sub.accept || 'any'}
                        label={sub.label}
                        onUpload={uploadMedia}
                      />
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">{sub.label}</label>
                        {sub.type === 'textarea' ? (
                          <Textarea
                            value={(item[sub.key] as string) || ''}
                            onChange={(e) => updateItem(idx, sub.key, e.target.value)}
                            rows={3}
                            className="text-sm bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800"
                          />
                        ) : (
                          <Input
                            type={sub.type === 'number' ? 'number' : 'text'}
                            value={item[sub.key] as string || ''}
                            onChange={(e) => updateItem(idx, sub.key, sub.type === 'number' ? Number(e.target.value) : e.target.value)}
                            className="text-sm h-10 bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400">
              <Plus className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm font-medium">No items added yet</p>
              <button onClick={addItem} className="text-xs text-teal-500 font-bold uppercase tracking-wider mt-2 hover:underline">Add the first one</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">{field.label}</label>
        <Textarea
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="text-sm border-slate-100 dark:border-slate-800"
        />
      </div>
    )
  }

  if (field.type === 'media') {
    return (
      <MediaUploadField
        value={(value as string) || ''}
        onChange={onChange}
        accept={field.accept || 'any'}
        label={field.label}
        onUpload={uploadMedia}
      />
    )
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">{field.label}</label>
      <Input
        type={field.type === 'number' ? 'number' : 'text'}
        value={(value as string) || ''}
        onChange={(e) => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
        className="text-sm h-11 border-slate-100 dark:border-slate-800"
      />
    </div>
  )
}
