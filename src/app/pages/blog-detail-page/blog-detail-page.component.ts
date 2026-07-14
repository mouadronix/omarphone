import { Component, computed, inject, signal } from '@angular/core';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import { ContentService } from '../../services/content.service';

type BlogTone = 'violet' | 'green' | 'orange' | 'pink' | 'blue' | 'cyan';

type BlogTip = {
  title: string;
  copy: string;
};

type BlogContentSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  steps?: string[];
  tip?: BlogTip;
};

type BlogArticle = {
  slug: string;
  title: string;
  description?: string;
  copy?: string;
  category: string;
  date: string;
  readTime?: string;
  author?: string;
  authorRole?: string;
  image: string;
  tone: BlogTone;
  tags: string[];
  sections?: BlogContentSection[];
};

@Component({
  selector: 'app-blog-detail-page',
  imports: [UiIconComponent],
  templateUrl: './blog-detail-page.component.html',
  styleUrl: './blog-detail-page.component.css',
})
export class BlogDetailPageComponent {
  private readonly contentService = inject(ContentService);
  readonly contentRevision = signal(0);

  readonly articles: BlogArticle[] = [];

  readonly categories: string[][] = [];

  readonly popularTags: string[] = [];

  readonly slug = signal(this.getCurrentSlug());
  readonly article = computed(() => {
    this.contentRevision();
    return this.normalizeArticle(this.articles.find((article) => article.slug === this.slug()) ?? this.articles[0]);
  });
  readonly latestArticles = computed(() => {
    this.contentRevision();
    return this.articles
      .filter((article) => article.slug !== this.article().slug)
      .slice(0, 4)
      .map((article) => this.normalizeArticle(article));
  });

  constructor() {
    this.articles.splice(0);
    this.categories.splice(0);
    this.popularTags.splice(0);
    void this.loadBackendContent();
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => this.slug.set(this.getCurrentSlug()));
    }
  }

  private async loadBackendContent(): Promise<void> {
    const posts = await this.contentService.loadBlogPosts() as BlogArticle[];
    if (!posts.length) {
      return;
    }

    this.articles.splice(0, this.articles.length, ...posts.map((post) => this.normalizeArticle(post)));
    this.syncSidebarData();
    this.contentRevision.update((value) => value + 1);
  }

  private syncSidebarData(): void {
    const categoryCounts = new Map<string, number>([['All Articles', this.articles.length]]);
    const tagCounts = new Map<string, number>();

    for (const article of this.articles) {
      categoryCounts.set(article.category, (categoryCounts.get(article.category) ?? 0) + 1);
      for (const tag of article.tags ?? []) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }

    this.categories.splice(
      0,
      this.categories.length,
      ...[...categoryCounts.entries()].map(([category, count]) => [category, String(count)])
    );
    this.popularTags.splice(
      0,
      this.popularTags.length,
      ...[...tagCounts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 10)
        .map(([tag]) => tag)
    );
  }

  private normalizeArticle(article: BlogArticle): Required<BlogArticle> {
    const description = article.description ?? article.copy ?? 'Expert repair advice from the OmarPhone team.';
    return {
      ...article,
      description,
      copy: article.copy ?? description,
      readTime: article.readTime ?? '5 min read',
      author: article.author ?? 'OmarPhone Team',
      authorRole: article.authorRole ?? 'Expert Technicians',
      sections: article.sections?.length ? article.sections : this.buildDefaultSections(article, description),
    };
  }

  private buildDefaultSections(article: BlogArticle, description: string): BlogContentSection[] {
    return [
      {
        heading: 'Introduction',
        paragraphs: [
          description,
          'This guide gives you practical signs to watch for and explains when it is better to ask a technician before the problem gets worse.',
        ],
      },
      {
        heading: article.category,
        paragraphs: [
          'Every device problem has a different cause. OmarPhone checks the visible damage, internal condition, battery health, connectors, cameras, sensors, and software behavior before recommending the right repair.',
        ],
        bullets: [
          'We inspect the device before confirming the repair.',
          'We explain the issue clearly before starting.',
          'We test the device again after the repair is complete.',
        ],
      },
      {
        heading: 'Pro Advice',
        paragraphs: [
          'Avoid forcing the device, charging it with damaged cables, or opening it without the right tools. A quick diagnosis can protect the screen, battery, board, and data.',
        ],
        tip: {
          title: 'OmarPhone Tip',
          copy: 'Back up your device before any repair visit when possible. It keeps your photos, contacts, and documents protected.',
        },
      },
      {
        heading: 'What Happens Next',
        paragraphs: [
          'Book a repair, choose your device, describe the issue, and our team will confirm the best repair path.',
        ],
        steps: [
          'Choose your device and issue.',
          'Send your booking request.',
          'Our technician confirms the repair details.',
        ],
      },
      {
        heading: 'Conclusion',
        paragraphs: [
          'A professional repair keeps your device reliable, clean, and ready for daily use. When you are unsure, OmarPhone can diagnose it first.',
        ],
      },
    ];
  }

  private getCurrentSlug(): string {
    if (typeof window === 'undefined') {
      return this.articles[0].slug;
    }

    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts[1] ?? this.articles[0].slug;
  }
}
