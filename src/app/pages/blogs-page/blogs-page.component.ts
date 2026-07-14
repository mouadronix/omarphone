import { Component, computed, inject, signal } from '@angular/core';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import { ContentService } from '../../services/content.service';

type BlogPost = {
  slug: string;
  title: string;
  copy: string;
  date: string;
  tag: string;
  category: string;
  tags: string[];
  tone: string;
  image: string;
};

type BlogSort = 'latest' | 'oldest' | 'title';

@Component({
  selector: 'app-blogs-page',
  imports: [UiIconComponent],
  templateUrl: './blogs-page.component.html',
  styleUrl: './blogs-page.component.css',
})
export class BlogsPageComponent {
  private readonly contentService = inject(ContentService);

  readonly searchQuery = signal('');
  readonly selectedCategory = signal('All Articles');
  readonly selectedTag = signal<string | null>(null);
  readonly sortBy = signal<BlogSort>('latest');
  readonly currentPage = signal(1);
  readonly pageSize = 8;

  readonly blogPosts: BlogPost[] = [];

  readonly allBlogPosts: BlogPost[] = [];

  readonly categoryOptions = [
    { title: 'All Articles', icon: 'grid' },
    { title: 'Tips & Tricks', icon: 'sparkles' },
    { title: 'Repair Guides', icon: 'tools' },
    { title: 'Device Care', icon: 'shield' },
    { title: 'News & Updates', icon: 'calendar' },
    { title: 'Troubleshooting', icon: 'star' },
  ];

  readonly categoryFilters = computed(() =>
    this.categoryOptions.map((category) => ({
      ...category,
      count: category.title === 'All Articles'
        ? this.allBlogPosts.length
        : this.allBlogPosts.filter((post) => post.category === category.title).length,
    }))
  );

  readonly popularTags = computed(() => {
    const counts = new Map<string, number>();
    for (const post of this.allBlogPosts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10)
      .map(([title, count], index) => ({ title, count, tone: this.getTone(index) }));
  });

  readonly filteredPosts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.selectedCategory();
    const tag = this.selectedTag();

    const filtered = this.allBlogPosts.filter((post) => {
      const matchesSearch = !query || [
        post.title,
        post.copy,
        post.tag,
        post.category,
        ...post.tags,
      ].join(' ').toLowerCase().includes(query);
      const matchesCategory = category === 'All Articles' || post.category === category;
      const matchesTag = !tag || post.tags.includes(tag);
      return matchesSearch && matchesCategory && matchesTag;
    });

    return [...filtered].sort((a, b) => {
      if (this.sortBy() === 'oldest') {
        return this.getPostTime(a) - this.getPostTime(b);
      }
      if (this.sortBy() === 'title') {
        return a.title.localeCompare(b.title);
      }

      return this.getPostTime(b) - this.getPostTime(a);
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredPosts().length / this.pageSize)));

  readonly pagedPosts = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize;
    return this.filteredPosts().slice(start, start + this.pageSize);
  });

  readonly resultStart = computed(() => this.filteredPosts().length ? (Math.min(this.currentPage(), this.totalPages()) - 1) * this.pageSize + 1 : 0);
  readonly resultEnd = computed(() => this.filteredPosts().length ? Math.min(this.resultStart() + this.pagedPosts().length - 1, this.filteredPosts().length) : 0);
  readonly hasActiveFilters = computed(() => !!this.searchQuery().trim() || this.selectedCategory() !== 'All Articles' || !!this.selectedTag());
  readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));

  constructor() {
    this.blogPosts.splice(0);
    this.allBlogPosts.splice(0);
    void this.loadBackendContent();
  }

  private async loadBackendContent(): Promise<void> {
    const posts = await this.contentService.loadBlogPosts() as BlogPost[];
    this.blogPosts.splice(0, this.blogPosts.length, ...posts.slice(0, 4));
    this.allBlogPosts.splice(0, this.allBlogPosts.length, ...posts);
    this.currentPage.set(1);
  }

  updateSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
    this.currentPage.set(1);
  }

  selectTag(tag: string): void {
    this.selectedTag.set(this.selectedTag() === tag ? null : tag);
    this.currentPage.set(1);
  }

  updateSort(value: string): void {
    if (value === 'latest' || value === 'oldest' || value === 'title') {
      this.sortBy.set(value);
      this.currentPage.set(1);
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(Math.min(Math.max(page, 1), this.totalPages()));
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('All Articles');
    this.selectedTag.set(null);
    this.sortBy.set('latest');
    this.currentPage.set(1);
  }

  private getPostTime(post: BlogPost): number {
    return new Date(post.date).getTime();
  }

  private getTone(index: number): string {
    return ['violet', 'green', 'pink', 'blue', 'orange', 'cyan'][index % 6];
  }
}
