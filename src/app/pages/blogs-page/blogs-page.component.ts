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

  readonly blogPosts: BlogPost[] = [
    {
      slug: '5-signs-you-need-a-new-phone-screen',
      title: '5 Signs You Need a New Phone Screen',
      copy: 'Cracked screen or unresponsive touch? Here are the top signs it is time for a professional repair.',
      date: 'May 20, 2026',
      tag: 'Tips & Tricks',
      category: 'Tips & Tricks',
      tags: ['iPhone Repair', 'Screen Repair', 'Cracked Screen', 'Tech Tips'],
      tone: 'violet',
      image: '/assets/cutouts/screen-repair.png',
    },
    {
      slug: 'how-to-extend-your-phone-battery-life',
      title: 'How to Extend Your Phone Battery Life',
      copy: 'Simple habits that help your battery last longer and keep your phone running smoothly every day.',
      date: 'May 18, 2026',
      tag: 'Guides',
      category: 'Device Care',
      tags: ['Battery Tips', 'iPhone Repair', 'Device Care', 'Tech Tips'],
      tone: 'green',
      image: '/assets/cutouts/battery-repair.png',
    },
    {
      slug: 'laptop-overheating-what-to-do',
      title: 'Laptop Overheating? Here is What to Do',
      copy: 'Learn common causes, quick fixes, and when to seek expert laptop repair support.',
      date: 'May 15, 2026',
      tag: 'Repair Guide',
      category: 'Repair Guides',
      tags: ['Laptop Fix', 'Device Care', 'Tech Tips'],
      tone: 'orange',
      image: '/assets/cutouts/laptop-repair.png',
    },
    {
      slug: 'camera-repair-services',
      title: 'We Now Offer Camera Repair Services',
      copy: 'Blurry photos or damaged lenses? Our experts can bring your camera back to life.',
      date: 'May 12, 2026',
      tag: 'News',
      category: 'News & Updates',
      tags: ['Camera Repair', 'iPhone Repair', 'Tech Tips'],
      tone: 'pink',
      image: '/assets/cutouts/iphone.png',
    },
  ];

  readonly allBlogPosts: BlogPost[] = [
    ...this.blogPosts,
    {
      slug: 'when-should-you-replace-your-laptop-battery',
      title: 'When Should You Replace Your Laptop Battery?',
      copy: 'Short battery life? Find out when it is time to replace your laptop battery.',
      date: 'May 8, 2026',
      tag: 'Guides',
      category: 'Device Care',
      tags: ['Battery Tips', 'Laptop Fix', 'Device Care'],
      tone: 'green',
      image: '/assets/cutouts/ipad-repair.png',
    },
    {
      slug: 'how-to-fix-slow-phone-performance',
      title: 'How to Fix Slow Phone Performance',
      copy: 'Is your phone lagging? Try these simple tricks to boost performance instantly.',
      date: 'May 5, 2026',
      tag: 'Tips & Tricks',
      category: 'Troubleshooting',
      tags: ['iPhone Repair', 'Device Care', 'Tech Tips'],
      tone: 'violet',
      image: '/assets/cutouts/battery-repair.png',
    },
    {
      slug: 'camera-not-working-quick-fix-guide',
      title: 'Camera Not Working? Quick Fix Guide',
      copy: 'Blurry or broken camera? Learn how to troubleshoot and fix camera issues.',
      date: 'May 2, 2026',
      tag: 'Repair Guide',
      category: 'Troubleshooting',
      tags: ['Camera Repair', 'iPhone Repair', 'Tech Tips'],
      tone: 'orange',
      image: '/assets/cutouts/iphone.png',
    },
    {
      slug: 'water-damage-repair-what-you-must-do-first',
      title: 'Water Damage Repair: What You Must Do First',
      copy: 'Dropped your phone in water? Follow these steps immediately to save it.',
      date: 'Apr 28, 2026',
      tag: 'News',
      category: 'Troubleshooting',
      tags: ['Water Damage', 'iPhone Repair', 'Repair Guides'],
      tone: 'pink',
      image: '/assets/cutouts/screen-repair.png',
    },
    {
      slug: 'best-ways-to-protect-your-phone-screen',
      title: 'Best Ways to Protect Your Phone Screen',
      copy: 'Avoid costly repairs with these simple tips to protect your screen.',
      date: 'Apr 25, 2026',
      tag: 'Tips & Tricks',
      category: 'Device Care',
      tags: ['Screen Repair', 'Cracked Screen', 'Device Care'],
      tone: 'violet',
      image: '/assets/cutouts/screen-repair.png',
    },
    {
      slug: 'why-fast-charging-damages-your-battery',
      title: 'Why Fast Charging Damages Your Battery',
      copy: 'Is fast charging safe? Learn how it affects your battery lifespan.',
      date: 'Apr 22, 2026',
      tag: 'Guides',
      category: 'Device Care',
      tags: ['Battery Tips', 'Device Care', 'Tech Tips'],
      tone: 'green',
      image: '/assets/cutouts/battery-repair.png',
    },
    {
      slug: 'tablet-not-charging-try-these-fixes',
      title: 'Tablet Not Charging? Try These Fixes',
      copy: 'Tablet will not charge? Here are common causes and easy solutions.',
      date: 'Apr 18, 2026',
      tag: 'Repair Guide',
      category: 'Repair Guides',
      tags: ['Tablet Repair', 'Battery Tips', 'Troubleshooting'],
      tone: 'orange',
      image: '/assets/cutouts/ipad-repair.png',
    },
    {
      slug: 'signs-your-device-needs-professional-repair',
      title: 'Signs Your Device Needs Professional Repair',
      copy: 'Not sure if your device needs repair? These warning signs will help.',
      date: 'Apr 15, 2026',
      tag: 'News',
      category: 'Repair Guides',
      tags: ['Device Care', 'Tech Tips', 'Troubleshooting'],
      tone: 'pink',
      image: '/assets/cutouts/fix-it.png',
    },
  ];

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
    const content = await this.contentService.load();
    if (Array.isArray(content?.blogs?.posts)) {
      const posts = content.blogs.posts as BlogPost[];
      this.blogPosts.splice(0, this.blogPosts.length, ...posts.slice(0, 4));
      this.allBlogPosts.splice(0, this.allBlogPosts.length, ...posts);
      this.currentPage.set(1);
    }
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
