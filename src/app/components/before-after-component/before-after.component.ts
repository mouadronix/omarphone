import { Component, inject } from '@angular/core';
import { UiIconComponent } from '../ui-icon/ui-icon.component';
import { ContentService } from '../../services/content.service';

type BeforeAfterRepair = {
  device: string;
  service: string;
  copy: string;
  time: string;
  tone: string;
  beforeImage: string;
  afterImage: string;
  kind: string;
};

type ResultReason = {
  title: string;
  copy: string;
  icon: string;
  tone: string;
};

@Component({
  selector: 'app-before-after',
  imports: [UiIconComponent],
  templateUrl: './before-after.component.html',
  styleUrl: './before-after.component.css',
})
export class BeforeAfterComponent {
  private readonly contentService = inject(ContentService);

  readonly repairTabs = [
    ['All Repairs', '24'],
    ['Phone', '16'],
    ['Laptop', '5'],
    ['Tablet', '2'],
    ['Smartwatch', '1'],
  ];

  readonly beforeAfterRepairs: BeforeAfterRepair[] = [
    {
      device: 'iphone 11 Pro',
      service: 'Screen Replacement',
      copy: 'Flickering and dim display replaced with a brand new one.',
      time: '4 Hours',
      tone: 'pink',
      beforeImage: '/images/before and after/iphone 11 before.png',
      afterImage: '/images/before and after/iphone 11 after.png',
      kind: 'Phone',
    },
    {
      device: 'Ipad Pro 2020',
      service: 'Screen Replacement',
      copy: 'Flickering and dim display replaced with a brand new one.',
      time: '4 Hours',
      tone: 'pink',
      beforeImage: '/images/before and after/ipad screen before.png',
      afterImage: '/images/before and after/ipad screen after.png',
      kind: 'Tablet',
    },
    {
      device: 'Apple Watch Ultra ',
      service: 'Screen Replacement',
      copy: 'Deep scratches removed, display looks crystal clear.',
      time: '4 Hours',
      tone: 'pink',
      beforeImage: '/images/before and after/apple watch before.png',
      afterImage: '/images/before and after/apple watch after.png',
      kind: 'Smartwatch',
    },
    {
      device: 'MacBook Air M2 ',
      service: 'Screen Replacement',
      copy: 'Flickering and dim display replaced with a brand new one.',
      time: '4 Hours',
      tone: 'pink',
      beforeImage: '/images/before and after/Macbook sreen before.png',
      afterImage: '/images/before and after/Macbook sreen after.png',
      kind: 'laptop',
    }
  ];

  readonly resultReasons: ResultReason[] = [
    { title: 'Expert Technicians', copy: 'Certified pros with years of experience.', icon: '♢', tone: 'pink' },
    { title: 'High Quality Parts', copy: 'We use 100% original or premium parts.', icon: '⚙', tone: 'blue' },
    { title: 'Fast Turnaround', copy: 'Most repairs completed within 24-48 hours.', icon: '◷', tone: 'green' },
    { title: 'Warranty Included', copy: 'Every repair comes with 90-day warranty.', icon: '♢', tone: 'violet' },
    { title: 'Customer Satisfaction', copy: '20K+ happy customers and counting.', icon: '♡', tone: 'pink' },
  ];

  readonly testimonials = [
    ['reda salhaoui', 'Google Maps Review', 'Negozio ben fornito, personale disponibile e competente. Ottimo il servizio di riparazione: ho risparmiato evitando di cambiare telefono. Consigliato!'],
    ['mohamed arjdal', 'Google Maps Review', 'Omar e suo fratello sono due veri professionisti: gentili, preparati e sempre disponibili con i clienti.'],
    ['Marco Goria', 'Local Guide Review', 'Buona scelta di cellulari e apparecchiature elettroniche per tutti i gusti ed esigenze. Effettuano anche riparazioni a prezzi piu che onesti.'],
    ['LORENZO RUSSO', 'Charging Port Repair', 'Mi hanno sistemato il telefono, aggiustandomi l ingresso USB-C per la ricarica. Lavoro veloce e prezzo piu che onesto.'],
  ];

  constructor() {
    this.beforeAfterRepairs.splice(0);
    this.testimonials.splice(0);
    void this.loadBackendContent();
  }

  private async loadBackendContent(): Promise<void> {
    const content = await this.contentService.load();
    if (Array.isArray(content?.beforeAfter?.repairs)) {
      this.beforeAfterRepairs.splice(0, this.beforeAfterRepairs.length, ...(content.beforeAfter.repairs as BeforeAfterRepair[]));
    }
    if (Array.isArray(content?.beforeAfter?.testimonials)) {
      this.testimonials.splice(0, this.testimonials.length, ...(content.beforeAfter.testimonials as string[][]));
    }
  }

  setComparePosition(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const stage = input?.closest<HTMLElement>('.compare-stage');

    if (!input || !stage) {
      return;
    }

    stage.style.setProperty('--compare', `${input.value}%`);
  }

  repairKind(repair: BeforeAfterRepair): string {
    return repair.kind.toLowerCase();
  }
}
