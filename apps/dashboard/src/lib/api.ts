import axios from 'axios'
import { isNetworkUnavailableError } from './errorHandling'

const DEFAULT_LOCAL_API_URL = 'http://localhost:3001'
const DEFAULT_LOCAL_PUBLIC_SITE_URL = 'http://localhost:5173'

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '')
}

function resolveConfiguredUrl(value: string | undefined, fallback: string, envName: string): string {
  const configured = value?.trim()
  if (configured) return normalizeBaseUrl(configured)

  if (import.meta.env.PROD) {
    throw new Error(`${envName} must be configured for production builds.`)
  }

  return fallback
}

export const BASE_URL = resolveConfiguredUrl(import.meta.env.VITE_API_URL, DEFAULT_LOCAL_API_URL, 'VITE_API_URL')
export const PUBLIC_SITE_URL = resolveConfiguredUrl(
  import.meta.env.VITE_PUBLIC_SITE_URL,
  DEFAULT_LOCAL_PUBLIC_SITE_URL,
  'VITE_PUBLIC_SITE_URL',
)

export const api = axios.create({ baseURL: `${BASE_URL}/api` })

export function isDashboardApiUnavailableError(error: unknown): boolean {
  return isNetworkUnavailableError(error)
}

export function resolveUploadUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const SESSION_EXPIRED_KEY = 'fc_session_expired'

// Shown once on the login page after an expired session sent the admin there.
export function consumeSessionExpiredNotice(): boolean {
  try {
    const expired = sessionStorage.getItem(SESSION_EXPIRED_KEY) === '1'
    sessionStorage.removeItem(SESSION_EXPIRED_KEY)
    return expired
  } catch {
    return false
  }
}

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // A 401 from the login form itself means wrong credentials: let the form show it
    // instead of reloading the page silently.
    const isLoginRequest = String(err.config?.url ?? '').includes('/auth/login')
    if (err.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('fc_token')
      try {
        sessionStorage.setItem(SESSION_EXPIRED_KEY, '1')
      } catch {
        // storage unavailable: the redirect still works, only the notice is skipped
      }
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export const uploadImage = async (file: File): Promise<string> => {
  const fd = new FormData()
  fd.append('image', file)
  const { data } = await api.post('/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return resolveUploadUrl(data.url)
}

export const uploadVideo = async (file: File): Promise<string> => {
  const fd = new FormData()
  fd.append('video', file)
  const { data } = await api.post('/upload/video', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return resolveUploadUrl(data.url)
}

export const uploadMedia = async (file: File): Promise<string> => {
  const isVideo = /\.(mp4|webm|mov|avi)$/i.test(file.name)
  return isVideo ? uploadVideo(file) : uploadImage(file)
}
