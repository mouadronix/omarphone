import { Component, computed, inject, signal } from '@angular/core';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import { ContentService } from '../../services/content.service';

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

type FaqItem = {
  question: string;
  answer: string;
};

@Component({
  selector: 'app-support-center-page',
  imports: [UiIconComponent],
  templateUrl: './support-center-page.component.html',
  styleUrl: './support-center-page.component.css',
})
export class SupportCenterPageComponent {
  private readonly contentService = inject(ContentService);
  readonly supportQuery = signal('');
  readonly chatDraft = signal('');
  readonly contentRevision = signal(0);

  readonly faqs: FaqItem[] = [
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
      answer: 'Absolutely. Book a repair or visit our store and we will confirm a free quote before starting.',
    },
  ];

  readonly quickActions: SupportItem[] = [
    { title: 'Track Your Repair', copy: 'Send your repair ID to support', icon: 'box', tone: 'violet', href: 'https://wa.me/212612345678' },
    { title: 'Free Repair Quote', copy: 'Ask for a diagnosis', icon: 'message-circle', tone: 'blue', href: '/book' },
    { title: 'Device Health Check', copy: 'Check your device status', icon: 'activity', tone: 'orange', href: '/book' },
    { title: 'Book a Repair', copy: 'Schedule an appointment', icon: 'calendar', tone: 'pink', href: '/book' },
  ];

  readonly contactInfo: SupportItem[] = [
    { title: '+212 6 12 34 56 78', copy: 'Mon - Sat : 9:00 AM - 7:00 PM', icon: 'phone', tone: 'violet', href: 'tel:+212612345678' },
    { title: 'hello@omarphone.com', copy: 'We reply within 15 minutes', icon: 'mail', tone: 'violet', href: 'mailto:hello@omarphone.com' },
    { title: '123 Tech Avenue', copy: 'Casablanca, 20000 Morocco', icon: 'map-pin', tone: 'violet', href: 'https://maps.google.com' },
  ];

  readonly helpChannels: SupportItem[] = [
    { title: 'Email Support', copy: 'Send us an email and we will get back to you.', icon: 'mail', tone: 'violet', href: 'mailto:hello@omarphone.com' },
    { title: 'WhatsApp', copy: 'Chat with us on WhatsApp.', icon: 'message-circle', tone: 'green', href: 'https://wa.me/212612345678' },
    { title: 'Messenger', copy: 'Message us on Facebook.', icon: 'message-circle', tone: 'blue', href: 'https://m.me/omarphone' },
    { title: 'Call Us', copy: 'Speak directly with our support team.', icon: 'phone', tone: 'orange', href: 'tel:+212612345678' },
  ];

  readonly chatMessages: ChatMessage[] = [
    { from: 'agent', text: 'Hi! How can we help you today?', time: '10:30 AM' },
    { from: 'user', text: 'I want to know the status of my repair.', time: '10:31 AM' },
    { from: 'agent', text: 'Sure! Please share your repair ID.', time: '10:31 AM' },
  ];

  readonly liveChatMessages = signal<ChatMessage[]>(this.chatMessages);

  readonly trustItems: SupportItem[] = [
    { title: 'Fast Response', copy: 'We reply within minutes', icon: 'zap', tone: 'pink', href: '/support-center' },
    { title: 'Expert Support', copy: 'Trained & friendly agents', icon: 'user', tone: 'violet', href: '/support-center' },
    { title: 'Secure & Private', copy: 'Your data is always safe', icon: 'lock', tone: 'pink', href: '/support-center' },
    { title: 'Satisfaction Guaranteed', copy: 'We are here until you are happy', icon: 'star', tone: 'violet', href: '/support-center' },
  ];

  readonly filteredFaqs = computed(() => {
    this.contentRevision();
    const query = this.supportQuery().trim().toLowerCase();
    if (!query) {
      return this.faqs;
    }

    return this.faqs.filter((faq) => `${faq.question} ${faq.answer}`.toLowerCase().includes(query));
  });

  constructor() {
    this.faqs.splice(0);
    this.quickActions.splice(0);
    this.contactInfo.splice(0);
    void this.loadBackendContent();
  }

  private async loadBackendContent(): Promise<void> {
    const content = await this.contentService.load();
    if (Array.isArray(content?.support?.faqs)) {
      this.faqs.splice(0, this.faqs.length, ...(content.support.faqs as FaqItem[]));
    }
    if (Array.isArray(content?.support?.quickActions)) {
      const actions = (content.support.quickActions as SupportItem[]).map((action) =>
        action.href === '/admin'
          ? { ...action, copy: 'Send your repair ID to support', href: 'https://wa.me/212612345678' }
          : action
      );
      this.quickActions.splice(0, this.quickActions.length, ...actions);
    }
    if (Array.isArray(content?.support?.contactInfo)) {
      this.contactInfo.splice(0, this.contactInfo.length, ...(content.support.contactInfo as SupportItem[]));
    }
    this.contentRevision.update((value) => value + 1);
  }

  updateSupportQuery(value: string): void {
    this.supportQuery.set(value);
  }

  clearSupportQuery(event: Event): void {
    event.preventDefault();
    this.supportQuery.set('');
  }

  updateChatDraft(value: string): void {
    this.chatDraft.set(value);
  }

  sendChatMessage(): void {
    const text = this.chatDraft().trim();
    if (!text) {
      return;
    }

    const time = new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    this.liveChatMessages.update((messages) => [
      ...messages,
      { from: 'user', text, time },
      { from: 'agent', text: 'Thanks. Our support team will review this and reply as soon as possible.', time },
    ]);
    this.chatDraft.set('');
  }
}
