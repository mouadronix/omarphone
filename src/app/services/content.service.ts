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
  private contentPromise: Promise<SiteContent | null> | null = null;

  load(): Promise<SiteContent | null> {
    if (!this.contentPromise) {
      this.contentPromise = this.fetchContent();
    }

    return this.contentPromise;
  }

  refresh(): Promise<SiteContent | null> {
    this.contentPromise = this.fetchContent();
    return this.contentPromise;
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

  private async fetchContent(): Promise<SiteContent | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/content`);
      if (!response.ok) {
        throw new Error(`Content API responded with ${response.status}`);
      }

      const content = await response.json() as SiteContent;
      this.content.set(content);
      return content;
    } catch {
      this.content.set(null);
      return null;
    }
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
