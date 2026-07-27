/**
 * Reports & Actions API client.
 * Talks to the FastAPI backend (/api/reports) when available; callers fall back
 * to local mock data if these throw (e.g. `npm run dev` with no backend).
 */
import type { CaseReport, ReportPriority, ReportStatus } from './mockData'

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json() as Promise<T>
}

export async function fetchReports(): Promise<CaseReport[]> {
  return json<CaseReport[]>(await fetch('/api/reports'))
}

export async function createReport(body: {
  title: string
  category: string
  mpan_id: string
  priority: ReportPriority
  assignee: string
  description: string
}): Promise<CaseReport> {
  return json<CaseReport>(
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  )
}

export async function addAction(
  reportId: string,
  body: { action: string; status: ReportStatus; actor?: string; note?: string },
): Promise<CaseReport> {
  return json<CaseReport>(
    await fetch(`/api/reports/${encodeURIComponent(reportId)}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  )
}
