import React from 'react'
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import type { UseFormProps, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Loader2, X } from 'lucide-react'

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export const Form = FormProvider

interface UseFormSchemaProps<T extends z.ZodType<any, any>> extends Omit<UseFormProps<z.infer<T>>, 'resolver'> {
  schema: T
}

export function useFormSchema<T extends z.ZodType<any, any>>({
  schema,
  ...formOptions
}: UseFormSchemaProps<T>): UseFormReturn<z.infer<T>> {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    ...formOptions,
  })
}

const requiredString = (message: string, min = 1, max?: number) => {
  let schema = z.string({ required_error: message }).min(min, message)
  if (max) schema = schema.max(max, `Must be under ${max} characters`)
  return schema
}

const emptyToUndefined = (value: unknown) => value === '' || value === null ? undefined : value
const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional())
const optionalPositiveNumber = (label: string) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce.number({ invalid_type_error: `${label} must be a number` })
      .positive(`${label} must be greater than 0`)
      .max(999_999_999_999, `${label} is too large`),
  ).optional().or(z.literal(''))
const optionalYear = z.preprocess(
  emptyToUndefined,
  z.coerce.number({ invalid_type_error: 'Year completed must be a number' })
    .int('Year completed must be a whole year')
    .min(1900, 'Year completed must be 1900 or later')
    .max(new Date().getFullYear() + 20, 'Year completed is too far in the future'),
).optional().or(z.literal(''))

const email = z.string({ required_error: 'Email is required' }).email('Please enter a valid email address')
const phone = z
  .string({ required_error: 'Phone number is required' })
  .min(8, 'Phone number must be at least 8 characters')
  .regex(/^[+\d\s\-()]+$/, 'Please enter a valid phone number (only numbers, spaces, and + - () are allowed)')

export const loginSchema = z.object({
  username: requiredString('Username is required'),
  password: requiredString('Password is required', 6),
})

export const projectSchema = z.object({
  title: requiredString('Title is required', 2),
  category: requiredString('Category is required'),
  status: z.enum(['Ongoing', 'Completed']).default('Ongoing'),
  location: requiredString('Location is required'),
  clientName: z.string().optional(),
  projectValue: optionalPositiveNumber('Project value'),
  startDate: optionalDate,
  endDate: optionalDate,
  budget: optionalPositiveNumber('Budget'),
  duration: z.string().optional(),
  yearCompleted: optionalYear,
  overview: z.string().optional(),
  scopeOfWork: z.array(z.string()).optional().default([]),
  technologies: z.array(z.string()).optional().default([]),
  coverImage: z.string().optional().or(z.literal('')),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  result: z.string().optional(),
  galleryImages: z.array(z.string()).optional().default([]),
  coordinates: z.object({
    lat: z.coerce.number().optional().or(z.literal('')),
    lng: z.coerce.number().optional().or(z.literal('')),
  }).optional(),
}).superRefine((data, ctx) => {
  if (data.startDate && data.endDate && data.endDate <= data.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'End date must be after start date',
    })
  }
})

export const serviceSchema = z.object({
  title: requiredString('Title is required', 2),
  description: requiredString('Description is required', 10),
  tagline: z.string().optional(),
  bgImage: z.string().optional(),
  icon: z.string().optional(),
  features: z.array(z.string()).optional().default([]),
})

export const teamSchema = z.object({
  name: requiredString('Name is required', 2),
  role: requiredString('Role is required'),
  bio: requiredString('Bio is required', 10),
  photo: z.string().optional().or(z.literal('')),
  socialLinks: z.object({
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
  }).optional(),
})

export const partnerSchema = z.object({
  name: requiredString('Name is required', 2),
  abbr: requiredString('Abbreviation is required', 2),
  logo: z.string().optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  order: z.coerce.number().optional().default(0),
})

export const jobSchema = z.object({
  title: requiredString('Title is required', 2),
  location: requiredString('Location is required'),
  type: requiredString('Type is required'),
  description: requiredString('Description is required', 10),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  isActive: z.boolean().default(true),
})

export const settingsSchema = z.object({
  companyName: requiredString('Company name is required'),
  tagline: z.string().optional(),
  phone,
  email,
  address: requiredString('Address is required'),
  foundedYear: z.coerce.number().min(1800).max(new Date().getFullYear()),
  heroTitle: requiredString('Hero title is required'),
  heroBadge: z.string().optional(),
  heroSubtitle: z.string().optional(),
  socialFacebook: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  socialTwitter: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  socialLinkedin: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  socialYoutube: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  workingDays: z.string().optional(),
  workingHoursStart: z.string().optional(),
  workingHoursEnd: z.string().optional(),
  workingHoursDisplay: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type ProjectFormData = z.infer<typeof projectSchema>
export type ServiceFormData = z.infer<typeof serviceSchema>
export type TeamFormData = z.infer<typeof teamSchema>
export type PartnerFormData = z.infer<typeof partnerSchema>
export type JobFormData = z.infer<typeof jobSchema>
export type SettingsFormData = z.infer<typeof settingsSchema>

type ButtonVariant = 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'default' | 'lg' | 'icon-sm'

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60',
        size === 'default' && 'h-11 px-4',
        size === 'sm' && 'h-9 px-3 text-xs',
        size === 'lg' && 'h-14 px-6',
        size === 'icon-sm' && 'h-9 w-9 px-0',
        variant === 'default' && 'bg-teal-600 text-white hover:bg-teal-700',
        variant === 'outline' && 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200',
        variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700',
        variant === 'secondary' && 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
        variant === 'ghost' && 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900', className)} {...props} />
))
Card.displayName = 'Card'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn('h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white', className)}
    {...props}
  />
))
Input.displayName = 'Input'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn('min-h-[110px] w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white', className)}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

interface SelectOption {
  label: string
  value: string
}

interface FormInputProps {
  name: string
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'textarea' | 'select' | 'file' | 'date'
  options?: SelectOption[]
  disabled?: boolean
  rows?: number
  accept?: string
  min?: string | number
  max?: string | number
  onChangeFile?: (file: File | null) => void
}

export function FormInput({
  name,
  label,
  placeholder,
  type = 'text',
  options = [],
  disabled = false,
  rows = 4,
  accept,
  min,
  max,
  onChangeFile,
}: FormInputProps) {
  const { register, formState: { errors } } = useFormContext()
  const error = name.split('.').reduce<any>((acc, part) => acc?.[part], errors)
  const inputClassName = 'h-14 rounded-2xl px-6 shadow-sm'

  return (
    <div className="w-full space-y-2">
      <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</label>
      {type === 'textarea' ? (
        <Textarea rows={rows} placeholder={placeholder} disabled={disabled} className="resize-none rounded-2xl p-4 shadow-sm" {...register(name)} />
      ) : type === 'select' ? (
        <select disabled={disabled} className={cn(inputClassName, 'w-full border border-slate-200 bg-white text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white')} {...register(name)}>
          <option value="">{placeholder || 'Select an option'}</option>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : type === 'file' ? (
        <Input
          type="file"
          disabled={disabled}
          accept={accept}
          className={inputClassName}
          {...register(name, { onChange: (event) => onChangeFile?.(event.target.files?.[0] || null) })}
        />
      ) : (
        <Input type={type} placeholder={placeholder} disabled={disabled} min={min} max={max} className={inputClassName} {...register(name)} />
      )}
      {error && (
        <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error.message?.toString()}</span>
        </div>
      )}
    </div>
  )
}

interface GlobalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  type?: 'success' | 'error' | 'info' | 'destructive' | 'custom'
  children?: React.ReactNode
  actionText?: string
  cancelText?: string
  onAction?: () => void
  isLoading?: boolean
  className?: string
}

export function GlobalModal({
  open,
  onOpenChange,
  title,
  description,
  type = 'info',
  children,
  actionText = 'Confirm',
  cancelText = 'Cancel',
  onAction,
  isLoading,
  className,
}: GlobalModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className={cn('max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-8 shadow-2xl dark:bg-slate-900', type !== 'custom' && 'text-center', className)}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{title}</h2>
            {description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}
          </div>
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
        {type !== 'custom' && (
          <div className="mt-8 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>{cancelText}</Button>
            {onAction && (
              <Button variant={type === 'destructive' || type === 'error' ? 'destructive' : 'default'} className="flex-1" disabled={isLoading} onClick={onAction}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {actionText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface MediaUploadFieldProps {
  value?: string
  onChange: (value: string) => void
  accept?: 'image' | 'video' | 'icon' | 'any'
  label?: string
  helperText?: string
  onUpload?: (file: File) => Promise<string>
  disabled?: boolean
}

export function MediaUploadField({ value = '', onChange, accept = 'any', label, helperText, onUpload, disabled }: MediaUploadFieldProps) {
  const [uploading, setUploading] = React.useState(false)

  const handleFile = async (file?: File) => {
    if (!file || !onUpload) return
    setUploading(true)
    try {
      onChange(await onUpload(file))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      {label && <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</label>}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="URL, icon name, or uploaded media path" disabled={disabled} />
        <Button type="button" variant="outline" className="relative overflow-hidden" disabled={disabled || uploading}>
          <input
            type="file"
            className="absolute inset-0 cursor-pointer opacity-0"
            accept={accept === 'video' ? 'video/*' : accept === 'image' ? 'image/*' : undefined}
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
      {value && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(value) && <img src={value} alt="Preview" className="max-h-48 w-full rounded-2xl object-cover" />}
    </div>
  )
}

interface BusinessHoursPickerProps {
  workingDays?: string
  workingHoursStart?: string
  workingHoursEnd?: string
  onChange: (values: {
    workingDays: string
    workingHoursStart: string
    workingHoursEnd: string
    workingHoursDisplay: string
  }) => void
}

export function BusinessHoursPicker({ workingDays = '', workingHoursStart = '', workingHoursEnd = '', onChange }: BusinessHoursPickerProps) {
  const update = (next: Partial<{ workingDays: string; workingHoursStart: string; workingHoursEnd: string }>) => {
    const values = {
      workingDays,
      workingHoursStart,
      workingHoursEnd,
      ...next,
    }
    onChange({
      ...values,
      workingHoursDisplay: `${values.workingDays || 'Working days'} ${values.workingHoursStart || ''} - ${values.workingHoursEnd || ''}`.trim(),
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Input value={workingDays} onChange={(event) => update({ workingDays: event.target.value })} placeholder="Mon - Fri" />
      <Input type="time" value={workingHoursStart} onChange={(event) => update({ workingHoursStart: event.target.value })} />
      <Input type="time" value={workingHoursEnd} onChange={(event) => update({ workingHoursEnd: event.target.value })} />
    </div>
  )
}
