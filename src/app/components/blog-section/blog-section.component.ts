import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { UiIconComponent } from '../ui-icon/ui-icon.component';
import { ContentService } from '../../services/content.service';

type BlogPost = {
  slug: string;
  title: string;
  copy: string;
  date: string;
  tag: string;
  tone: string;
  image: string;
};

@Component({
  selector: 'app-blog-section',
  imports: [UiIconComponent],
  templateUrl: './blog-section.component.html',
  styleUrl: './blog-section.component.css',
})
export class BlogSectionComponent {
  private readonly contentService = inject(ContentService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly blogPosts: BlogPost[] = [];

  constructor() {
    this.blogPosts.splice(0);
    void this.loadBackendContent();
  }

  private async loadBackendContent(): Promise<void> {
    const posts = await this.contentService.loadBlogPosts() as BlogPost[];
    this.blogPosts.splice(0, this.blogPosts.length, ...posts.slice(0, 4));
    this.changeDetector.detectChanges();
  }
}
