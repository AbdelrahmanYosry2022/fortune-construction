import { z } from 'zod'

export const baseSchemas = {
  // Strict Email Validation
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address'),

  // International Phone Format: +20 123 456 789 (Allows numbers, spaces, +, -, and parentheses)
  phone: z
    .string({ required_error: 'Phone number is required' })
    .min(8, 'Phone number must be at least 8 characters')
    .regex(
      /^[+\d\s\-()]+$/,
      'Please enter a valid phone number (only numbers, spaces, and + - () are allowed)'
    ),

  // Required String (General Text Input)
  requiredString: (message: string, min = 1, max?: number) => {
    let schema = z.string({ required_error: message }).min(min, message)
    if (max) schema = schema.max(max, `Must be under ${max} characters`)
    return schema
  },

  // Required Number (Handles parsing from string if necessary)
  requiredNumber: (message: string) =>
    z.coerce.number({
      required_error: message,
      invalid_type_error: 'Must be a valid number',
    }),
}

// Example Schemas Exported for Use
export const contactSchema = z.object({
  name: baseSchemas.requiredString('Name must be at least 2 characters', 2, 60),
  email: baseSchemas.email,
  phone: baseSchemas.phone,
  message: baseSchemas.requiredString('Message must be at least 20 characters', 20, 1000),
})

export const applicationSchema = z.object({
  fullName: baseSchemas.requiredString('Name must be at least 2 characters', 2),
  email: baseSchemas.email,
  phone: baseSchemas.phone,
  position: baseSchemas.requiredString('Please select a position'),
  coverLetter: baseSchemas.requiredString('Cover letter should be at least 50 characters', 50),
})

export const loginSchema = z.object({
  username: baseSchemas.requiredString('Username is required'),
  password: baseSchemas.requiredString('Password is required', 6),
})

export const projectSchema = z.object({
  title: baseSchemas.requiredString('Title is required', 2),
  category: baseSchemas.requiredString('Category is required'),
  status: z.enum(['Ongoing', 'Completed']).default('Ongoing'),
  location: baseSchemas.requiredString('Location is required'),
  clientName: z.string().optional(),
  projectValue: z.coerce.number({ invalid_type_error: 'Project value must be a number' }).positive('Project value must be positive').optional().or(z.literal('')),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  budget: z.coerce.number({ invalid_type_error: 'Budget must be a number' }).positive('Budget must be positive').optional().or(z.literal('')),
  duration: z.string().optional(),
  yearCompleted: z.coerce.number({ invalid_type_error: 'Year completed must be a number' }).int('Year completed must be a whole year').min(1900).max(new Date().getFullYear() + 20).optional().or(z.literal('')),
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
})

export const serviceSchema = z.object({
  title: baseSchemas.requiredString('Title is required', 2),
  description: baseSchemas.requiredString('Description is required', 10),
  tagline: z.string().optional(),
  bgImage: z.string().optional(),
  icon: z.string().optional(),
  features: z.array(z.string()).optional().default([]),
})

export const teamSchema = z.object({
  name: baseSchemas.requiredString('Name is required', 2),
  role: baseSchemas.requiredString('Role is required'),
  bio: baseSchemas.requiredString('Bio is required', 10),
  photo: z.string().optional().or(z.literal('')),
  socialLinks: z.object({
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
  }).optional(),
})

export const partnerSchema = z.object({
  name: baseSchemas.requiredString('Name is required', 2),
  abbr: baseSchemas.requiredString('Abbreviation is required', 2),
  logo: z.string().optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  order: z.coerce.number().optional().default(0),
})

export const jobSchema = z.object({
  title: baseSchemas.requiredString('Title is required', 2),
  location: baseSchemas.requiredString('Location is required'),
  type: baseSchemas.requiredString('Type is required'),
  description: baseSchemas.requiredString('Description is required', 10),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  isActive: z.boolean().default(true),
})

export const successStorySchema = z.object({
  quote: baseSchemas.requiredString('Quote is required', 10),
  author: baseSchemas.requiredString('Author name is required', 2),
  org: baseSchemas.requiredString('Organization is required', 2),
  initials: baseSchemas.requiredString('Initials are required', 1),
  image: z.string().optional().or(z.literal('')),
  order: z.coerce.number().optional().default(0),
})

export const settingsSchema = z.object({
  companyName: baseSchemas.requiredString('Company name is required'),
  tagline: z.string().optional(),
  phone: baseSchemas.phone,
  email: baseSchemas.email,
  address: baseSchemas.requiredString('Address is required'),
  foundedYear: z.coerce.number().min(1800).max(new Date().getFullYear()),
  heroTitle: baseSchemas.requiredString('Hero title is required'),
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

export type ContactFormData = z.infer<typeof contactSchema>
export type ApplicationFormData = z.infer<typeof applicationSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type ProjectFormData = z.infer<typeof projectSchema>
export type ServiceFormData = z.infer<typeof serviceSchema>
export type TeamFormData = z.infer<typeof teamSchema>
export type PartnerFormData = z.infer<typeof partnerSchema>
export type JobFormData = z.infer<typeof jobSchema>
export type SettingsFormData = z.infer<typeof settingsSchema>
export type SuccessStoryFormData = z.infer<typeof successStorySchema>
