import { Component, inject, signal } from '@angular/core';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import { ContentService } from '../../services/content.service';

type ReviewTone = 'violet' | 'blue' | 'pink' | 'green' | 'orange' | 'cyan';

type Review = {
  name: string;
  date: string;
  copy: string;
  stars: string;
  service: string;
  icon: string;
  tone: ReviewTone;
  avatar: string;
};

type ReviewStat = {
  value: string;
  label: string;
  copy: string;
  icon: string;
  tone: ReviewTone;
};

@Component({
  selector: 'app-reviews-page',
  imports: [UiIconComponent],
  templateUrl: './reviews-page.component.html',
  styleUrl: './reviews-page.component.css',
})
export class ReviewsPageComponent {
  private readonly contentService = inject(ContentService);
  readonly selectedRating = signal(0);

  readonly stats: ReviewStat[] = [];

  readonly reviews: Review[] = [];

  readonly helpPerks = [
    'Share your experience',
    'Help others make informed decisions',
    'It only takes a minute',
  ];

  constructor() {
    this.stats.splice(0);
    this.reviews.splice(0);
    void this.loadBackendContent();
  }

  private async loadBackendContent(): Promise<void> {
    const content = await this.contentService.load();
    if (Array.isArray(content?.reviews?.stats)) {
      this.stats.splice(0, this.stats.length, ...(content.reviews.stats as ReviewStat[]));
    }
    if (Array.isArray(content?.reviews?.reviews)) {
      this.reviews.splice(0, this.reviews.length, ...(content.reviews.reviews as Review[]));
    }
  }

  setRating(value: number): void {
    this.selectedRating.set(value);
  }

  reviewerInitials(name: string): string {
    return name
      .replace(/[“”"_]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
}
