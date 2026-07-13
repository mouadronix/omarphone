import { Component, inject, signal } from '@angular/core';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import { ContentService } from '../../services/content.service';

type ReviewTone = 'violet' | 'blue' | 'pink' | 'green' | 'orange' | 'cyan';

type Review = {
  name: string;
  date: string;
  copy: string;
  stars: string;
  service: string;
  icon: string;
  tone: ReviewTone;
  avatar: string;
};

type ReviewStat = {
  value: string;
  label: string;
  copy: string;
  icon: string;
  tone: ReviewTone;
};

@Component({
  selector: 'app-reviews-page',
  imports: [UiIconComponent],
  templateUrl: './reviews-page.component.html',
  styleUrl: './reviews-page.component.css',
})
export class ReviewsPageComponent {
  private readonly contentService = inject(ContentService);
  readonly selectedRating = signal(0);

  readonly stats: ReviewStat[] = [
    { value: '4.7', label: 'Average Rating', copy: 'Based on 23 Google reviews', icon: 'shield', tone: 'violet' },
    { value: '23', label: 'Google Reviews', copy: 'Real Omar Phone customers', icon: 'message-circle', tone: 'pink' },
    { value: '20', label: '5-Star Reviews', copy: 'Customers recommend Omar Phone', icon: 'star', tone: 'blue' },
    { value: '3 mo', label: 'Recent Feedback', copy: 'Latest public review activity', icon: 'clock', tone: 'orange' },
  ];

  readonly reviews: Review[] = [
    {
      name: 'reda salhaoui',
      date: '3 mesi fa',
      copy: 'Negozio ben fornito, personale disponibile e competente. Ottimo il servizio di riparazione: ho risparmiato evitando di cambiare telefono. Consigliato!',
      stars: '★★★★★',
      service: 'Google Maps Review',
      icon: 'smartphone',
      tone: 'violet',
      avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjXNlvlFr5WY2kzyfCL16rSjYjqK68Cg9DtnSXTm4KNmDqqLJhk=w96-h96-p-rp-mo-br100',
    },
    {
      name: 'mohamed arjdal',
      date: '3 mesi fa',
      copy: 'Omar e suo fratello sono due veri professionisti: gentili, preparati e sempre disponibili con i clienti.',
      stars: '★★★★★',
      service: 'Google Maps Review',
      icon: 'laptop',
      tone: 'pink',
      avatar: 'https://lh3.googleusercontent.com/a/ACg8ocK_ISa5ZG712AeceHfgAacWkCKcdTp1RmJPrBx-BkrmWEr42A=w96-h96-p-rp-mo-br100',
    },
    {
      name: 'Marco Goria',
      date: '2 anni fa',
      copy: 'Buona scelta di cellulari e apparecchiature elettroniche per tutti i gusti ed esigenze. Effettuano anche riparazioni a prezzi più che onesti.',
      stars: '★★★★★',
      service: 'Local Guide Review',
      icon: 'battery',
      tone: 'blue',
      avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjUeJpgE3I3g_z5S7Bo8Ha-a2BS0JGt1qbWatb54ZiHrACS67O4=w96-h96-p-rp-mo-ba4-br100',
    },
    {
      name: 'trova il mio dispositivo',
      date: '9 mesi fa',
      copy: 'Molto bravo e veloce, prodotti di ottima qualità, ve lo consiglio.',
      stars: '★★★★★',
      service: 'Google Maps Review',
      icon: 'tablet',
      tone: 'cyan',
      avatar: 'https://lh3.googleusercontent.com/a/ACg8ocIAWmXNdYEIte07kxF82ZvOdaAKV0PEFLKYWSSvPJGeL-ekxA=w96-h96-p-rp-mo-br100',
    },
    {
      name: 'Bella Chiocciola',
      date: '3 anni fa',
      copy: 'Recensione critica da Google Maps. La manteniamo visibile per trasparenza insieme alle recensioni positive.',
      stars: '★☆☆☆☆',
      service: 'Google Maps Review',
      icon: 'water',
      tone: 'orange',
      avatar: 'https://lh3.googleusercontent.com/a/ACg8ocKrD4ft_Sx6kCY_vrDh0YwWC_qqjVtkjoQ001-YwkNrnuVOqw=w96-h96-p-rp-mo-ba2-br100',
    },
    {
      name: 'Khalid',
      date: 'un anno fa',
      copy: 'Bravissimi. Mi hanno riparato un telefono che altri mi avevano detto essere irreparabile.',
      stars: '★★★★★',
      service: 'Phone Repair Review',
      icon: 'tools',
      tone: 'green',
      avatar: 'https://lh3.googleusercontent.com/a/ACg8ocLslJ9xZwwrtzOP7ag8ZCRhykH6DfNRlPz5-QlzZAbBwwsfSg=w96-h96-p-rp-mo-br100',
    },
    {
      name: 'Ibra Ndiaye',
      date: '4 anni fa',
      copy: 'Personale molto gentile e professionale. Mi hanno riparato il cellulare che non caricava in pochissimo tempo. Prezzi super accessibili.',
      stars: '★★★★★',
      service: 'Charging Repair Review',
      icon: 'battery',
      tone: 'pink',
      avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjVY34fl-_GqXqsm0DplmXaMasQop9vJMF7B_WtuqkahCSqjz43YaQ=w96-h96-p-rp-mo-ba5-br100',
    },
    {
      name: 'Vaskeシ',
      date: '9 mesi fa',
      copy: 'Telefoni, tablet, tutto. Ha aggiustato anche l’impossibile.',
      stars: '★★★★★',
      service: 'Device Repair Review',
      icon: 'tablet',
      tone: 'blue',
      avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjVDWaUmEwCZPMoO8BrQap348R4fG-z82UQ6IEmVa6wUGnOq5lE=w96-h96-p-rp-mo-br100',
    },
    {
      name: 'kri',
      date: '9 mesi fa',
      copy: 'Molto bravo, ve lo consiglio.',
      stars: '★★★★★',
      service: 'Google Maps Review',
      icon: 'badge',
      tone: 'cyan',
      avatar: '',
    },
    {
      name: 'Roberta Petroni',
      date: '7 anni fa',
      copy: 'Personale gentilissimo e competente. Hanno rimesso a posto il mio smartphone e la spesa per la riparazione è stata bassa.',
      stars: '★★★★★',
      service: 'Smartphone Repair Review',
      icon: 'smartphone',
      tone: 'violet',
      avatar: '',
    },
    {
      name: 'Alberto Pelizzari',
      date: '3 anni fa',
      copy: 'Omar è una persona meravigliosa e, insieme al fratello, sono due grandissimi professionisti.',
      stars: '★★★★★',
      service: 'Google Maps Review',
      icon: 'users',
      tone: 'green',
      avatar: '',
    },
    {
      name: 'ALESSIO TALARICO',
      date: '3 anni fa',
      copy: 'Bravissimi e onesti sul lavoro.',
      stars: '★★★★★',
      service: 'Google Maps Review',
      icon: 'shield',
      tone: 'orange',
      avatar: '',
    },
    {
      name: 'Mohamed Rizk',
      date: '5 anni fa',
      copy: 'احسن الناس الخلاص في العمال سرا النجاجabo.k.f',
      stars: '★★★★★',
      service: 'Google Maps Review',
      icon: 'star',
      tone: 'blue',
      avatar: '',
    },
    {
      name: 'LORENZO RUSSO',
      date: '3 settimane fa',
      copy: 'Mi hanno sistemato il telefono, aggiustandomi l’ingresso USB-C per la ricarica. Lavoro veloce e prezzo più che onesto.',
      stars: '★★★★★',
      service: 'Charging Port Repair',
      icon: 'zap',
      tone: 'pink',
      avatar: '',
    },
    {
      name: 'Daniele Palmisano',
      date: '2 mesi fa',
      copy: 'Ho portato il mio iPhone 12 dopo un incidente: Omar è stato meraviglioso e mi ha aiutato quando il telefono mi serviva subito.',
      stars: '★★★★★',
      service: 'iPhone Repair Review',
      icon: 'smartphone',
      tone: 'violet',
      avatar: '',
    },
    {
      name: 'Dalibor Vrhovac “KIVI”',
      date: '6 anni fa',
      copy: 'Ampia scelta di telefoni e apparecchiature.',
      stars: '★★★★★',
      service: 'Local Guide Review',
      icon: 'grid',
      tone: 'cyan',
      avatar: '',
    },
    {
      name: 'IBRAHIM MERZA',
      date: '4 anni fa',
      copy: 'Prezzi più bassi... maggiore affidabilità.',
      stars: '★★★★★',
      service: 'Google Maps Review',
      icon: 'credit-card',
      tone: 'green',
      avatar: '',
    },
    {
      name: 'Christian Onoragbon',
      date: '9 mesi fa',
      copy: '5-star rating on Google Maps.',
      stars: '★★★★★',
      service: 'Google Maps Rating',
      icon: 'star',
      tone: 'orange',
      avatar: '',
    },
    {
      name: 'Rosetta D’Agostino',
      date: '4 anni fa',
      copy: '5-star rating on Google Maps.',
      stars: '★★★★★',
      service: 'Google Maps Rating',
      icon: 'star',
      tone: 'pink',
      avatar: '',
    },
    {
      name: 'Samir Layoudi',
      date: '4 anni fa',
      copy: '5-star rating on Google Maps.',
      stars: '★★★★★',
      service: 'Google Maps Rating',
      icon: 'star',
      tone: 'blue',
      avatar: '',
    },
    {
      name: 'Ali Nagah',
      date: '5 anni fa',
      copy: '5-star rating on Google Maps.',
      stars: '★★★★★',
      service: 'Google Maps Rating',
      icon: 'star',
      tone: 'violet',
      avatar: '',
    },
    {
      name: 'Lucal guida Local guida',
      date: '6 anni fa',
      copy: '3-star rating on Google Maps.',
      stars: '★★★☆☆',
      service: 'Local Guide Rating',
      icon: 'star',
      tone: 'cyan',
      avatar: '',
    },
    {
      name: 'Myke _',
      date: '6 anni fa',
      copy: '4-star rating on Google Maps.',
      stars: '★★★★☆',
      service: 'Google Maps Rating',
      icon: 'camera',
      tone: 'orange',
      avatar: '',
    },
  ];

  readonly helpPerks = [
    'Share your experience',
    'Help others make informed decisions',
    'It only takes a minute',
  ];

  constructor() {
    this.stats.splice(0);
    this.reviews.splice(0);
    void this.loadBackendContent();
  }

  private async loadBackendContent(): Promise<void> {
    const content = await this.contentService.load();
    if (Array.isArray(content?.reviews?.stats)) {
      this.stats.splice(0, this.stats.length, ...(content.reviews.stats as ReviewStat[]));
    }
    if (Array.isArray(content?.reviews?.reviews)) {
      this.reviews.splice(0, this.reviews.length, ...(content.reviews.reviews as Review[]));
    }
  }

  setRating(value: number): void {
    this.selectedRating.set(value);
  }

  reviewerInitials(name: string): string {
    return name
      .replace(/[“”"_]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
}
