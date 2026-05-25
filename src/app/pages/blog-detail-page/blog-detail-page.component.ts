import { Component, computed, signal } from '@angular/core';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

type BlogTone = 'violet' | 'green' | 'orange' | 'pink' | 'blue' | 'cyan';

type BlogTip = {
  title: string;
  copy: string;
};

type BlogContentSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  steps?: string[];
  tip?: BlogTip;
};

type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  image: string;
  tone: BlogTone;
  tags: string[];
  sections: BlogContentSection[];
};

@Component({
  selector: 'app-blog-detail-page',
  imports: [UiIconComponent],
  templateUrl: './blog-detail-page.component.html',
  styleUrl: './blog-detail-page.component.css',
})
export class BlogDetailPageComponent {
  readonly articles: BlogArticle[] = [
    {
      slug: '5-signs-you-need-a-new-phone-screen',
      title: '5 Signs You Need a New Phone Screen',
      description:
        'Cracked glass is only one warning sign. Learn when your phone screen needs professional repair before the damage gets worse.',
      category: 'Tips & Tricks',
      date: 'May 20, 2026',
      readTime: '8 min read',
      author: 'OmarPhone Team',
      authorRole: 'Expert Technicians',
      image: '/assets/cutouts/screen-repair.png',
      tone: 'violet',
      tags: ['Screen Repair', 'iPhone Repair', 'Device Care'],
      sections: [
        {
          heading: 'Introduction',
          paragraphs: [
            'A damaged phone screen can affect touch response, display quality, water resistance, and daily comfort. The earlier you repair it, the easier it is to protect the rest of the device.',
          ],
        },
        {
          heading: 'When the Damage Is More Than Cosmetic',
          paragraphs: [
            'Small cracks can spread across the glass and put pressure on the display underneath. If you notice any of these problems, it is time to book a professional screen replacement.',
          ],
          bullets: [
            'Touch response is delayed, inconsistent, or does not work in some areas.',
            'Black spots, green lines, flickering, or brightness changes appear on the display.',
            'Glass pieces are loose, sharp, or letting dust enter the phone.',
          ],
        },
        {
          heading: 'Protect the Phone Before Repair',
          paragraphs: [
            'Until the repair is done, avoid pressing on cracked areas and keep the phone away from moisture. A temporary screen protector can reduce glass shedding, but it is not a real repair.',
          ],
          tip: {
            title: 'Pro Tip',
            copy: 'Back up your phone before any repair visit. It keeps your photos, contacts, and messages protected even when the service is simple.',
          },
        },
        {
          heading: 'What OmarPhone Checks',
          paragraphs: [
            'Our technicians inspect the display, frame, touch layer, camera area, and seal condition before replacing the screen.',
          ],
          steps: [
            'We diagnose the screen and confirm the exact repair needed.',
            'We replace the damaged part using high-quality compatible or genuine parts.',
            'We test touch, brightness, sensors, and final fit before delivery.',
          ],
        },
        {
          heading: 'Conclusion',
          paragraphs: [
            'A clean screen repair makes your phone safer, smoother, and easier to use every day. When the signs appear, fixing it early is the best move.',
          ],
        },
      ],
    },
    {
      slug: 'how-to-extend-your-phone-battery-life',
      title: 'How to Extend Your Phone Battery Life',
      description:
        'Simple habits that help your battery last longer and keep your phone running smoothly every day.',
      category: 'Guides',
      date: 'May 18, 2026',
      readTime: '6 min read',
      author: 'OmarPhone Team',
      authorRole: 'Battery Specialists',
      image: '/assets/cutouts/battery-repair.png',
      tone: 'green',
      tags: ['Battery Tips', 'iPhone Repair', 'Tech Tips'],
      sections: [
        {
          heading: 'Introduction',
          paragraphs: [
            'Battery health depends on charging habits, temperature, software behavior, and age. A few careful changes can keep your phone lasting longer between charges.',
          ],
        },
        {
          heading: 'Daily Habits That Help',
          paragraphs: ['The best battery care is simple and consistent. Focus on heat, charging range, and background apps.'],
          bullets: [
            'Avoid leaving your phone in hot cars or direct sun.',
            'Use reliable chargers and cables.',
            'Update your software and close battery-heavy apps you do not need.',
          ],
          tip: {
            title: 'Battery Tip',
            copy: 'If your phone drops from 30% to 0% quickly, the battery may need replacement even if it still charges.',
          },
        },
        {
          heading: 'When Replacement Makes Sense',
          paragraphs: [
            'If battery health is low, charging is unstable, or the phone shuts down randomly, a replacement can restore daily reliability.',
          ],
        },
      ],
    },
    {
      slug: 'laptop-overheating-what-to-do',
      title: 'Laptop Overheating? Here is What to Do',
      description:
        'Learn common causes, quick fixes, and when to seek expert laptop repair support.',
      category: 'Repair Guide',
      date: 'May 15, 2026',
      readTime: '7 min read',
      author: 'OmarPhone Team',
      authorRole: 'Laptop Repair Experts',
      image: '/assets/cutouts/laptop-repair.png',
      tone: 'orange',
      tags: ['Laptop Fix', 'Device Care', 'Repair Guide'],
      sections: [
        {
          heading: 'Introduction',
          paragraphs: [
            'Heat slows performance, shortens component life, and can cause sudden shutdowns. Overheating should be handled before it damages the board or battery.',
          ],
        },
        {
          heading: 'Common Causes',
          paragraphs: ['Most overheating problems come from blocked airflow, dust, old thermal paste, or heavy software load.'],
          bullets: [
            'Fans are noisy, blocked, or not spinning correctly.',
            'The laptop is used on soft fabric that blocks vents.',
            'Thermal paste is dry or internal dust is trapping heat.',
          ],
        },
        {
          heading: 'What to Do First',
          paragraphs: ['Shut down the laptop if it becomes extremely hot. Let it cool, clean visible vents gently, and avoid using it on beds or blankets.'],
          steps: [
            'Check airflow and remove external dust.',
            'Review background apps and performance settings.',
            'Book a technician inspection if heat returns quickly.',
          ],
        },
      ],
    },
  ];

  readonly categories = [
    ['All Articles', '48'],
    ['Tips & Tricks', '12'],
    ['Repair Guides', '15'],
    ['Device Care', '8'],
    ['News & Updates', '6'],
    ['Troubleshooting', '7'],
  ];

  readonly popularTags = [
    'iPhone Repair',
    'Screen Repair',
    'Back Glass',
    'Apple Tips',
    'Device Care',
    'Water Damage',
    'Cracked Screen',
    'Tech Tips',
    'Battery Tips',
    'iOS Update',
  ];

  readonly slug = signal(this.getCurrentSlug());
  readonly article = computed(() => this.articles.find((article) => article.slug === this.slug()) ?? this.articles[0]);
  readonly latestArticles = computed(() => this.articles.filter((article) => article.slug !== this.article().slug).slice(0, 4));

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => this.slug.set(this.getCurrentSlug()));
    }
  }

  private getCurrentSlug(): string {
    if (typeof window === 'undefined') {
      return this.articles[0].slug;
    }

    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts[1] ?? this.articles[0].slug;
  }
}
