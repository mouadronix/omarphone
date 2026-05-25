import { Component, ViewEncapsulation, computed, signal } from '@angular/core';
import { UiIconComponent } from './components/ui-icon/ui-icon.component';
import { BeforeAfterPage } from './pages/before-after-page/before-after.page';
import { BlogDetailPageComponent } from './pages/blog-detail-page/blog-detail-page.component';
import { BlogsPageComponent } from './pages/blogs-page/blogs-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { NotFoundPage } from './pages/not-found-page/not-found.page';
import { ServicesPageComponent } from './pages/services-page/services-page.component';
import { SupportCenterPageComponent } from './pages/support-center-page/support-center-page.component';

type Theme = 'light' | 'dark';

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


type BookDevice = {
  name: string;
  image: string;
  tone: string;
};

type RepairIssue = {
  title: string;
  copy: string;
  icon: string;
  tone: string;
};

type ServiceOption = {
  title: string;
  copy: string;
  icon: string;
  tone: string;
  recommended?: boolean;
};

type BookingSelection = {
  deviceName: string | null;
  issueTitle: string | null;
  serviceTitle: string | null;
};

type PricingOption = {
  title: string;
  fee: string;
  copy: string;
  icon: string;
  tone: string;
  eta: string;
  popular?: boolean;
  perks: string[];
};

type Technician = {
  name: string;
  role: string;
  experience: string;
  credential: string;
  copy: string;
  tone: string;
  avatar: string;
  specs: string[];
  certs: string[];
  rating: string;
  reviews: string;
  repairs: string;
  languages: string;
};


@Component({
  selector: 'app-root',
  imports: [BeforeAfterPage, BlogDetailPageComponent, BlogsPageComponent, HomePageComponent, NotFoundPage, ServicesPageComponent, SupportCenterPageComponent, UiIconComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
})
export class App {
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

  readonly bookDevices: BookDevice[] = [
    { name: 'iPhone 17 Pro Max', image: '/images/phones/apple/iphone-17-pro-max.png', tone: 'violet' },
    { name: 'iPhone 17 Pro', image: '/images/phones/apple/iphone-17-pro.png', tone: 'blue' },
    { name: 'iPhone 17', image: '/images/phones/apple/iphone-17.png', tone: 'pink' },
    { name: 'iPhone 17e', image: '/images/phones/apple/iphone-17e.png', tone: 'green' },
    { name: 'iPhone Air', image: '/images/phones/apple/iphone-air.png', tone: 'orange' },
    { name: 'iPhone 16 Pro Max', image: '/images/phones/apple/iphone-16-pro-max.png', tone: 'cyan' },
    { name: 'iPhone 16 Pro', image: '/images/phones/apple/iphone-16-pro.png', tone: 'violet' },
    { name: 'iPhone 16 Plus', image: '/images/phones/apple/iphone-16-plus.png', tone: 'blue' },
    { name: 'iPhone 16', image: '/images/phones/apple/iphone-16.png', tone: 'pink' },
    { name: 'iPhone 16e', image: '/images/phones/apple/iphone-16e.png', tone: 'green' },
    { name: 'iPhone 15 Pro Max', image: '/images/phones/apple/iphone-15-pro-max.png', tone: 'orange' },
    { name: 'iPhone 15 Pro', image: '/images/phones/apple/iphone-15-pro.png', tone: 'cyan' },
    { name: 'iPhone 15 Plus', image: '/images/phones/apple/iphone-15-plus.png', tone: 'violet' },
    { name: 'iPhone 15', image: '/images/phones/apple/iphone-15.png', tone: 'blue' },
    { name: 'iPhone 14 Pro Max', image: '/images/phones/apple/iphone-14-pro-max.png', tone: 'pink' },
    { name: 'iPhone 14 Pro', image: '/images/phones/apple/iphone-14-pro.png', tone: 'green' },
    { name: 'iPhone 14 Plus', image: '/images/phones/apple/iphone-14-plus.png', tone: 'orange' },
    { name: 'iPhone 14', image: '/images/phones/apple/iphone-14.png', tone: 'cyan' },
    { name: 'iPhone 13 Pro Max', image: '/images/phones/apple/iphone-13-pro-max.png', tone: 'violet' },
    { name: 'iPhone 13 Pro', image: '/images/phones/apple/iphone-13-pro.png', tone: 'blue' },
    { name: 'iPhone 13 Mini', image: '/images/phones/apple/iphone-13-mini.png', tone: 'pink' },
    { name: 'iPhone 13', image: '/images/phones/apple/iphone-13.png', tone: 'green' },
    { name: 'iPhone 12 Pro Max', image: '/images/phones/apple/iphone-12-pro-max.png', tone: 'orange' },
    { name: 'iPhone 12 Pro', image: '/images/phones/apple/iphone-12-pro.png', tone: 'cyan' },
    { name: 'iPhone 12 Mini', image: '/images/phones/apple/iphone-12-mini.png', tone: 'violet' },
    { name: 'iPhone 12', image: '/images/phones/apple/iphone-12.png', tone: 'blue' },
    { name: 'iPhone 11 Pro Max', image: '/images/phones/apple/iphone-11-pro-max.png', tone: 'pink' },
    { name: 'iPhone 11 Pro', image: '/images/phones/apple/iphone-11-pro.png', tone: 'green' },
    { name: 'iPhone 11', image: '/images/phones/apple/iphone-11.png', tone: 'orange' },
    { name: 'iPhone SE 2022', image: '/images/phones/apple/iphone-se-2022.png', tone: 'cyan' },
    { name: 'iPhone SE 2020', image: '/images/phones/apple/iphone-se-2020.png', tone: 'violet' },
    { name: 'iPhone XS Max', image: '/images/phones/apple/iphone-xs-max.png', tone: 'blue' },
    { name: 'iPhone XS', image: '/images/phones/apple/iphone-xs.png', tone: 'pink' },
    { name: 'iPhone XR', image: '/images/phones/apple/iphone-xr.png', tone: 'green' },
    { name: 'iPhone X', image: '/images/phones/apple/iphone-x.png', tone: 'orange' },
    { name: 'iPhone 8 Plus', image: '/images/phones/apple/iphone-8-plus.png', tone: 'cyan' },
    { name: 'iPhone 8', image: '/images/phones/apple/iphone-8.png', tone: 'violet' },
    { name: 'iPhone 7 Plus', image: '/images/phones/apple/iphone-7-plus.png', tone: 'blue' },
    { name: 'iPhone 7', image: '/images/phones/apple/iphone-7.png', tone: 'pink' },
    { name: 'iPhone SE 1st Generation', image: '/images/phones/apple/iphone-se-1st-generation.png', tone: 'green' },
    { name: 'iPhone 6S Plus', image: '/images/phones/apple/iphone-6s-plus.png', tone: 'orange' },
    { name: 'iPhone 6S', image: '/images/phones/apple/iphone-6s.png', tone: 'cyan' },
    { name: 'iPhone 6 Plus', image: '/images/phones/apple/iphone-6-plus.png', tone: 'violet' },
    { name: 'iPhone 6', image: '/images/phones/apple/iphone-6.png', tone: 'blue' },
    { name: 'iPhone 5S', image: '/images/phones/apple/iphone-5s.png', tone: 'pink' },
    { name: 'iPhone 5C', image: '/images/phones/apple/iphone-5c.png', tone: 'green' },
    { name: 'iPhone 5', image: '/images/phones/apple/iphone-5.png', tone: 'orange' },
    { name: 'iPhone 4S', image: '/images/phones/apple/iphone-4s.png', tone: 'cyan' },
    { name: 'iPhone 4 Verizon', image: '/images/phones/apple/iphone-4-verizon.png', tone: 'violet' },
    { name: 'iPhone 4', image: '/images/phones/apple/iphone-4.png', tone: 'blue' },
    { name: 'iPhone 3GS', image: '/images/phones/apple/iphone-3gs.png', tone: 'pink' },
    { name: 'iPhone 3G', image: '/images/phones/apple/iphone-3g.png', tone: 'green' },
    { name: 'iPhone 1st Generation', image: '/images/phones/apple/iphone-1st-generation.png', tone: 'orange' },
    { name: 'iPhone Accessories', image: '/images/phones/apple/iphone-accessories.png', tone: 'cyan' },
  ];

  readonly deviceCategories = [
    ['All Devices', '54', 'grid'],
    ['Phones', '54', 'smartphone'],
    ['Laptops', '8', 'laptop'],
    ['Tablets', '2', 'tablet'],
    ['Smartwatches', '1', 'watch'],
  ];

  readonly phoneBrands = [['Apple', '54']];
  readonly laptopBrands = [
    ['Apple', 'Soon'],
    ['Dell', 'Soon'],
    ['HP', 'Soon'],
    ['Lenovo', 'Soon'],
    ['ASUS', 'Soon'],
    ['Acer', 'Soon'],
    ['Microsoft', 'Soon'],
    ['MSI', 'Soon'],
  ];

  readonly repairIssues: RepairIssue[] = [
    { title: 'Screen Repair', copy: 'Cracked, broken or display issues', icon: 'smartphone', tone: 'violet' },
    { title: 'Battery Replacement', copy: 'Draining fast or not holding charge', icon: 'battery', tone: 'green' },
    { title: 'Charging Port', copy: 'Not charging or loose connection', icon: 'zap', tone: 'orange' },
    { title: 'Camera Repair', copy: 'Blurry photos or camera not working', icon: 'camera', tone: 'pink' },
    { title: 'Water Damage', copy: 'Liquid damage or device will not turn on', icon: 'water', tone: 'cyan' },
    { title: 'Back Glass Repair', copy: 'Cracked or broken back glass', icon: 'smartphone', tone: 'violet' },
    { title: 'Speaker / Mic', copy: 'No sound or low quality', icon: 'speaker', tone: 'orange' },
    { title: 'Software Issue', copy: 'System errors or performance issues', icon: 'settings', tone: 'blue' },
    { title: 'Other Issue', copy: 'Something else is not working', icon: 'dots', tone: 'violet' },
  ];

  readonly serviceOptions: ServiceOption[] = [
    { title: 'Walk-in Repair', copy: 'Visit our store and get your device repaired on the same day.', icon: 'home', tone: 'violet' },
    { title: 'Mail-in Repair', copy: 'Send us your device by mail and we will repair and return it.', icon: 'box', tone: 'blue' },
    { title: 'Pickup & Delivery', copy: 'We will pick up your device, repair it and deliver it back to you.', icon: 'truck', tone: 'orange', recommended: true },
  ];

  readonly pricingOptions: PricingOption[] = [
    {
      title: 'Express Repair',
      fee: '+$20',
      copy: 'Priority service with faster turnaround time. Get your device repaired as quickly as possible.',
      icon: 'rocket',
      tone: 'orange',
      eta: '30 - 60 Min',
      popular: true,
      perks: ['Priority in repair queue', 'Fastest turnaround time', 'Real-time repair updates', 'Quality parts & warranty'],
    },
    {
      title: 'Home Repair',
      fee: '+$15',
      copy: 'Our technician comes to your location and repairs your device on the spot.',
      icon: 'home',
      tone: 'violet',
      eta: '1 - 2 Hours',
      perks: ['On-site repair at your location', 'Convenient and hassle-free', 'Same-day service', 'Quality parts & warranty'],
    },
    {
      title: 'Mail-in Repair',
      fee: '+$0',
      copy: 'Send your device to us by mail and we will repair and ship it back to you.',
      icon: 'box',
      tone: 'blue',
      eta: '2 - 3 Days',
      perks: ['Free shipping both ways', 'Secure packaging provided', 'Detailed status updates', 'Quality parts & warranty'],
    },
  ];

  readonly pricingReasons = [
    { title: 'Different Convenience', copy: 'Each option offers a different level of convenience and speed to match your needs.', icon: 'user', tone: 'pink' },
    { title: 'Operational Costs', copy: 'Location, logistics, and handling affect the cost. We keep it fair and transparent.', icon: 'settings', tone: 'blue' },
    { title: 'Best Value Promise', copy: 'No matter which option you choose, you always get high-quality repair and genuine parts.', icon: 'badge', tone: 'orange' },
  ];

  readonly includedRepairs = [
    ['90-Day Warranty', 'On all repairs', 'shield'],
    ['Genuine Parts', '100% original', 'badge'],
    ['Expert Technicians', 'Certified professionals', 'users'],
    ['Quality Check', 'Before delivery', 'check'],
    ['Customer Support', '7/7 Support', 'headphones'],
  ];

  readonly technicians: Technician[] = [
    {
      name: 'Ali Hassan',
      role: 'Senior Technician',
      experience: '8 Years Experience',
      credential: 'Apple Certified Technician',
      copy: 'Specializes in advanced board-level repairs, Apple devices, and micro-soldering. Ali has repaired thousands of devices with precision and care.',
      tone: 'violet',
      avatar: 'ali',
      specs: ['iPhone Repair', 'Mac Repair', 'Board Repair', 'Micro Soldering', 'Data Recovery'],
      certs: ['Apple Certified Technician', 'Android Certification', 'IPC Specialist'],
      rating: '4.9',
      reviews: '320+ reviews',
      repairs: '2,500+',
      languages: 'EN, AR, FR',
    },
    {
      name: 'Youssef Benali',
      role: 'Senior Technician',
      experience: '6 Years Experience',
      credential: 'Certified Electronics Specialist',
      copy: 'Expert in screen repairs, battery replacements, and diagnostics. Youssef is known for his attention to detail and customer-first approach.',
      tone: 'orange',
      avatar: 'youssef',
      specs: ['Screen Repair', 'Battery Replacement', 'Diagnostics', 'Water Damage', 'Performance Tuning'],
      certs: ['Apple Technician', 'Samsung Certified', 'ESD Safe Technician'],
      rating: '4.8',
      reviews: '280+ reviews',
      repairs: '1,800+',
      languages: 'EN, AR',
    },
  ];

  readonly aboutStats = [
    ['10+', 'Years Average', 'Experience', 'star', 'pink'],
    ['10,000+', 'Devices Repaired', 'Successfully', 'smartphone', 'violet'],
    ['15+', 'Certifications', 'Earned', 'badge', 'green'],
    ['4.9/5', 'Average Customer', 'Rating', 'star', 'orange'],
  ];

  readonly brands = ['Apple', 'Samsung', 'Google', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Microsoft'];
  readonly trust = ['90-Day Warranty', 'Genuine Parts', 'Expert Technicians', 'Same Day Repair'];

  readonly theme = signal<Theme>(this.getPreferredTheme());
  readonly path = signal(this.getPath());
  readonly selectedBookDeviceName = signal<string | null>(this.getSavedBookingSelection().deviceName);
  readonly selectedRepairIssueTitle = signal<string | null>(this.getSavedBookingSelection().issueTitle);
  readonly selectedServiceOptionTitle = signal<string | null>(this.getSavedBookingSelection().serviceTitle);
  readonly selectedBookDevice = computed(() => this.bookDevices.find((device) => device.name === this.selectedBookDeviceName()) ?? null);
  readonly selectedRepairIssue = computed(() => this.repairIssues.find((issue) => issue.title === this.selectedRepairIssueTitle()) ?? null);
  readonly selectedServiceOption = computed(() => this.serviceOptions.find((option) => option.title === this.selectedServiceOptionTitle()) ?? null);
  readonly selectedIssuePrice = computed(() => this.getIssuePrice(this.selectedRepairIssue()?.title));
  readonly selectedServiceFee = computed(() => this.getServiceFee(this.selectedServiceOption()?.title));
  readonly selectedTotalPrice = computed(() => this.selectedIssuePrice() + this.selectedServiceFee());
  readonly selectedEta = computed(() => this.getEstimatedTime(this.selectedServiceOption()?.title));
  readonly canContinueBooking = computed(() => !!this.selectedBookDevice() && !!this.selectedRepairIssue() && !!this.selectedServiceOption());
  readonly isDark = computed(() => this.theme() === 'dark');
  readonly isHome = computed(() => this.path() === '/' || this.path() === '');
  readonly isBlogs = computed(() => this.path() === '/blogs');
  readonly isBlogDetail = computed(() => this.path().startsWith('/blogs/') && this.path().split('/').filter(Boolean).length === 2);
  readonly isServices = computed(() => this.path() === '/services');
  readonly isBook = computed(() => this.path() === '/book');
  readonly isDetails = computed(() => this.path() === '/details');
  readonly isBeforeAfter = computed(() => this.path() === '/before-after');
  readonly isPricing = computed(() => this.path() === '/pricing');
  readonly isAbout = computed(() => this.path() === '/about');
  readonly isSupportCenter = computed(() => this.path() === '/support-center');

  constructor() {
    this.applyTheme(this.theme());
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => this.path.set(this.getPath()));
    }
  }

  toggleTheme(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.applyTheme(next);
  }

  selectBookDevice(device: BookDevice): void {
    this.selectedBookDeviceName.set(device.name);
    this.saveBookingSelection();
  }

  selectRepairIssue(issue: RepairIssue): void {
    this.selectedRepairIssueTitle.set(issue.title);
    this.saveBookingSelection();
  }

  selectServiceOption(option: ServiceOption): void {
    this.selectedServiceOptionTitle.set(option.title);
    this.saveBookingSelection();
  }

  continueToDetails(event: Event): void {
    if (!this.canContinueBooking()) {
      event.preventDefault();
      return;
    }

    this.saveBookingSelection();
  }

  private getSavedBookingSelection(): BookingSelection {
    if (typeof localStorage === 'undefined') {
      return { deviceName: null, issueTitle: null, serviceTitle: null };
    }

    try {
      const rawSelection = localStorage.getItem('omarphone-booking-selection');
      if (!rawSelection) {
        return { deviceName: null, issueTitle: null, serviceTitle: null };
      }

      const selection = JSON.parse(rawSelection) as Partial<BookingSelection>;
      return {
        deviceName: selection.deviceName ?? null,
        issueTitle: selection.issueTitle ?? null,
        serviceTitle: selection.serviceTitle ?? null,
      };
    } catch {
      return { deviceName: null, issueTitle: null, serviceTitle: null };
    }
  }

  private saveBookingSelection(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const selection: BookingSelection = {
      deviceName: this.selectedBookDeviceName(),
      issueTitle: this.selectedRepairIssueTitle(),
      serviceTitle: this.selectedServiceOptionTitle(),
    };

    localStorage.setItem('omarphone-booking-selection', JSON.stringify(selection));
  }

  private getIssuePrice(title?: string): number {
    const prices: Record<string, number> = {
      'Screen Repair': 79,
      'Battery Replacement': 49,
      'Charging Port': 59,
      'Camera Repair': 69,
      'Water Damage': 99,
      'Back Glass Repair': 89,
      'Speaker / Mic': 59,
      'Software Issue': 49,
      'Other Issue': 0,
    };

    return title ? prices[title] ?? 0 : 0;
  }

  private getServiceFee(title?: string): number {
    const fees: Record<string, number> = {
      'Walk-in Repair': 0,
      'Mail-in Repair': 0,
      'Pickup & Delivery': 10,
    };

    return title ? fees[title] ?? 0 : 0;
  }

  private getEstimatedTime(title?: string): string {
    const times: Record<string, string> = {
      'Walk-in Repair': '1 - 2 Hours',
      'Mail-in Repair': '2 - 3 Days',
      'Pickup & Delivery': '24 - 48 Hours',
    };

    return title ? times[title] ?? '-' : '-';
  }

  private getPreferredTheme(): Theme {
    if (typeof window === 'undefined') {
      return 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private getPath(): string {
    if (typeof window === 'undefined') {
      return '/';
    }

    return window.location.pathname;
  }

  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.dataset['theme'] = theme;
  }
}
