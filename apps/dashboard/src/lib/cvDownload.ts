import axios from 'axios'
import { api } from './api'

// CVs are only sent after login (GET /api/applications/:id/cv), so the dashboard fetches the
// file with the admin's token and hands it to the browser as a download, instead of linking to it.

/** Same rule as the API's cvDownloadName: the applicant's name plus the file's extension. */
export function cvDownloadName(fullName: string | undefined, cvFile: string | undefined): string {
  const extension = (cvFile ?? '').match(/\.[a-z0-9]+$/i)?.[0].toLowerCase() ?? ''
  const name = (fullName ?? '')
    .replace(/[\u0000-\u001f\u007f\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
  return `${name || 'Applicant'} CV${extension}`
}

interface CvApplication { _id: string; fullName: string; cvFile?: string }

export async function downloadApplicationCv(application: CvApplication): Promise<void> {
  let blob: Blob
  try {
    const response = await api.get<Blob>(`/applications/${application._id}/cv`, { responseType: 'blob' })
    blob = response.data
  } catch (error) {
    throw await withJsonErrorBody(error)
  }
  saveBlob(blob, cvDownloadName(application.fullName, application.cvFile))
}

// With responseType 'blob' an error body arrives as a Blob too. Reading it back as JSON lets
// getApiErrorMessage show the server's reason ("The CV file is missing on the server").
async function withJsonErrorBody(error: unknown): Promise<unknown> {
  if (axios.isAxiosError(error) && error.response && error.response.data instanceof Blob) {
    try {
      error.response.data = JSON.parse(await error.response.data.text())
    } catch {
      error.response.data = {}
    }
  }
  return error
}

function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Safari starts the download after click() returns; revoking the URL at once can cancel it.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
