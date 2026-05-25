import { Component, Input } from '@angular/core';
import { BlogSectionComponent } from '../../components/blog-section/blog-section.component';
import { BeforeAfterComponent } from '../../components/before-after-component/before-after.component';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

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

@Component({
  selector: 'app-home-page',
  imports: [BeforeAfterComponent, BlogSectionComponent, UiIconComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  @Input() isDark = false;

  readonly services: Service[] = [
    {
      title: 'Phone Screen Repair',
      price: 'From $79',
      copy: 'Cracked or broken screen? We will make it look brand new.',
      icon: 'screen',
      tone: 'violet',
      image: '/assets/cutouts/screen-repair.png',
    },
    {
      title: 'Phone Battery Replacement',
      price: 'From $49',
      copy: 'Fast battery drain? Get your power back.',
      icon: 'battery',
      tone: 'green',
      image: '/assets/cutouts/battery-repair.png',
    },
    {
      title: 'Laptop Screen Repair',
      price: 'From $129',
      copy: 'Cracked or flickering display? We fix it fast.',
      icon: 'laptop',
      tone: 'blue',
      image: '/assets/cutouts/laptop-repair.png',
    },
    {
      title: 'Laptop Battery Replacement',
      price: 'From $169',
      copy: 'Short battery life? Get long-lasting performance.',
      icon: 'chip',
      tone: 'orange',
      image: '/assets/cutouts/ipad-repair.png',
    },
    {
      title: 'Camera Repair',
      price: 'From $69',
      copy: 'Blurry photos? We fix camera issues quickly.',
      icon: 'camera',
      tone: 'pink',
      image: '/assets/cutouts/iphone.png',
    },
    {
      title: 'Tablet Repair',
      price: 'From $79',
      copy: 'All tablet issues fixed quickly and beautifully.',
      icon: 'tablet',
      tone: 'cyan',
      image: '/assets/cutouts/ipad-repair.png',
    },
  ];

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

  readonly testimonials = [
    ['Sarah Johnson', 'iPhone 14 Pro', 'Amazing service! My iPhone looks brand new now.'],
    ['Michael Chen', 'Dell XPS 15', 'Fixed my laptop in 24 hours. Super fast and professional!'],
    ['Emily Davis', 'Samsung S23', 'Great customer service and affordable pricing.'],
    ['David Wilson', 'MacBook Air', 'Highly recommend OmarPhone for any device repair!'],
  ];

  readonly brands = ['Apple', 'Samsung', 'Google', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Microsoft'];
  readonly trust = ['90-Day Warranty', 'Genuine Parts', 'Expert Technicians', 'Same Day Repair'];
}
