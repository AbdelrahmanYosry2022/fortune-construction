import { useState } from 'react'
import { Send, Loader2, AlertCircle } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { SuccessMessage } from './SuccessMessage'
import { API } from '@/lib/apiClient'
import { useFormSchema, contactSchema, ContactFormData, FormInput, Form, Button } from '@fortune/shared-ui'
import { motion } from 'framer-motion'

const RATE_LIMITED_MESSAGE = 'Too many messages from your network, please try again later.'
const NETWORK_ERROR_MESSAGE = 'Could not reach the server. Please check your internet connection and try again.'

interface ApiErrorBody {
    message?: unknown
    details?: unknown
}

// Turns a rejected submission into a sentence that tells the visitor why it was not sent.
async function failureReason(res: Response): Promise<string> {
    if (res.status === 429) return RATE_LIMITED_MESSAGE

    let body: ApiErrorBody | null = null
    try {
        body = (await res.json()) as ApiErrorBody
    } catch {
        body = null
    }

    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    const details = Array.isArray(body?.details)
        ? body.details
            .map((detail: { message?: unknown }) => (typeof detail?.message === 'string' ? detail.message.trim() : ''))
            .filter(Boolean)
        : []

    if (!message && details.length === 0) {
        return `Your message was not sent (server error ${res.status}). Please try again later.`
    }
    const reason = [message, details.join('; ')].filter(Boolean).join(': ')
    return `Your message was not sent: ${reason}`
}

export function ContactForm() {
    const { isFormSubmitted, isFormSubmitting, setFormSubmitting, setFormSubmitted } = useUIStore()
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useFormSchema({
        schema: contactSchema,
        defaultValues: { name: '', email: '', phone: '', message: '' }
    })

    // On failure the typed values stay in the form so the visitor can retry.
    const onSubmit = async (data: ContactFormData) => {
        setSubmitError(null)
        setFormSubmitting(true)
        try {
            let res: Response
            try {
                res = await fetch(`${API}/messages/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                })
            } catch {
                setSubmitError(NETWORK_ERROR_MESSAGE)
                return
            }
            if (!res.ok) {
                setSubmitError(await failureReason(res))
                return
            }
            setFormSubmitted(true)
            form.reset()
        } finally {
            setFormSubmitting(false)
        }
    }

    if (isFormSubmitted) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <SuccessMessage />
            </motion.div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="relative"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput name="name" label="Full Name *" placeholder="Executive Name" disabled={isFormSubmitting} />
                        <FormInput name="email" label="Corporate Email *" type="email" placeholder="name@company.com" disabled={isFormSubmitting} />
                    </div>

                    <FormInput name="phone" label="Contact Number *" type="tel" placeholder="+265 999 123 456" disabled={isFormSubmitting} />
                    
                    <FormInput 
                        name="message" 
                        label="Project Brief / Requirements *" 
                        type="textarea" 
                        rows={6}
                        placeholder="Please provide a high-level overview of your project requirements, location, and strategic goals..." 
                        disabled={isFormSubmitting}
                    />

                    {submitError && (
                        <div
                            role="alert"
                            className="flex items-start gap-3 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-5 py-4 text-sm text-red-700 dark:text-red-300"
                        >
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <p>{submitError}</p>
                        </div>
                    )}

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isFormSubmitting}
                            size="lg"
                            className="w-full shadow-2xl shadow-teal-500/20"
                        >
                            {isFormSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                    Processing Inquiry...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-3" />
                                    Dispatch Consultation Request
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </motion.div>
    )
}
