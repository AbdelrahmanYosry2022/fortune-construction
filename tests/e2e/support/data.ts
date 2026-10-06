import { ProjectData, ServiceData, JobData, MessageData } from './api';

export function generateRunId(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export function buildProjectData(runId: string, overrides: Partial<ProjectData> = {}): ProjectData {
  return {
    title: `E2E Project ${runId}`,
    category: 'Commercial',
    status: 'Completed',
    location: 'Cairo, Egypt',
    overview: `This is a test project overview created for run ${runId}`,
    challenge: `E2E challenge notes for run ${runId}`,
    solution: `E2E solution description for run ${runId}`,
    result: `E2E result metrics for run ${runId}`,
    featured: true,
    ...overrides,
  };
}

export function buildServiceData(runId: string, overrides: Partial<ServiceData> = {}): ServiceData {
  return {
    title: `E2E Service ${runId}`,
    tagline: `Premium Engineering Services ${runId}`,
    description: `Complete technical specification and delivery for service ${runId}`,
    features: [`Feature Alpha ${runId}`, `Feature Beta ${runId}`, `Feature Gamma ${runId}`],
    icon: 'Building2',
    order: 99,
    ...overrides,
  };
}

export function buildJobData(runId: string, overrides: Partial<JobData> = {}): JobData {
  return {
    title: `E2E Lead Engineer ${runId}`,
    department: 'Engineering',
    location: 'Cairo, Egypt',
    type: 'Full-time',
    description: `We are hiring an E2E Lead Engineer for test run ${runId}`,
    requirements: ['5+ years experience in structural engineering', 'Valid engineering license'],
    isActive: true,
    ...overrides,
  };
}

export function buildContactMessageData(runId: string, overrides: Partial<MessageData> = {}): Omit<MessageData, '_id'> {
  return {
    name: `E2E Visitor ${runId}`,
    email: `visitor-${runId}@example.com`,
    phone: '+201000000000',
    message: `Hello Fortune Team, this is an automated contact inquiry for E2E run ${runId}.`,
    ...overrides,
  };
}
