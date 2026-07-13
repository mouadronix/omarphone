import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        home: { services: [], testimonials: [] },
        booking: { devices: [], repairIssues: [] },
        reviews: { stats: [], reviews: [] },
        blogs: { posts: [] },
        beforeAfter: { repairs: [], testimonials: [] },
        services: { heroTrust: [], services: [], trustFeatures: [], process: [] },
        support: { faqs: [], quickActions: [], contactInfo: [] },
      }),
    })));

    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  }, 15000);

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('We fix it');
    expect(compiled.textContent).toContain('OmarPhone');
  });
});
