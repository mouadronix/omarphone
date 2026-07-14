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

  readonly heroTrust: Feature[] = [];

  readonly services: ServiceCard[] = [];

  readonly trustFeatures: Feature[] = [];

  readonly process: Feature[] = [];

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
    const [heroTrust, services, trustFeatures, process] = await Promise.all([
      this.contentService.loadPublicRows('service-trust'),
      this.contentService.loadPublicRows('services'),
      this.contentService.loadPublicRows('service-features'),
      this.contentService.loadPublicRows('service-process'),
    ]);
    this.heroTrust.splice(0, this.heroTrust.length, ...(heroTrust as Feature[]));
    this.services.splice(0, this.services.length, ...(services as ServiceCard[]));
    this.trustFeatures.splice(0, this.trustFeatures.length, ...(trustFeatures as Feature[]));
    this.process.splice(0, this.process.length, ...(process as Feature[]));
  }
}
