import { ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { BlogSectionComponent } from '../../components/blog-section/blog-section.component';
import { BeforeAfterComponent } from '../../components/before-after-component/before-after.component';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import { ContentService } from '../../services/content.service';

type Service = {
  title: string;
  price: string;
  copy: string;
  icon: string;
  tone: string;
  image: string;
};

type Step = {
  title: string;
  copy: string;
  icon: string;
  tone: string;
  image: string;
};

type Feature = {
  title: string;
  copy: string;
  icon: string;
  tone: string;
};

type BrandLogo = {
  name: string;
  logo: string;
};

@Component({
  selector: 'app-home-page',
  imports: [BeforeAfterComponent, BlogSectionComponent, UiIconComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  private readonly contentService = inject(ContentService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  @Input() isDark = false;

  readonly services: Service[] = [];

  readonly features: Feature[] = [
    { title: '90-Day Warranty', copy: 'Peace of mind with our warranty.', icon: 'shield', tone: 'violet' },
    { title: 'Genuine Parts', copy: 'We use original and high-quality parts.', icon: 'badge', tone: 'orange' },
    { title: 'Expert Technicians', copy: 'Certified professionals who care.', icon: 'user', tone: 'blue' },
    { title: 'Fast Turnaround', copy: 'Most repairs completed within 24-48 hours.', icon: 'clock', tone: 'pink' },
  ];

  readonly steps: Step[] = [
    {
      title: 'Book a Repair',
      copy: 'Choose your device and issue, then book online.',
      icon: 'calendar',
      tone: 'violet',
      image: '/assets/cutouts/book-a-repair.png',
    },
    {
      title: 'We Diagnose',
      copy: 'Our experts inspect and confirm the issue.',
      icon: 'box',
      tone: 'orange',
      image: '/assets/cutouts/we-diagnose.png',
    },
    {
      title: 'We Fix It',
      copy: 'We repair with care using original parts.',
      icon: 'tools',
      tone: 'blue',
      image: '/assets/cutouts/fix-it.png',
    },
    {
      title: 'Get It Back',
      copy: 'Your device returns good as new.',
      icon: 'package',
      tone: 'pink',
      image: '/assets/cutouts/get-it-back.png',
    },
  ];

  readonly stats = [
    ['20K+', 'Happy Customers', 'people'],
    ['35K+', 'Devices Repaired', 'tools'],
    ['4.9/5', 'Average Rating', 'star'],
    ['98%', 'Satisfaction Rate', 'shield'],
  ];

  readonly testimonials: string[][] = [];

  readonly brands: BrandLogo[] = [
    { name: 'Apple', logo: '/images/brands/apple.svg' },
    { name: 'Samsung', logo: '/images/brands/samsung.svg' },
    { name: 'Google', logo: '/images/brands/google.svg' },
    { name: 'Dell', logo: '/images/brands/dell.svg' },
    { name: 'HP', logo: '/images/brands/hp.svg' },
    { name: 'Lenovo', logo: '/images/brands/lenovo.svg' },
    { name: 'ASUS', logo: '/images/brands/asus.svg' },
    { name: 'Microsoft', logo: '/images/brands/microsoft.svg' },
  ];
  readonly trust = ['90-Day Warranty', 'Genuine Parts', 'Expert Technicians', 'Same Day Repair'];

  constructor() {
    this.services.splice(0);
    this.testimonials.splice(0);
    void this.loadBackendContent();
  }

  private async loadBackendContent(): Promise<void> {
    const [services, testimonials] = await Promise.all([
      this.contentService.loadPublicRows('home-services'),
      this.contentService.loadPublicRows('home-testimonials'),
    ]);
    this.services.splice(0, this.services.length, ...(services as Service[]));
    this.testimonials.splice(
      0,
      this.testimonials.length,
      ...testimonials.map((item) => [String(item['name'] ?? ''), String(item['service'] ?? ''), String(item['copy'] ?? '')])
    );
    this.changeDetector.detectChanges();
  }
}
