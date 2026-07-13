import { Component, inject } from '@angular/core';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import { ContentService } from '../../services/content.service';

type Tone = 'violet' | 'blue' | 'pink' | 'green' | 'orange' | 'cyan';

type ServiceCard = {
  title: string;
  copy: string;
  price: string;
  image: string;
  icon: string;
  tone: Tone;
};

type Feature = {
  title: string;
  copy: string;
  icon: string;
  tone: Tone;
};

type Step = {
  title: string;
  copy: string;
  icon: string;
  tone: string;
  image: string;
};

@Component({
  selector: 'app-services-page',
  imports: [UiIconComponent],
  templateUrl: './services-page.component.html',
  styleUrl: './services-page.component.css',
})
export class ServicesPageComponent {
  private readonly contentService = inject(ContentService);

  readonly heroTrust: Feature[] = [
    { title: 'Skilled Technicians', copy: '', icon: 'shield', tone: 'violet' },
    { title: 'Premium Quality Parts', copy: '', icon: 'badge', tone: 'pink' },
    { title: 'Fast Turnaround', copy: '', icon: 'clock', tone: 'violet' },
  ];

  readonly services: ServiceCard[] = [
    {
      title: 'Phone Screen Repair',
      copy: 'Cracked or broken screen? We will make it look brand new.',
      price: 'Free quote',
      image: '/assets/cutouts/screen-repair.png',
      icon: 'smartphone',
      tone: 'violet',
    },
    {
      title: 'Phone Battery Replacement',
      copy: 'Fast battery drain? Get your power back.',
      price: 'Free quote',
      image: '/assets/cutouts/battery-repair.png',
      icon: 'battery',
      tone: 'green',
    },
    {
      title: 'Laptop Screen Repair',
      copy: 'Cracked or flickering display? We fix it fast.',
      price: 'Free quote',
      image: '/assets/cutouts/laptop-repair.png',
      icon: 'laptop',
      tone: 'blue',
    },
    {
      title: 'Laptop Battery Replacement',
      copy: 'Short battery life? Get long-lasting performance.',
      price: 'Free quote',
      image: '/assets/cutouts/ipad-repair.png',
      icon: 'settings',
      tone: 'orange',
    },
    {
      title: 'Camera Repair',
      copy: 'Blurry photos? We fix camera issues quickly.',
      price: 'Free quote',
      image: '/assets/cutouts/iphone.png',
      icon: 'camera',
      tone: 'pink',
    },
    {
      title: 'Tablet Repair',
      copy: 'All tablet issues fixed quickly and beautifully.',
      price: 'Free quote',
      image: '/assets/cutouts/ipad-repair.png',
      icon: 'tablet',
      tone: 'cyan',
    },
  ];

  readonly trustFeatures: Feature[] = [
    {
      title: 'Warranty on All Repairs',
      copy: 'We stand by our work. All repairs come with warranty for your peace of mind.',
      icon: 'shield',
      tone: 'violet',
    },
    {
      title: 'Quick Turnaround',
      copy: 'Most repairs are completed on the same day. Get back to what matters.',
      icon: 'clock',
      tone: 'pink',
    },
    {
      title: 'Data Protection',
      copy: 'Your data is 100% safe with our secure repair process.',
      icon: 'lock',
      tone: 'violet',
    },
    {
      title: 'Premium Quality Parts',
      copy: 'We use high-quality parts for lasting performance and reliability.',
      icon: 'badge',
      tone: 'violet',
    },
  ];

  readonly process: Feature[] = [
    { title: 'Device Check-in', copy: 'We inspect your device and understand the issue.', icon: 'clipboard', tone: 'violet' },
    { title: 'Diagnosis', copy: 'Our experts run a complete diagnostic and provide a quote.', icon: 'search', tone: 'violet' },
    { title: 'Repair', copy: 'We repair your device using premium quality parts and tools.', icon: 'tools', tone: 'violet' },
    { title: 'Quality Check', copy: 'Multi-point testing to ensure your device works perfectly.', icon: 'shield', tone: 'violet' },
    { title: 'Ready for Pickup', copy: 'We return your device good as new.', icon: 'box', tone: 'violet' },
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

  constructor() {
    this.heroTrust.splice(0);
    this.services.splice(0);
    this.trustFeatures.splice(0);
    this.process.splice(0);
    void this.loadBackendContent();
  }

  private async loadBackendContent(): Promise<void> {
    const content = await this.contentService.load();
    if (Array.isArray(content?.services?.heroTrust)) {
      this.heroTrust.splice(0, this.heroTrust.length, ...(content.services.heroTrust as Feature[]));
    }
    if (Array.isArray(content?.services?.services)) {
      this.services.splice(0, this.services.length, ...(content.services.services as ServiceCard[]));
    }
    if (Array.isArray(content?.services?.trustFeatures)) {
      this.trustFeatures.splice(0, this.trustFeatures.length, ...(content.services.trustFeatures as Feature[]));
    }
    if (Array.isArray(content?.services?.process)) {
      this.process.splice(0, this.process.length, ...(content.services.process as Feature[]));
    }
  }
}
