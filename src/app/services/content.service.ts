import { Injectable, signal } from '@angular/core';

export type SiteContent = {
  home?: {
    services?: unknown[];
    testimonials?: unknown[];
  };
  booking?: {
    devices?: unknown[];
    repairIssues?: unknown[];
  };
  reviews?: {
    stats?: unknown[];
    reviews?: unknown[];
  };
  blogs?: {
    posts?: unknown[];
  };
  beforeAfter?: {
    repairs?: unknown[];
    testimonials?: unknown[];
  };
  services?: {
    heroTrust?: unknown[];
    services?: unknown[];
    trustFeatures?: unknown[];
    process?: unknown[];
  };
  support?: {
    faqs?: unknown[];
    quickActions?: unknown[];
    contactInfo?: unknown[];
  };
};

export type ContentSection = {
  key: string;
  customized: boolean;
  updatedAt: string | null;
  payload: unknown;
  defaultPayload: unknown;
};

export type ContentResource = {
  key: string;
  endpoint: string;
  section: string;
  property: string;
  table: string;
  columns: string[];
  idField?: string;
};

export type ContentResourceRow = Record<string, unknown> & {
  id?: number | string;
  sortOrder?: number;
};

export type MediaAsset = {
  id: string;
  filename: string;
  contentType: string;
  byteSize: number;
  altText: string;
  url: string;
};

const ADMIN_SESSION_STORAGE_KEY = 'omarphone-admin-session';

function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return '/api';
  }

  const host = window.location.hostname;
  const isLocal = host === '127.0.0.1' || host === 'localhost';
  if (isLocal) {
    return 'http://127.0.0.1:4301/api';
  }

  return '/api';
}

function getAdminAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const token = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  readonly content = signal<SiteContent | null>(null);
  private blogPostsPromise: Promise<ContentResourceRow[]> | null = null;
  private rowPromises = new Map<string, Promise<ContentResourceRow[]>>();

  load(): Promise<SiteContent | null> {
    return Promise.resolve(null);
  }

  refresh(): Promise<SiteContent | null> {
    this.blogPostsPromise = null;
    this.rowPromises.clear();
    this.content.set(null);
    return Promise.resolve(null);
  }

  async loadPublicRows(resource: string): Promise<ContentResourceRow[]> {
    const key = resource.replace(/^\/?api\//, '');
    if (!this.rowPromises.has(key)) {
      this.rowPromises.set(key, this.fetchRows(key));
    }

    return this.rowPromises.get(key) ?? [];
  }

  async loadBlogPosts(): Promise<ContentResourceRow[]> {
    if (!this.blogPostsPromise) {
      this.blogPostsPromise = this.fetchBlogs();
    }

    return this.blogPostsPromise;
  }

  async loadSections(): Promise<ContentSection[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    const response = await fetch(`${getApiBaseUrl()}/content-sections`, {
      headers: getAdminAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Content sections API responded with ${response.status}`);
    }

    const payload = await response.json() as { sections?: ContentSection[] };
    return payload.sections ?? [];
  }

  async loadResources(): Promise<ContentResource[]> {
    const response = await fetch(`${getApiBaseUrl()}/content-resources`, {
      headers: getAdminAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Content resources API responded with ${response.status}`);
    }

    const payload = await response.json() as { resources?: ContentResource[] };
    return payload.resources ?? [];
  }

  async loadResourceRows(resource: ContentResource | string): Promise<ContentResourceRow[]> {
    const key = typeof resource === 'string' ? resource : resource.key;
    const response = await fetch(`${getApiBaseUrl()}/${encodeURIComponent(key)}`, {
      headers: getAdminAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Content resource API responded with ${response.status}`);
    }

    const payload = await response.json() as { rows?: ContentResourceRow[]; posts?: ContentResourceRow[] };
    return payload.rows ?? payload.posts ?? [];
  }

  async createResourceRow(resource: ContentResource | string, row: ContentResourceRow): Promise<ContentResourceRow> {
    return this.writeResourceRow(resource, null, row, 'POST');
  }

  async updateResourceRow(resource: ContentResource | string, id: string | number, row: ContentResourceRow): Promise<ContentResourceRow> {
    return this.writeResourceRow(resource, id, row, 'PUT');
  }

  async deleteResourceRow(resource: ContentResource | string, id: string | number): Promise<void> {
    const key = typeof resource === 'string' ? resource : resource.key;
    const response = await fetch(`${getApiBaseUrl()}/${encodeURIComponent(key)}/${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Delete content resource API responded with ${response.status}`);
    }
  }

  async saveSection(key: string, payload: unknown): Promise<ContentSection[]> {
    const response = await fetch(`${getApiBaseUrl()}/content-section?key=${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
      body: JSON.stringify({ payload }),
    });

    if (!response.ok) {
      throw new Error(`Save content API responded with ${response.status}`);
    }

    const result = await response.json() as { sections?: ContentSection[] };
    await this.refresh();
    return result.sections ?? [];
  }

  async resetSection(key: string): Promise<ContentSection[]> {
    const response = await fetch(`${getApiBaseUrl()}/content-section?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Reset content API responded with ${response.status}`);
    }

    const result = await response.json() as { sections?: ContentSection[] };
    await this.refresh();
    return result.sections ?? [];
  }

  async uploadMedia(file: File, altText = ''): Promise<MediaAsset> {
    const data = await this.readFileAsDataUrl(file);
    const response = await fetch(`${getApiBaseUrl()}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        altText,
        data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Media upload API responded with ${response.status}`);
    }

    const result = await response.json() as { media?: MediaAsset };
    if (!result.media?.url) {
      throw new Error('Media upload did not return an image URL');
    }

    return result.media;
  }

  private async fetchRows(resource: string): Promise<ContentResourceRow[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/${encodeURIComponent(resource)}`);
      if (!response.ok) {
        throw new Error(`Content resource API responded with ${response.status}`);
      }

      const payload = await response.json() as { rows?: ContentResourceRow[] };
      return payload.rows ?? [];
    } catch {
      return [];
    }
  }

  private async fetchBlogs(): Promise<ContentResourceRow[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/blogs`);
      if (!response.ok) {
        throw new Error(`Blogs API responded with ${response.status}`);
      }

      const payload = await response.json() as { rows?: ContentResourceRow[]; posts?: ContentResourceRow[] };
      return payload.rows ?? payload.posts ?? [];
    } catch {
      return [];
    }
  }

  private async writeResourceRow(
    resource: ContentResource | string,
    id: string | number | null,
    row: ContentResourceRow,
    method: 'POST' | 'PUT',
  ): Promise<ContentResourceRow> {
    const key = typeof resource === 'string' ? resource : resource.key;
    const url = id == null
      ? `${getApiBaseUrl()}/${encodeURIComponent(key)}`
      : `${getApiBaseUrl()}/${encodeURIComponent(key)}/${encodeURIComponent(String(id))}`;
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
      body: JSON.stringify(row),
    });

    if (!response.ok) {
      throw new Error(`Write content resource API responded with ${response.status}`);
    }

    const payload = await response.json() as { row?: ContentResourceRow; post?: ContentResourceRow };
    return payload.row ?? payload.post ?? row;
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error ?? new Error('Could not read selected file'));
      reader.readAsDataURL(file);
    });
  }
}
