import { Component } from '@angular/core';
import { UiIconComponent } from '../ui-icon/ui-icon.component';

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
    ['Sarah Johnson', 'iPhone 14 Pro', 'Amazing service! My iPhone looks brand new now.'],
    ['Michael Chen', 'Dell XPS 15', 'Fixed my laptop in 24 hours. Super fast and professional!'],
    ['Emily Davis', 'Samsung S23', 'Great customer service and affordable pricing.'],
    ['David Wilson', 'MacBook Air', 'Highly recommend OmarPhone for any device repair!'],
  ];

  setComparePosition(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const stage = input?.closest<HTMLElement>('.compare-stage');

    if (!input || !stage) {
      return;
    }

    stage.style.setProperty('--compare', `${input.value}%`);
  }
}
