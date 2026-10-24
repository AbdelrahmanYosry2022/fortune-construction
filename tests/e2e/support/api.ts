import fs from 'fs';
import path from 'path';

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export interface AuthResponse {
  token: string;
  user?: Record<string, unknown>;
}

export interface ProjectData {
  _id?: string;
  title: string;
  category: string;
  status: string;
  location: string;
  coverImage?: string;
  overview: string;
  challenge?: string;
  solution?: string;
  result?: string;
  featured?: boolean;
}

export interface ServiceData {
  _id?: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  icon: string;
  order?: number;
}

export interface JobData {
  _id?: string;
  title: string;
  department?: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  isActive?: boolean;
}

export interface MessageData {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
}

export interface UploadResponse {
  url: string;
  type: string;
}

export class E2EApiClient {
  private token: string | null = null;

  constructor(private baseUrl: string = API_BASE_URL) {}

  async login(username = 'admin', password = 'admin123'): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Auth failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as AuthResponse;
    this.token = data.token;
    return data.token;
  }

  getToken(): string {
    if (!this.token) {
      throw new Error('ApiClient is not authenticated. Call login() first.');
    }
    return this.token;
  }

  setToken(token: string) {
    this.token = token;
  }

  private authHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getToken()}`,
    };
  }

  // Projects API
  async createProject(data: ProjectData): Promise<ProjectData> {
    const res = await fetch(`${this.baseUrl}/api/projects`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Create project failed (${res.status}): ${await res.text()}`);
    return (await res.json()) as ProjectData;
  }

  async updateProject(id: string, data: Partial<ProjectData>): Promise<ProjectData> {
    const res = await fetch(`${this.baseUrl}/api/projects/${id}`, {
      method: 'PUT',
      headers: this.authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Update project failed (${res.status}): ${await res.text()}`);
    return (await res.json()) as ProjectData;
  }

  async deleteProject(id: string): Promise<void> {
    // DELETE only moves a project to the trash; test projects are then removed for good.
    await fetch(`${this.baseUrl}/api/projects/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    });
    await fetch(`${this.baseUrl}/api/projects/${id}/permanent`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    });
  }

  // Services API
  async createService(data: ServiceData): Promise<ServiceData> {
    const res = await fetch(`${this.baseUrl}/api/services`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Create service failed (${res.status}): ${await res.text()}`);
    return (await res.json()) as ServiceData;
  }

  async deleteService(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/api/services/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    });
  }

  // Page Content API
  async getPageContent(page: string, section: string): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}/api/content/${page}/${section}`);
    if (!res.ok) return null;
    return await res.json();
  }

  async updatePageContent(page: string, section: string, content: unknown): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}/api/content/${page}/${section}`, {
      method: 'PUT',
      headers: this.authHeaders(),
      body: JSON.stringify(content),
    });
    if (!res.ok) throw new Error(`Update page content failed (${res.status}): ${await res.text()}`);
    return await res.json();
  }

  // Jobs API
  async createJob(data: JobData): Promise<JobData> {
    const res = await fetch(`${this.baseUrl}/api/jobs`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Create job failed (${res.status}): ${await res.text()}`);
    return (await res.json()) as JobData;
  }

  async updateJob(id: string, data: Partial<JobData>): Promise<JobData> {
    const res = await fetch(`${this.baseUrl}/api/jobs/${id}`, {
      method: 'PUT',
      headers: this.authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Update job failed (${res.status}): ${await res.text()}`);
    return (await res.json()) as JobData;
  }

  async deleteJob(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/api/jobs/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    });
  }

  // Contact Messages API
  async submitContactMessage(data: Omit<MessageData, '_id'>): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/messages/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Submit contact message failed (${res.status}): ${await res.text()}`);
  }

  async getMessages(): Promise<MessageData[]> {
    const res = await fetch(`${this.baseUrl}/api/messages`, {
      headers: this.authHeaders(),
    });
    if (!res.ok) throw new Error(`Get messages failed (${res.status}): ${await res.text()}`);
    return (await res.json()) as MessageData[];
  }

  async deleteMessage(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/api/messages/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    });
  }

  // Upload API
  async uploadImage(filePath: string): Promise<UploadResponse> {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'image/png' });
    formData.append('image', blob, fileName);

    const res = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
    return (await res.json()) as UploadResponse;
  }
}

export class CleanupManager {
  private projectIds: string[] = [];
  private serviceIds: string[] = [];
  private jobIds: string[] = [];
  private messageIds: string[] = [];
  private restoredPageContents: Array<{ page: string; section: string; content: unknown }> = [];

  constructor(private client: E2EApiClient) {}

  addProject(id: string) {
    if (id) this.projectIds.push(id);
  }

  addService(id: string) {
    if (id) this.serviceIds.push(id);
  }

  addJob(id: string) {
    if (id) this.jobIds.push(id);
  }

  addMessage(id: string) {
    if (id) this.messageIds.push(id);
  }

  addPageContentRestore(page: string, section: string, content: unknown) {
    this.restoredPageContents.push({ page, section, content });
  }

  async cleanupAll(): Promise<void> {
    for (const id of this.projectIds) {
      try { await this.client.deleteProject(id); } catch (_) {}
    }
    this.projectIds = [];

    for (const id of this.serviceIds) {
      try { await this.client.deleteService(id); } catch (_) {}
    }
    this.serviceIds = [];

    for (const id of this.jobIds) {
      try { await this.client.deleteJob(id); } catch (_) {}
    }
    this.jobIds = [];

    for (const id of this.messageIds) {
      try { await this.client.deleteMessage(id); } catch (_) {}
    }
    this.messageIds = [];

    for (const item of this.restoredPageContents) {
      try {
        // PUT merges into the section, so keys the test added are cleared explicitly
        // (null makes the site fall back to its default text).
        const current = await this.client.getPageContent(item.page, item.section);
        const cleared: Record<string, unknown> = {};
        if (current && typeof current === 'object') {
          for (const key of Object.keys(current)) cleared[key] = null;
        }
        await this.client.updatePageContent(item.page, item.section, {
          ...cleared,
          ...((item.content ?? {}) as Record<string, unknown>),
        });
      } catch (_) {}
    }
    this.restoredPageContents = [];
  }
}
