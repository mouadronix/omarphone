import { Component } from '@angular/core';
import { UiIconComponent } from '../ui-icon/ui-icon.component';

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
}
