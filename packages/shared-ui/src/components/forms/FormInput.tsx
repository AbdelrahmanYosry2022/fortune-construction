import React from 'react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useFormContext } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { DatePicker } from '../ui/DatePicker'

interface SelectOption {
  label: string
  value: string
}

interface CustomFormInputProps {
  name: string
  label: string
  placeholder?: string
  description?: string
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'textarea' | 'select' | 'file' | 'date'
  options?: SelectOption[] // For select type
  disabled?: boolean
  rows?: number // For textarea type
  accept?: string // For file type
  min?: string | number // For number/date type
  max?: string | number // For number/date type
  step?: string | number // For number type, e.g. "any" to allow decimals
  onChangeFile?: (file: File | null) => void // Custom handler for files
}

export function FormInput({
  name,
  label,
  placeholder,
  description,
  type = 'text',
  options = [],
  disabled = false,
  rows = 4,
  accept,
  min,
  max,
  step,
  onChangeFile,
}: CustomFormInputProps) {
  const { control, formState: { errors } } = useFormContext()
  const error = errors[name]

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2 w-full">
          <FormLabel className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500 ml-1">
            {label}
          </FormLabel>
          <FormControl>
            {type === 'textarea' ? (
              <Textarea
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                className="resize-none bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-2xl p-4 shadow-sm"
                {...field}
                value={field.value ?? ''}
              />
            ) : type === 'select' ? (
              <Select disabled={disabled} onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-2xl h-14 px-6 shadow-sm">
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="py-3 rounded-xl">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === 'date' ? (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder={placeholder || "Select a date"}
              />
            ) : type === 'file' ? (
              <Input
                type="file"
                disabled={disabled}
                accept={accept}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  // RHF doesn't natively handle files well without custom setup, so we pass it up if needed
                  if (onChangeFile) onChangeFile(file)
                  else field.onChange(e)
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 transition-all file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 file:border-0 file:rounded-xl file:px-6 file:py-2 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 cursor-pointer h-14 rounded-2xl shadow-sm"
              />
            ) : (
              <Input
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                max={max}
                step={step}
                className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 h-14 px-6 rounded-2xl shadow-sm"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  if (type === 'number') {
                    // Coerce to number if typing
                    const val = e.target.value
                    if (val === '') {
                      field.onChange('')
                    } else {
                      const num = Number(val)
                      field.onChange(isNaN(num) ? val : num)
                    }
                  } else {
                    field.onChange(e)
                  }
                }}
              />
            )}
          </FormControl>
          
          {description && <FormDescription className="text-[10px] font-medium text-slate-400 dark:text-slate-500 italic ml-1">{description}</FormDescription>}
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium text-destructive flex items-center gap-1.5 mt-1"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error.message?.toString()}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </FormItem>
      )}
    />
  )
}
