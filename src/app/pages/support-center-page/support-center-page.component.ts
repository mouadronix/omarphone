import { Component } from '@angular/core';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

type Tone = 'violet' | 'blue' | 'orange' | 'pink' | 'green' | 'cyan';

type SupportItem = {
  title: string;
  copy: string;
  icon: string;
  tone: Tone;
  href: string;
};

type ChatMessage = {
  text: string;
  time: string;
  from: 'agent' | 'user';
};

@Component({
  selector: 'app-support-center-page',
  imports: [UiIconComponent],
  templateUrl: './support-center-page.component.html',
  styleUrl: './support-center-page.component.css',
})
export class SupportCenterPageComponent {
  readonly faqs = [
    {
      question: 'How long does a typical repair take?',
      answer: 'Most repairs are completed within 30 minutes to 2 hours depending on the issue.',
    },
    {
      question: 'Do you offer warranty on repairs?',
      answer: 'Yes. All our repairs come with a warranty. Duration depends on the type of repair.',
    },
    {
      question: 'How can I track my repair status?',
      answer: 'You can track your repair in real-time using our Track Repair page.',
    },
    {
      question: 'Do I need to book an appointment?',
      answer: 'Walk-ins are welcome, but booking an appointment saves your time.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept cash, all major credit/debit cards, and digital payments.',
    },
    {
      question: 'Can I get a quote before the repair?',
      answer: 'Absolutely. Use our Price Calculator or visit our store for a free quote.',
    },
  ];

  readonly quickActions: SupportItem[] = [
    { title: 'Track Your Repair', copy: 'Check real-time status', icon: 'box', tone: 'violet', href: '/details' },
    { title: 'Repair Price Calculator', copy: 'Get an instant estimate', icon: 'calculator', tone: 'blue', href: '/pricing' },
    { title: 'Device Health Check', copy: 'Check your device status', icon: 'activity', tone: 'orange', href: '/book' },
    { title: 'Book a Repair', copy: 'Schedule an appointment', icon: 'calendar', tone: 'pink', href: '/book' },
  ];

  readonly contactInfo: SupportItem[] = [
    { title: '+1 (555) 987-1234', copy: 'Mon - Sun : 9:00 AM - 8:00 PM', icon: 'phone', tone: 'violet', href: 'tel:+15559871234' },
    { title: 'support@omarphone.com', copy: 'We reply within 15 minutes', icon: 'mail', tone: 'violet', href: 'mailto:support@omarphone.com' },
    { title: '123 Tech Street, Suite 100', copy: 'New York, NY 10001, USA', icon: 'map-pin', tone: 'violet', href: 'https://maps.google.com' },
  ];

  readonly helpChannels: SupportItem[] = [
    { title: 'Email Support', copy: 'Send us an email and we will get back to you.', icon: 'mail', tone: 'violet', href: 'mailto:support@omarphone.com' },
    { title: 'WhatsApp', copy: 'Chat with us on WhatsApp.', icon: 'message-circle', tone: 'green', href: 'https://wa.me/15559871234' },
    { title: 'Messenger', copy: 'Message us on Facebook.', icon: 'message-circle', tone: 'blue', href: 'https://m.me/omarphone' },
    { title: 'Call Us', copy: 'Speak directly with our support team.', icon: 'phone', tone: 'orange', href: 'tel:+15559871234' },
  ];

  readonly chatMessages: ChatMessage[] = [
    { from: 'agent', text: 'Hi! How can we help you today?', time: '10:30 AM' },
    { from: 'user', text: 'I want to know the status of my repair.', time: '10:31 AM' },
    { from: 'agent', text: 'Sure! Please share your repair ID.', time: '10:31 AM' },
  ];

  readonly trustItems: SupportItem[] = [
    { title: 'Fast Response', copy: 'We reply within minutes', icon: 'zap', tone: 'pink', href: '/support-center' },
    { title: 'Expert Support', copy: 'Trained & friendly agents', icon: 'user', tone: 'violet', href: '/support-center' },
    { title: 'Secure & Private', copy: 'Your data is always safe', icon: 'lock', tone: 'pink', href: '/support-center' },
    { title: 'Satisfaction Guaranteed', copy: 'We are here until you are happy', icon: 'star', tone: 'violet', href: '/support-center' },
  ];
}
