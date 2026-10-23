import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { DataUnavailableState } from '../components/errors/DataUnavailableState'
import { getApiErrorMessage } from '../lib/errorHandling'
import { Save, Loader2, Globe, Phone, Mail, MapPin, Clock, Share2, Type } from 'lucide-react'
import { toast } from 'sonner'
import { 
  useFormSchema, 
  settingsSchema, 
  SettingsFormData, 
  FormInput, 
  Form, 
  Button,
  Card,
  BusinessHoursPicker
} from '@fortune/shared-ui'

export default function Settings() {
  const qc = useQueryClient()

  const form = useFormSchema({
    schema: settingsSchema,
    defaultValues: {
      companyName: '', tagline: '', phone: '', email: '',
      address: '', foundedYear: new Date().getFullYear(), 
      heroTitle: '', heroBadge: '', heroSubtitle: '', 
      socialFacebook: '', socialTwitter: '', socialLinkedin: '', socialYoutube: '',
      workingDays: '', workingHoursStart: '', workingHoursEnd: '', workingHoursDisplay: ''
    }
  })

  const { data, error, isLoading, refetch } = useQuery<SettingsFormData>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data),
  })

  // Background refetches (e.g. when the tab regains focus) must not wipe edits that are not saved yet.
  const isDirtyRef = useRef(false)
  isDirtyRef.current = form.formState.isDirty

  useEffect(() => {
    if (data && !isDirtyRef.current) form.reset(data)
  }, [data, form])

  const save = useMutation({
    mutationFn: (d: SettingsFormData) => api.put('/settings', d),
    onSuccess: (_response, saved) => {
      form.reset(saved)
      qc.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings saved successfully!') 
    },
    onError: (error) => toast.error(`Failed to save settings: ${getApiErrorMessage(error, 'please try again')}`, { duration: 10000 }),
  })

  const onSubmit = (data: SettingsFormData) => {
    save.mutate(data)
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-sky-500 animate-spin" /></div>

  // Never show the form without the saved settings: saving it would overwrite them with blanks.
  if (!data) {
    return (
      <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Site Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage global company information and website-wide configurations.</p>
          </div>
        </div>
        <DataUnavailableState
          resourceLabel="site settings"
          error={error}
          message={`Could not load site settings: ${getApiErrorMessage(error, 'please try again')}`}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Site Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage global company information and website-wide configurations.</p>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={save.isPending} className="shadow-lg shadow-teal-500/20">
          {save.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {save.isPending ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Company Info */}
          <Card className="p-8 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Globe className="w-4 h-4" />
              </div>
              Company Identity
            </h2>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <FormInput name="companyName" label="Legal Company Name" placeholder="Fortune Construction" />
              <FormInput name="foundedYear" label="Year Founded" type="number" />
              <div className="md:col-span-2">
                <FormInput name="tagline" label="Company Tagline" placeholder="Crafting Visionary Infrastructure" />
              </div>
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-8 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Phone className="w-4 h-4" />
              </div>
              Official Contact Details
            </h2>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="relative">
                <div className="absolute left-4 top-[38px] z-10 text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="[&_input]:pl-11"><FormInput name="phone" label="Phone Number" placeholder="+265 123 456 789" /></div>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-[38px] z-10 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="[&_input]:pl-11"><FormInput name="email" label="Email Address" type="email" placeholder="info@fortune.com" /></div>
              </div>
              <div className="md:col-span-2 relative">
                <div className="absolute left-4 top-[38px] z-10 text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="[&_input]:pl-11"><FormInput name="address" label="Primary Office Address" placeholder="123 Corporate Way, Lilongwe" /></div>
              </div>
            </div>
          </Card>

          {/* Hero Section */}
          <Card className="p-8 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Type className="w-4 h-4" />
              </div>
              Landing Page Hero
            </h2>
            <div className="space-y-6">
              <FormInput name="heroBadge" label="Hero Badge Text" placeholder="e.g. 20 Years of Construction Excellence" />
              <FormInput name="heroTitle" label="Primary Headline" placeholder="e.g. Crafting Visionary Infrastructure." />
              <FormInput name="heroSubtitle" label="Supporting Description" type="textarea" placeholder="Describe the company's core value proposition..." />
            </div>
          </Card>

          {/* Working Hours */}
          <Card className="p-8 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Clock className="w-4 h-4" />
              </div>
              Business Hours
            </h2>
            <BusinessHoursPicker 
              workingDays={form.watch('workingDays')}
              workingHoursStart={form.watch('workingHoursStart')}
              workingHoursEnd={form.watch('workingHoursEnd')}
              onChange={(values) => {
                form.setValue('workingDays', values.workingDays)
                form.setValue('workingHoursStart', values.workingHoursStart)
                form.setValue('workingHoursEnd', values.workingHoursEnd)
                form.setValue('workingHoursDisplay', values.workingHoursDisplay)
              }}
            />
          </Card>

          {/* Social Media */}
          <Card className="p-8 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Share2 className="w-4 h-4" />
              </div>
              Social Presence
            </h2>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <FormInput name="socialFacebook" label="Facebook Profile" placeholder="https://facebook.com/..." />
              <FormInput name="socialTwitter" label="Twitter / X Profile" placeholder="https://twitter.com/..." />
              <FormInput name="socialLinkedin" label="LinkedIn Company Page" placeholder="https://linkedin.com/company/..." />
              <FormInput name="socialYoutube" label="YouTube Channel" placeholder="https://youtube.com/..." />
            </div>
          </Card>
        </form>
      </Form>
    </div>
  )
}
