import { Component } from '@angular/core';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

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
  selector: 'app-blogs-page',
  imports: [UiIconComponent],
  templateUrl: './blogs-page.component.html',
  styleUrl: './blogs-page.component.css',
})
export class BlogsPageComponent {
  readonly blogPosts: BlogPost[] = [
    {
      slug: '5-signs-you-need-a-new-phone-screen',
      title: '5 Signs You Need a New Phone Screen',
      copy: 'Cracked screen or unresponsive touch? Here are the top signs it is time for a professional repair.',
      date: 'May 20, 2026',
      tag: 'Tips & Tricks',
      tone: 'violet',
      image: '/assets/cutouts/screen-repair.png',
    },
    {
      slug: 'how-to-extend-your-phone-battery-life',
      title: 'How to Extend Your Phone Battery Life',
      copy: 'Simple habits that help your battery last longer and keep your phone running smoothly every day.',
      date: 'May 18, 2026',
      tag: 'Guides',
      tone: 'green',
      image: '/assets/cutouts/battery-repair.png',
    },
    {
      slug: 'laptop-overheating-what-to-do',
      title: 'Laptop Overheating? Here is What to Do',
      copy: 'Learn common causes, quick fixes, and when to seek expert laptop repair support.',
      date: 'May 15, 2026',
      tag: 'Repair Guide',
      tone: 'orange',
      image: '/assets/cutouts/laptop-repair.png',
    },
    {
      slug: 'camera-repair-services',
      title: 'We Now Offer Camera Repair Services',
      copy: 'Blurry photos or damaged lenses? Our experts can bring your camera back to life.',
      date: 'May 12, 2026',
      tag: 'News',
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
      tone: 'green',
      image: '/assets/cutouts/ipad-repair.png',
    },
    {
      slug: 'how-to-fix-slow-phone-performance',
      title: 'How to Fix Slow Phone Performance',
      copy: 'Is your phone lagging? Try these simple tricks to boost performance instantly.',
      date: 'May 5, 2026',
      tag: 'Tips & Tricks',
      tone: 'violet',
      image: '/assets/cutouts/battery-repair.png',
    },
    {
      slug: 'camera-not-working-quick-fix-guide',
      title: 'Camera Not Working? Quick Fix Guide',
      copy: 'Blurry or broken camera? Learn how to troubleshoot and fix camera issues.',
      date: 'May 2, 2026',
      tag: 'Repair Guide',
      tone: 'orange',
      image: '/assets/cutouts/iphone.png',
    },
    {
      slug: 'water-damage-repair-what-you-must-do-first',
      title: 'Water Damage Repair: What You Must Do First',
      copy: 'Dropped your phone in water? Follow these steps immediately to save it.',
      date: 'Apr 28, 2026',
      tag: 'News',
      tone: 'pink',
      image: '/assets/cutouts/screen-repair.png',
    },
    {
      slug: 'best-ways-to-protect-your-phone-screen',
      title: 'Best Ways to Protect Your Phone Screen',
      copy: 'Avoid costly repairs with these simple tips to protect your screen.',
      date: 'Apr 25, 2026',
      tag: 'Tips & Tricks',
      tone: 'violet',
      image: '/assets/cutouts/screen-repair.png',
    },
    {
      slug: 'why-fast-charging-damages-your-battery',
      title: 'Why Fast Charging Damages Your Battery',
      copy: 'Is fast charging safe? Learn how it affects your battery lifespan.',
      date: 'Apr 22, 2026',
      tag: 'Guides',
      tone: 'green',
      image: '/assets/cutouts/battery-repair.png',
    },
    {
      slug: 'tablet-not-charging-try-these-fixes',
      title: 'Tablet Not Charging? Try These Fixes',
      copy: 'Tablet will not charge? Here are common causes and easy solutions.',
      date: 'Apr 18, 2026',
      tag: 'Repair Guide',
      tone: 'orange',
      image: '/assets/cutouts/ipad-repair.png',
    },
    {
      slug: 'signs-your-device-needs-professional-repair',
      title: 'Signs Your Device Needs Professional Repair',
      copy: 'Not sure if your device needs repair? These warning signs will help.',
      date: 'Apr 15, 2026',
      tag: 'News',
      tone: 'pink',
      image: '/assets/cutouts/fix-it.png',
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

  readonly popularTags = ['iPhone Repair', 'Battery Tips', 'Screen Repair', 'Laptop Fix', 'Camera Repair', 'Tablet Repair', 'Device Care', 'Tech Tips'];
}
