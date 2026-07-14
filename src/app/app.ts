import { AfterViewInit, Component, OnDestroy, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { UiIconComponent } from './components/ui-icon/ui-icon.component';
import { BeforeAfterPage } from './pages/before-after-page/before-after.page';
import { BlogDetailPageComponent } from './pages/blog-detail-page/blog-detail-page.component';
import { BlogsPageComponent } from './pages/blogs-page/blogs-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { NotFoundPage } from './pages/not-found-page/not-found.page';
import { ReviewsPageComponent } from './pages/reviews-page/reviews-page.component';
import { ServicesPageComponent } from './pages/services-page/services-page.component';
import { SupportCenterPageComponent } from './pages/support-center-page/support-center-page.component';
import { Language } from './data/translations';
import { ContentResource, ContentResourceRow, ContentSection, ContentService } from './services/content.service';
import { TranslationService } from './services/translation.service';

type Theme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'omarphone-theme';
const ADMIN_SESSION_STORAGE_KEY = 'omarphone-admin-session';
const ADMIN_WHATSAPP_NUMBER = '393298571129';

function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return '/api';
  }

  const host = window.location.hostname;
  const isLocal = host === '127.0.0.1' || host === 'localhost';
  if (isLocal) {
    return 'http://127.0.0.1:4301/api';
  }

  return '/api';
}

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
  key: string;
  title: string;
  copy: string;
  icon: string;
  tone: string;
  image: string;
  availability: 'all' | 'modern-glass' | 'face-id' | 'legacy' | 'accessory';
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

type CustomerDetails = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  zip: string;
  addressNotes: string;
  date: string;
  timeSlot: string;
  notes: string;
  payment: string;
};

type BookingOrder = {
  id: string;
  createdAt: string;
  status: 'New' | 'In Review' | 'Confirmed';
  customer: {
    fullName: string;
    phone: string;
    email: string;
  };
  repair: {
    device: string;
    deviceImage: string;
    issue: string;
    service: string;
    eta: string;
    price: number;
    serviceFee: number;
    total: number;
  };
  schedule: {
    city: string;
    address: string;
    zip: string;
    addressNotes: string;
    date: string;
    timeSlot: string;
  };
  payment: string;
  notes: string;
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

type AdminMetric = {
  title: string;
  value: string;
  delta: string;
  icon: string;
  tone: string;
};

type AdminServiceStat = {
  title: string;
  count: number;
  percent: number;
  tone: string;
};

type AdminBlogPost = {
  slug: string;
  title: string;
  copy: string;
  date: string;
  tag: string;
  category: string;
  tags: string[];
  tone: string;
  image: string;
  author?: string;
  status?: 'Published' | 'Draft' | 'Scheduled' | 'Archived';
  views?: number;
  publishedAt?: string;
};

type AdminView = 'dashboard' | 'orders' | 'content' | 'blogs';


@Component({
  selector: 'app-root',
  imports: [BeforeAfterPage, BlogDetailPageComponent, BlogsPageComponent, HomePageComponent, NotFoundPage, ReviewsPageComponent, ServicesPageComponent, SupportCenterPageComponent, UiIconComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
})
export class App implements AfterViewInit, OnDestroy {
  private readonly translationService = inject(TranslationService);
  private readonly contentService = inject(ContentService);
  private translationObserver: MutationObserver | null = null;
  private translationFrame = 0;

  readonly services: Service[] = [];

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

  readonly testimonials: string[][] = [];

  readonly bookDevices: BookDevice[] = [];

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

  readonly repairIssues: RepairIssue[] = [];

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
  readonly currentLanguage = this.translationService.language;
  readonly isLanguageMenuOpen = signal(false);
  readonly languageOptions: { code: Language; label: string; short: string }[] = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'fr', label: 'Français', short: 'FR' },
    { code: 'it', label: 'Italiano', short: 'IT' },
  ];
  readonly languageButtonLabel = computed(() => this.languageOptions.find((option) => option.code === this.currentLanguage())?.short ?? 'EN');
  readonly path = signal(this.getPath());
  readonly lastBookingOrder = signal<BookingOrder | null>(this.getLastBookingOrder());
  readonly adminOrders = signal<BookingOrder[]>(this.getAdminOrders());
  readonly adminDataSource = signal<'api' | 'local'>('local');
  readonly adminSyncMessage = signal('Database ready');
  readonly adminLoginUsername = signal('');
  readonly adminLoginPassword = signal('');
  readonly adminLoginError = signal('');
  readonly isAdminUnlocked = signal(this.getAdminSession());
  readonly adminActiveView = signal<AdminView>('dashboard');
  readonly adminContentSections = signal<ContentSection[]>([]);
  readonly adminContentResources = signal<ContentResource[]>([]);
  readonly adminDeletedResourceRowIds = signal<(string | number)[]>([]);
  readonly selectedAdminContentKey = signal('home');
  readonly selectedAdminGroupKey = signal('');
  readonly adminContentDraft = signal<unknown>({});
  readonly adminContentJson = signal('');
  readonly adminContentMessage = signal('Content editor ready');
  readonly adminContentError = signal('');
  readonly adminBlogSearch = signal('');
  readonly adminBlogStatusFilter = signal<'All' | 'Published' | 'Draft' | 'Scheduled' | 'Archived'>('All');
  readonly adminBlogCategoryFilter = signal('All Categories');
  readonly adminBlogAuthorFilter = signal('All Authors');
  readonly selectedBookDeviceName = signal<string | null>(this.getSavedBookingSelection().deviceName);
  readonly selectedRepairIssueTitle = signal<string | null>(this.getSavedBookingSelection().issueTitle);
  readonly selectedServiceOptionTitle = signal<string | null>(this.getSavedBookingSelection().serviceTitle);
  readonly customerName = signal(this.getSavedCustomerDetails().fullName);
  readonly customerPhone = signal(this.getSavedCustomerDetails().phone);
  readonly customerEmail = signal(this.getSavedCustomerDetails().email);
  readonly customerCity = signal(this.getSavedCustomerDetails().city);
  readonly customerAddress = signal(this.getSavedCustomerDetails().address);
  readonly customerZip = signal(this.getSavedCustomerDetails().zip);
  readonly customerAddressNotes = signal(this.getSavedCustomerDetails().addressNotes);
  readonly customerDate = signal(this.getSavedCustomerDetails().date);
  readonly customerTimeSlot = signal(this.getSavedCustomerDetails().timeSlot);
  readonly customerNotes = signal(this.getSavedCustomerDetails().notes);
  readonly customerPayment = signal(this.getSavedCustomerDetails().payment || 'Pay Online');
  readonly selectedBookDevice = computed(() => this.bookDevices.find((device) => device.name === this.selectedBookDeviceName()) ?? null);
  readonly availableRepairIssues = computed(() => this.getRepairIssuesForDevice(this.selectedBookDevice()?.name));
  readonly selectedRepairIssue = computed(() => this.availableRepairIssues().find((issue) => issue.title === this.selectedRepairIssueTitle()) ?? null);
  readonly selectedServiceOption = computed(() => this.serviceOptions.find((option) => option.title === this.selectedServiceOptionTitle()) ?? null);
  readonly selectedIssuePrice = computed(() => this.getIssuePrice(this.selectedRepairIssue()?.title));
  readonly selectedServiceFee = computed(() => this.getServiceFee(this.selectedServiceOption()?.title));
  readonly selectedTotalPrice = computed(() => this.selectedIssuePrice() + this.selectedServiceFee());
  readonly selectedEta = computed(() => this.getEstimatedTime(this.selectedServiceOption()?.title));
  readonly canContinueToIssue = computed(() => !!this.selectedBookDevice());
  readonly canContinueToService = computed(() => !!this.selectedBookDevice() && !!this.selectedRepairIssue());
  readonly canContinueBooking = computed(() => !!this.selectedBookDevice() && !!this.selectedRepairIssue() && !!this.selectedServiceOption());
  readonly canConfirmBooking = computed(() =>
    this.canContinueBooking() &&
    !!this.customerName().trim() &&
    !!this.customerPhone().trim() &&
    !!this.customerEmail().trim() &&
    !!this.customerCity().trim() &&
    !!this.customerAddress().trim() &&
    !!this.customerDate().trim() &&
    !!this.customerTimeSlot().trim()
  );
  readonly isDark = computed(() => this.theme() === 'dark');
  readonly isHome = computed(() => this.path() === '/' || this.path() === '');
  readonly isBlogs = computed(() => this.path() === '/blogs');
  readonly isBlogDetail = computed(() => this.path().startsWith('/blogs/') && this.path().split('/').filter(Boolean).length === 2);
  readonly isServices = computed(() => this.path() === '/services');
  readonly isReviews = computed(() => this.path() === '/reviews');
  readonly isBook = computed(() => this.path() === '/book' || this.path() === '/book/issue' || this.path() === '/book/service');
  readonly isBookDevice = computed(() => this.path() === '/book');
  readonly isBookIssue = computed(() => this.path() === '/book/issue');
  readonly isBookService = computed(() => this.path() === '/book/service');
  readonly isDetails = computed(() => this.path() === '/details');
  readonly isBookingSuccess = computed(() => this.path() === '/booking-success');
  readonly isAdminDashboard = computed(() => this.path().toLowerCase() === '/admin');
  readonly isBeforeAfter = computed(() => this.path() === '/before-after');
  readonly isPricing = computed(() => false);
  readonly isAbout = computed(() => this.path() === '/about');
  readonly isSupportCenter = computed(() => this.path() === '/support-center');
  readonly adminPendingOrders = computed(() => this.adminOrders().filter((order) => order.status === 'New').length);
  readonly adminRevenue = computed(() => this.adminOrders().reduce((total, order) => total + order.repair.total, 0));
  readonly adminCompletedOrders = computed(() => this.adminOrders().filter((order) => order.status === 'Confirmed').length);
  readonly adminInProgressOrders = computed(() => this.adminOrders().filter((order) => order.status === 'In Review').length);
  readonly adminDashboardStats = computed<AdminMetric[]>(() => [
    { title: 'Total Orders', value: this.formatCompactNumber(this.adminOrders().length), delta: 'Live from database', icon: 'file-text', tone: 'violet' },
    { title: 'New Orders', value: this.formatCompactNumber(this.adminPendingOrders()), delta: 'Needs review', icon: 'clock', tone: 'blue' },
    { title: 'In Progress', value: this.formatCompactNumber(this.adminInProgressOrders()), delta: 'Being handled', icon: 'tools', tone: 'violet' },
    { title: 'Completed', value: this.formatCompactNumber(this.adminCompletedOrders()), delta: 'Confirmed jobs', icon: 'shield', tone: 'green' },
    { title: 'Content Sections', value: this.formatCompactNumber(this.adminContentSections().length), delta: 'Editable website data', icon: 'save', tone: 'orange' },
  ]);
  readonly adminRecentOrders = computed(() => this.adminOrders().slice(0, 5));
  readonly adminViewTitle = computed(() => {
    if (this.adminActiveView() === 'orders') {
      return 'Repair Orders';
    }

    if (this.adminActiveView() === 'content') {
      return `${this.selectedAdminContentKey()} Manager`;
    }

    if (this.adminActiveView() === 'blogs') {
      return 'Blogs';
    }

    return 'Dashboard';
  });
  readonly adminViewSubtitle = computed(() => {
    if (this.adminActiveView() === 'orders') {
      return 'Manage booking orders, customer details, and repair status.';
    }

    if (this.adminActiveView() === 'content') {
      return 'Edit public website sections, images, posts, services, reviews, and booking data.';
    }

    if (this.adminActiveView() === 'blogs') {
      return 'Create, manage, and organize your blog posts.';
    }

    return "Here's what's happening with your repair business today.";
  });
  readonly adminServiceStats = computed<AdminServiceStat[]>(() => {
    const orders = this.adminOrders();
    const counts = orders.reduce<Record<string, number>>((acc, order) => {
      acc[order.repair.issue] = (acc[order.repair.issue] ?? 0) + 1;
      return acc;
    }, {});
    const tones = ['violet', 'blue', 'orange', 'pink', 'green'];
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (!entries.length) {
      return [
        { title: 'Screen Replacement', count: 0, percent: 45, tone: 'violet' },
        { title: 'Battery Replacement', count: 0, percent: 25, tone: 'blue' },
        { title: 'Charging Port Repair', count: 0, percent: 15, tone: 'orange' },
        { title: 'Camera Repair', count: 0, percent: 10, tone: 'pink' },
        { title: 'Others', count: 0, percent: 5, tone: 'green' },
      ];
    }

    const total = entries.reduce((sum, [, count]) => sum + count, 0) || 1;
    return entries.map(([title, count], index) => ({
      title,
      count,
      percent: Math.round((count / total) * 100),
      tone: tones[index % tones.length],
    }));
  });
  readonly selectedAdminContentSection = computed(() =>
    this.adminContentSections().find((section) => section.key === this.selectedAdminContentKey()) ?? null
  );
  readonly adminContentGroups = computed(() => {
    const resources = this.adminContentResources().filter((resource) => resource.section === this.selectedAdminContentKey());
    if (resources.length) {
      const draft = this.adminContentDraft();
      const record = draft && !Array.isArray(draft) && typeof draft === 'object' ? draft as Record<string, unknown> : {};
      return resources.map((resource) => ({
        key: resource.property,
        count: Array.isArray(record[resource.property]) ? (record[resource.property] as unknown[]).length : 0,
        resource,
      }));
    }

    const draft = this.adminContentDraft();
    if (!draft || Array.isArray(draft) || typeof draft !== 'object') {
      return [];
    }

    return Object.entries(draft as Record<string, unknown>)
      .filter(([, value]) => Array.isArray(value))
      .map(([key, value]) => ({ key, count: (value as unknown[]).length }));
  });
  readonly selectedAdminGroupItems = computed(() => {
    const draft = this.adminContentDraft();
    const key = this.selectedAdminGroupKey();
    if (!draft || Array.isArray(draft) || typeof draft !== 'object' || !key) {
      return [];
    }

    const value = (draft as Record<string, unknown>)[key];
    return Array.isArray(value) ? value : [];
  });
  readonly selectedAdminResource = computed(() =>
    this.adminContentResources().find((resource) => resource.section === this.selectedAdminContentKey() && resource.property === this.selectedAdminGroupKey()) ?? null
  );
  readonly selectedAdminGroupFields = computed(() => {
    const resource = this.selectedAdminResource();
    if (resource) {
      return [...resource.columns, 'sortOrder'];
    }

    const fields = new Set<string>();
    for (const item of this.selectedAdminGroupItems()) {
      if (this.isAdminObjectItem(item)) {
        Object.keys(item as Record<string, unknown>).forEach((field) => fields.add(field));
      }
    }

    return [...fields];
  });
  readonly selectedAdminTupleColumns = computed(() => {
    const maxLength = this.selectedAdminGroupItems().reduce((length, item) => Math.max(length, Array.isArray(item) ? item.length : 0), 0);
    return Array.from({ length: maxLength }, (_, index) => index);
  });
  readonly adminBlogPosts = computed(() => {
    const draft = this.selectedAdminContentKey() === 'blogs' ? this.adminContentDraft() : null;
    const section = this.adminContentSections().find((item) => item.key === 'blogs');
    const payload = draft ?? section?.payload;
    if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
      return [];
    }

    const posts = (payload as Record<string, unknown>)['posts'];
    if (!Array.isArray(posts)) {
      return [];
    }

    return posts.filter(this.isAdminObjectItem).map((post, index) => this.normalizeAdminBlogPost(post as Record<string, unknown>, index));
  });
  readonly adminBlogCategories = computed(() => ['All Categories', ...new Set(this.adminBlogPosts().map((post) => post.category).filter(Boolean))]);
  readonly adminBlogAuthors = computed(() => ['All Authors', ...new Set(this.adminBlogPosts().map((post) => post.author ?? 'OmarPhone Team'))]);
  readonly filteredAdminBlogPosts = computed(() => {
    const query = this.adminBlogSearch().trim().toLowerCase();
    const status = this.adminBlogStatusFilter();
    const category = this.adminBlogCategoryFilter();
    const author = this.adminBlogAuthorFilter();

    return this.adminBlogPosts().filter((post) => {
      const matchesSearch = !query || [post.title, post.copy, post.category, post.tag, post.slug, ...(post.tags ?? [])].join(' ').toLowerCase().includes(query);
      const matchesStatus = status === 'All' || post.status === status;
      const matchesCategory = category === 'All Categories' || post.category === category;
      const matchesAuthor = author === 'All Authors' || (post.author ?? 'OmarPhone Team') === author;
      return matchesSearch && matchesStatus && matchesCategory && matchesAuthor;
    });
  });
  readonly adminBlogStats = computed<AdminMetric[]>(() => {
    const posts = this.adminBlogPosts();
    const countStatus = (status: AdminBlogPost['status']) => posts.filter((post) => post.status === status).length;
    const views = posts.reduce((total, post) => total + (post.views ?? 0), 0);
    return [
      { title: 'Total Blogs', value: this.formatCompactNumber(posts.length), delta: 'All blog posts', icon: 'file-text', tone: 'violet' },
      { title: 'Published', value: this.formatCompactNumber(countStatus('Published')), delta: 'Live on website', icon: 'check', tone: 'green' },
      { title: 'Drafts', value: this.formatCompactNumber(countStatus('Draft')), delta: 'Not published', icon: 'wrench', tone: 'orange' },
      { title: 'Scheduled', value: this.formatCompactNumber(countStatus('Scheduled')), delta: 'Scheduled posts', icon: 'calendar', tone: 'blue' },
      { title: 'Total Views', value: this.formatCompactNumber(views), delta: 'Estimated all time views', icon: 'eye', tone: 'pink' },
    ];
  });
  readonly adminBlogStatusTabs = computed(() => {
    const posts = this.adminBlogPosts();
    const count = (status: AdminBlogPost['status']) => posts.filter((post) => post.status === status).length;
    return [
      { label: 'All Blogs', value: 'All' as const, count: posts.length },
      { label: 'Published', value: 'Published' as const, count: count('Published') },
      { label: 'Drafts', value: 'Draft' as const, count: count('Draft') },
      { label: 'Scheduled', value: 'Scheduled' as const, count: count('Scheduled') },
      { label: 'Archived', value: 'Archived' as const, count: count('Archived') },
    ];
  });

  constructor() {
    this.bookDevices.splice(0);
    this.repairIssues.splice(0);
    this.applyTheme(this.theme());
    void this.loadBackendContent();
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        this.path.set(this.getPath());
        this.scheduleTranslation();
      });
    }
    if (this.isAdminUnlocked()) {
      void this.syncAdminOrdersFromApi();
      void this.syncAdminContentSections();
    }
  }

  private async loadBackendContent(): Promise<void> {
    const [devices, repairIssues] = await Promise.all([
      this.contentService.loadPublicRows('booking-devices'),
      this.contentService.loadPublicRows('repair-issues'),
    ]);
    this.bookDevices.splice(0, this.bookDevices.length, ...(devices as BookDevice[]));
    this.repairIssues.splice(0, this.repairIssues.length, ...(repairIssues as RepairIssue[]));
  }

  ngAfterViewInit(): void {
    this.startTranslationObserver();
    this.scheduleTranslation();
  }

  ngOnDestroy(): void {
    this.translationObserver?.disconnect();
    if (this.translationFrame) {
      cancelAnimationFrame(this.translationFrame);
    }
  }

  toggleTheme(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.saveTheme(next);
    this.applyTheme(next);
  }

  toggleLanguage(): void {
    this.isLanguageMenuOpen.update((isOpen) => !isOpen);
  }

  selectLanguage(language: Language): void {
    this.translationService.setLanguage(language);
    this.isLanguageMenuOpen.set(false);
    this.scheduleTranslation();
  }

  selectBookDevice(device: BookDevice): void {
    this.selectedBookDeviceName.set(device.name);
    if (!this.getRepairIssuesForDevice(device.name).some((issue) => issue.title === this.selectedRepairIssueTitle())) {
      this.selectedRepairIssueTitle.set(null);
      this.selectedServiceOptionTitle.set(null);
    }
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

  continueToIssue(event: Event): void {
    if (!this.canContinueToIssue()) {
      event.preventDefault();
      return;
    }

    this.saveBookingSelection();
  }

  continueToService(event: Event): void {
    if (!this.canContinueToService()) {
      event.preventDefault();
      return;
    }

    this.saveBookingSelection();
  }

  updateCustomerDetails(field: keyof CustomerDetails, value: string): void {
    const signals: Record<keyof CustomerDetails, { set(value: string): void }> = {
      fullName: this.customerName,
      phone: this.customerPhone,
      email: this.customerEmail,
      city: this.customerCity,
      address: this.customerAddress,
      zip: this.customerZip,
      addressNotes: this.customerAddressNotes,
      date: this.customerDate,
      timeSlot: this.customerTimeSlot,
      notes: this.customerNotes,
      payment: this.customerPayment,
    };

    signals[field].set(value);
    this.saveCustomerDetails();
  }

  async confirmBooking(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.canConfirmBooking()) {
      return;
    }

    this.saveBookingSelection();
    this.saveCustomerDetails();

    const order = this.createBookingOrder();
    const savedOrder = await this.submitBookingOrder(order);
    this.saveBookingOrder(savedOrder, this.adminDataSource() === 'api');
    this.adminSyncMessage.set(this.adminDataSource() === 'api' ? 'Order sent to database' : 'Order queued for sync');
    this.lastBookingOrder.set(savedOrder);
    this.openAdminWhatsAppOrder(savedOrder);
    this.navigate('/booking-success');
  }

  bookingMailtoHref(): string {
    const subject = `New OmarPhone booking - ${this.selectedBookDevice()?.name ?? 'Device repair'}`;
    const body = [
      'NEW OMARPHONE REPAIR ORDER',
      '',
      'CUSTOMER',
      `Name: ${this.customerName() || '-'}`,
      `Phone: ${this.customerPhone() || '-'}`,
      `Email: ${this.customerEmail() || '-'}`,
      '',
      'DEVICE & REPAIR',
      `Device: ${this.selectedBookDevice()?.name ?? '-'}`,
      `Issue: ${this.selectedRepairIssue()?.title ?? '-'}`,
      `Service Type: ${this.selectedServiceOption()?.title ?? '-'}`,
      `Estimated Time: ${this.selectedEta()}`,
      'Quote: To confirm after diagnosis',
      '',
      'PICKUP / VISIT DETAILS',
      `City: ${this.customerCity() || '-'}`,
      `Address: ${this.customerAddress() || '-'}`,
      `ZIP: ${this.customerZip() || '-'}`,
      `Address Notes: ${this.customerAddressNotes() || '-'}`,
      `Preferred Date: ${this.customerDate() || '-'}`,
      `Preferred Time: ${this.customerTimeSlot() || '-'}`,
      '',
      'PAYMENT',
      `Payment Option: ${this.customerPayment() || '-'}`,
      '',
      'CUSTOMER NOTES',
      this.customerNotes() || '-',
    ].join('\n');

    return `mailto:hello@omarphone.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  bookingOrderMailtoHref(order: BookingOrder | null = this.lastBookingOrder()): string {
    if (!order) {
      return 'mailto:hello@omarphone.com';
    }

    const subject = `OmarPhone order ${order.id} - ${order.repair.device}`;
    const body = [
      `ORDER ID: ${order.id}`,
      `Created: ${this.formatOrderDate(order.createdAt)}`,
      `Status: ${order.status}`,
      '',
      'CUSTOMER',
      `Name: ${order.customer.fullName}`,
      `Phone: ${order.customer.phone}`,
      `Email: ${order.customer.email}`,
      '',
      'REPAIR',
      `Device: ${order.repair.device}`,
      `Issue: ${order.repair.issue}`,
      `Service: ${order.repair.service}`,
      `ETA: ${order.repair.eta}`,
      'Quote: To confirm after diagnosis',
      '',
      'SCHEDULE',
      `City: ${order.schedule.city}`,
      `Address: ${order.schedule.address}`,
      `ZIP: ${order.schedule.zip || '-'}`,
      `Date: ${order.schedule.date}`,
      `Time: ${order.schedule.timeSlot}`,
      `Notes: ${order.notes || '-'}`,
    ].join('\n');

    return `mailto:hello@omarphone.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  bookingOrderWhatsappHref(order: BookingOrder | null = this.lastBookingOrder()): string {
    if (!order) {
      return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}`;
    }

    return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(this.getBookingOrderMessage(order))}`;
  }

  private openAdminWhatsAppOrder(order: BookingOrder): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.open(this.bookingOrderWhatsappHref(order), '_blank', 'noopener,noreferrer');
  }

  private getBookingOrderMessage(order: BookingOrder): string {
    return [
      '🔧 NEW OMARPHONE REPAIR ORDER',
      '',
      `Order ID: ${order.id}`,
      `Created: ${this.formatOrderDate(order.createdAt)}`,
      `Status: ${order.status}`,
      '',
      'CUSTOMER',
      `Name: ${order.customer.fullName}`,
      `Phone: ${order.customer.phone}`,
      `Email: ${order.customer.email}`,
      '',
      'REPAIR',
      `Device: ${order.repair.device}`,
      `Issue: ${order.repair.issue}`,
      `Service: ${order.repair.service}`,
      `ETA: ${order.repair.eta}`,
      'Quote: To confirm after diagnosis',
      '',
      'SCHEDULE',
      `City: ${order.schedule.city}`,
      `Address: ${order.schedule.address}`,
      `ZIP: ${order.schedule.zip || '-'}`,
      `Date: ${order.schedule.date}`,
      `Time: ${order.schedule.timeSlot}`,
      `Address Notes: ${order.schedule.addressNotes || '-'}`,
      '',
      'PAYMENT',
      order.payment,
      '',
      'CUSTOMER NOTES',
      order.notes || '-',
    ].join('\n');
  }

  formatOrderDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  formatCompactNumber(value: number): string {
    return new Intl.NumberFormat('en', { notation: value >= 1000 ? 'compact' : 'standard' }).format(value);
  }

  orderTimeAgo(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'just now';
    }

    const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.round(minutes / 60);
    if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  statusTone(status: BookingOrder['status']): string {
    return status === 'Confirmed' ? 'completed' : status === 'In Review' ? 'progress' : 'pending';
  }

  navigate(path: string): void {
    if (typeof window === 'undefined') {
      this.path.set(path);
      return;
    }

    window.history.pushState({}, '', path);
    this.path.set(path);
    this.scheduleTranslation();
    if (path === '/admin' && this.isAdminUnlocked()) {
      void this.syncAdminOrdersFromApi();
      void this.syncAdminContentSections();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  refreshAdminOrders(): void {
    if (!this.isAdminUnlocked()) {
      return;
    }

    void this.syncAdminOrdersFromApi();
  }

  refreshAdminContent(): void {
    if (!this.isAdminUnlocked()) {
      return;
    }

    void this.syncAdminContentSections();
  }

  openAdminView(view: AdminView): void {
    this.adminActiveView.set(view);
    if (view === 'orders') {
      void this.syncAdminOrdersFromApi();
    }
    if (view === 'blogs') {
      void this.syncAdminContentSections().then(() => this.selectAdminContentSection('blogs'));
      return;
    }
    if (view === 'content' && !this.adminContentSections().length) {
      void this.syncAdminContentSections();
    }
  }

  updateAdminBlogSearch(value: string): void {
    this.adminBlogSearch.set(value);
  }

  updateAdminBlogStatusFilter(value: string): void {
    if (['All', 'Published', 'Draft', 'Scheduled', 'Archived'].includes(value)) {
      this.adminBlogStatusFilter.set(value as 'All' | 'Published' | 'Draft' | 'Scheduled' | 'Archived');
    }
  }

  updateAdminBlogCategoryFilter(value: string): void {
    this.adminBlogCategoryFilter.set(value);
  }

  updateAdminBlogAuthorFilter(value: string): void {
    this.adminBlogAuthorFilter.set(value);
  }

  openAdminBlogsEditor(): void {
    this.openAdminContent('blogs');
    this.selectedAdminGroupKey.set('posts');
  }

  async addAdminBlog(): Promise<void> {
    await this.mutateAdminBlogs((posts) => [
      {
        slug: `new-blog-${Date.now()}`,
        title: 'New Blog Post',
        copy: 'Write a short excerpt for this article.',
        date: new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()),
        tag: 'Draft',
        category: 'News & Updates',
        tags: ['OmarPhone'],
        tone: 'violet',
        image: '/assets/cutouts/screen-repair.png',
        author: 'OmarPhone Team',
        status: 'Draft',
        views: 0,
      },
      ...posts,
    ]);
    this.openAdminBlogsEditor();
  }

  async duplicateAdminBlog(post: AdminBlogPost): Promise<void> {
    await this.mutateAdminBlogs((posts) => [
      {
        ...post,
        slug: `${post.slug}-copy-${Date.now()}`,
        title: `${post.title} Copy`,
        status: 'Draft',
        views: 0,
      },
      ...posts,
    ]);
  }

  async deleteAdminBlog(post: AdminBlogPost): Promise<void> {
    await this.mutateAdminBlogs((posts) => posts.filter((item) => item.slug !== post.slug));
  }

  viewAdminBlog(post: AdminBlogPost): void {
    if (typeof window !== 'undefined') {
      window.open(`/blogs/${post.slug}`, '_blank', 'noopener,noreferrer');
    }
  }

  openAdminContent(key: string): void {
    this.adminActiveView.set('content');
    if (!this.adminContentSections().length) {
      void this.syncAdminContentSections().then(() => this.selectAdminContentSection(key));
      return;
    }

    void this.selectAdminContentSection(key);
  }

  async selectAdminContentSection(key: string): Promise<void> {
    this.selectedAdminContentKey.set(key);
    this.adminContentError.set('');
    this.adminDeletedResourceRowIds.set([]);
    const resources = this.adminContentResources().filter((resource) => resource.section === key);
    if (resources.length) {
      await this.loadAdminResourceSection(key);
      return;
    }

    const section = this.adminContentSections().find((item) => item.key === key);
    this.setAdminContentDraft(section?.payload ?? {});
  }

  updateAdminContentJson(value: string): void {
    this.adminContentJson.set(value);
    this.adminContentError.set('');
  }

  selectAdminGroup(key: string): void {
    this.selectedAdminGroupKey.set(key);
    this.adminDeletedResourceRowIds.set([]);
  }

  updateAdminField(index: number, field: string, value: string): void {
    this.updateAdminItem(index, (item) => ({ ...item, [field]: value }));
  }

  updateAdminArrayField(index: number, field: string, value: string): void {
    const items = value.split(',').map((item) => item.trim()).filter(Boolean);
    this.updateAdminItem(index, (item) => ({ ...item, [field]: items }));
  }

  async uploadAdminImage(index: number, field: string, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    try {
      this.adminContentMessage.set(`Uploading ${file.name}...`);
      const media = await this.contentService.uploadMedia(file, `${this.selectedAdminContentKey()} ${field}`);
      this.updateAdminField(index, field, media.url);
      this.adminContentMessage.set(`Image uploaded to database: ${media.url}`);
    } catch {
      this.adminContentError.set('Could not upload this image. Use PNG, JPG, GIF, SVG, or WebP up to 5MB.');
    }
  }

  updateAdminPrimitiveItem(index: number, value: string): void {
    const draft = this.cloneContentPayload(this.adminContentDraft());
    const key = this.selectedAdminGroupKey();
    if (!draft || Array.isArray(draft) || typeof draft !== 'object' || !key) {
      return;
    }

    const record = draft as Record<string, unknown>;
    const items = Array.isArray(record[key]) ? [...record[key] as unknown[]] : [];
    items[index] = value;
    record[key] = items;
    this.adminContentDraft.set(record);
    this.adminContentJson.set(this.formatJson(record));
    this.adminContentError.set('');
  }

  updateAdminTupleField(index: number, tupleIndex: number, value: string): void {
    const draft = this.cloneContentPayload(this.adminContentDraft());
    const key = this.selectedAdminGroupKey();
    if (!draft || Array.isArray(draft) || typeof draft !== 'object' || !key) {
      return;
    }

    const record = draft as Record<string, unknown>;
    const items = Array.isArray(record[key]) ? [...record[key] as unknown[]] : [];
    const current = items[index];
    if (!Array.isArray(current)) {
      return;
    }

    const tuple = [...current];
    tuple[tupleIndex] = value;
    items[index] = tuple;
    record[key] = items;
    this.adminContentDraft.set(record);
    this.adminContentJson.set(this.formatJson(record));
    this.adminContentError.set('');
  }

  addAdminItem(): void {
    const draft = this.cloneContentPayload(this.adminContentDraft());
    const key = this.selectedAdminGroupKey();
    if (!draft || Array.isArray(draft) || typeof draft !== 'object' || !key) {
      return;
    }

    const record = draft as Record<string, unknown>;
    const items = Array.isArray(record[key]) ? [...record[key] as unknown[]] : [];
    const fields = this.selectedAdminGroupFields();
    const firstArrayItem = items.find((item) => Array.isArray(item));
    const template = Array.isArray(firstArrayItem)
      ? firstArrayItem.map(() => '')
      : fields.length
      ? fields.reduce<Record<string, unknown>>((item, field) => {
          item[field] = this.isAdminListField(field) ? [] : '';
          return item;
        }, {})
      : { title: '', copy: '', image: '' };
    items.push(template);
    record[key] = items;
    this.adminContentDraft.set(record);
    this.adminContentJson.set(this.formatJson(record));
    this.adminContentError.set('');
  }

  removeAdminItem(index: number): void {
    const draft = this.cloneContentPayload(this.adminContentDraft());
    const key = this.selectedAdminGroupKey();
    if (!draft || Array.isArray(draft) || typeof draft !== 'object' || !key) {
      return;
    }

    const record = draft as Record<string, unknown>;
    const items = Array.isArray(record[key]) ? [...record[key] as unknown[]] : [];
    const current = items[index];
    if (this.selectedAdminResource() && this.isAdminObjectItem(current)) {
      const id = this.getAdminResourceRowId(current as Record<string, unknown>, this.selectedAdminResource());
      if (id !== undefined && id !== null && id !== '') {
        this.adminDeletedResourceRowIds.update((ids) => [...ids, id as string | number]);
      }
    }
    items.splice(index, 1);
    record[key] = items;
    this.adminContentDraft.set(record);
    this.adminContentJson.set(this.formatJson(record));
    this.adminContentError.set('');
  }

  isAdminObjectItem(item: unknown): boolean {
    return !!item && typeof item === 'object' && !Array.isArray(item);
  }

  isAdminArrayItem(item: unknown): boolean {
    return Array.isArray(item);
  }

  isAdminImageField(field: string): boolean {
    return ['image', 'avatar', 'logo', 'beforeImage', 'afterImage', 'deviceImage', 'heroImage', 'photo'].includes(field);
  }

  isAdminLongTextField(field: string): boolean {
    return ['copy', 'answer', 'description', 'notes', 'body', 'quote', 'excerpt'].includes(field);
  }

  isAdminListField(field: string): boolean {
    return ['tags', 'features', 'items', 'points', 'specializations', 'certifications'].includes(field);
  }

  getAdminFieldValue(item: unknown, field: string): string {
    if (!this.isAdminObjectItem(item)) {
      return '';
    }

    const value = (item as Record<string, unknown>)[field];
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return value == null ? '' : String(value);
  }

  getAdminItemTitle(item: unknown, index: number): string {
    if (Array.isArray(item)) {
      return item[0] ? String(item[0]) : `Item ${index + 1}`;
    }

    if (!this.isAdminObjectItem(item)) {
      return `Item ${index + 1}`;
    }

    const record = item as Record<string, unknown>;
    const title = record['title'] ?? record['name'] ?? record['label'] ?? record['slug'];
    return title ? String(title) : `Item ${index + 1}`;
  }

  formatAdminPrimitiveItem(item: unknown): string {
    return item == null ? '' : String(item);
  }

  getAdminTupleIndexes(item: unknown): number[] {
    return Array.isArray(item) ? item.map((_, index) => index) : [];
  }

  getAdminTupleValue(item: unknown, index: number): string {
    return Array.isArray(item) && item[index] != null ? String(item[index]) : '';
  }

  async saveAdminContentSection(): Promise<void> {
    const key = this.selectedAdminContentKey();
    try {
      const resource = this.selectedAdminResource();
      if (resource) {
        await this.saveSelectedAdminResource(resource);
        await this.loadAdminResourceSection(key);
        await this.loadBackendContent();
        this.adminContentMessage.set(`${resource.key} saved to Postgres`);
        return;
      }

      const payload = this.cloneContentPayload(this.adminContentDraft());
      const sections = await this.contentService.saveSection(key, payload);
      this.adminContentSections.set(sections);
      await this.selectAdminContentSection(key);
      await this.loadBackendContent();
      this.adminContentMessage.set(`${key} saved to database`);
    } catch (error) {
      this.adminContentError.set(error instanceof SyntaxError ? 'Invalid JSON. Please fix the syntax.' : 'Could not save this content section.');
    }
  }

  async resetAdminContentSection(): Promise<void> {
    const key = this.selectedAdminContentKey();
    try {
      const resource = this.selectedAdminResource();
      if (resource) {
        const rows = this.selectedAdminGroupItems().filter(this.isAdminObjectItem) as Record<string, unknown>[];
        await Promise.all(rows.map((row) => {
          const id = this.getAdminResourceRowId(row, resource);
          return id === undefined || id === null || id === '' ? Promise.resolve() : this.contentService.deleteResourceRow(resource, id as string | number);
        }));
        this.adminDeletedResourceRowIds.set([]);
        await this.loadAdminResourceSection(key);
        await this.loadBackendContent();
        this.adminContentMessage.set(`${resource.key} table cleared`);
        return;
      }

      const sections = await this.contentService.resetSection(key);
      this.adminContentSections.set(sections);
      await this.selectAdminContentSection(key);
      await this.loadBackendContent();
      this.adminContentMessage.set(`${key} reset to code defaults`);
    } catch {
      this.adminContentError.set('Could not reset this content section.');
    }
  }

  async updateAdminOrderStatus(order: BookingOrder, status: BookingOrder['status']): Promise<void> {
    const optimisticOrders = this.adminOrders().map((item) => item.id === order.id ? { ...item, status } : item);
    this.adminOrders.set(optimisticOrders);
    this.saveAdminOrdersLocally(optimisticOrders);

    try {
      const response = await fetch(`${getApiBaseUrl()}/orders/${encodeURIComponent(order.id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...this.getAdminAuthHeaders() },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }

      const payload = await response.json() as { orders?: BookingOrder[] };
      const orders = payload.orders ?? optimisticOrders;
      this.adminOrders.set(orders);
      this.saveAdminOrdersLocally(orders);
      this.adminDataSource.set('api');
      this.adminSyncMessage.set(`Order ${order.id} updated`);
    } catch (error) {
      this.adminDataSource.set('local');
      const reason = error instanceof Error ? error.message : 'Unknown error';
      this.adminSyncMessage.set(`Status queued for sync. API update failed: ${reason}`);
    }
  }

  updateAdminLogin(field: 'username' | 'password', value: string): void {
    this.adminLoginError.set('');
    if (field === 'username') {
      this.adminLoginUsername.set(value);
      return;
    }

    this.adminLoginPassword.set(value);
  }

  async loginAdmin(event: Event): Promise<void> {
    event.preventDefault();

    const username = this.adminLoginUsername().trim();
    const password = this.adminLoginPassword();
    try {
      const response = await fetch(`${getApiBaseUrl()}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }

      const payload = await response.json() as { token?: string };
      if (!payload.token) {
        throw new Error('Login response did not include a token');
      }

      this.isAdminUnlocked.set(true);
      this.adminLoginUsername.set('');
      this.adminLoginPassword.set('');
      this.adminLoginError.set('');
      this.saveAdminSession(payload.token);
      void this.syncAdminOrdersFromApi();
      void this.syncAdminContentSections();
    } catch {
      this.adminLoginError.set('Wrong username or password.');
      this.adminLoginPassword.set('');
    }
  }

  logoutAdmin(): void {
    this.isAdminUnlocked.set(false);
    this.adminOrders.set([]);
    this.adminDataSource.set('local');
    this.adminSyncMessage.set('Admin locked');
    this.adminContentSections.set([]);
    this.adminContentResources.set([]);
    this.adminDeletedResourceRowIds.set([]);
    this.adminContentDraft.set({});
    this.selectedAdminGroupKey.set('');
    this.adminContentJson.set('');
    this.adminContentMessage.set('Content editor locked');
    this.adminContentError.set('');
    this.saveAdminSession(null);
  }

  private createBookingOrder(): BookingOrder {
    return {
      id: this.createOrderId(),
      createdAt: new Date().toISOString(),
      status: 'New',
      customer: {
        fullName: this.customerName().trim(),
        phone: this.customerPhone().trim(),
        email: this.customerEmail().trim(),
      },
      repair: {
        device: this.selectedBookDevice()?.name ?? 'Device repair',
        deviceImage: this.selectedBookDevice()?.image ?? '/images/phones/apple/iphone-15-pro-max.png',
        issue: this.selectedRepairIssue()?.title ?? 'Repair issue',
        service: this.selectedServiceOption()?.title ?? 'Repair service',
        eta: this.selectedEta(),
        price: 0,
        serviceFee: 0,
        total: 0,
      },
      schedule: {
        city: this.customerCity().trim(),
        address: this.customerAddress().trim(),
        zip: this.customerZip().trim(),
        addressNotes: this.customerAddressNotes().trim(),
        date: this.customerDate(),
        timeSlot: this.customerTimeSlot(),
      },
      payment: this.customerPayment(),
      notes: this.customerNotes().trim(),
    };
  }

  private createOrderId(): string {
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `OP-${new Date().getFullYear()}-${suffix}`;
  }

  private getLastBookingOrder(): BookingOrder | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const rawOrder = localStorage.getItem('omarphone-last-order');
      return rawOrder ? JSON.parse(rawOrder) as BookingOrder : null;
    } catch {
      return null;
    }
  }

  private getAdminOrders(): BookingOrder[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const rawOrders = localStorage.getItem('omarphone-admin-orders');
      return rawOrders ? JSON.parse(rawOrders) as BookingOrder[] : [];
    } catch {
      return [];
    }
  }

  private getAdminSession(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    try {
      return Boolean(localStorage.getItem(ADMIN_SESSION_STORAGE_KEY));
    } catch {
      return false;
    }
  }

  private getAdminAuthHeaders(): Record<string, string> {
    if (typeof localStorage === 'undefined') {
      return {};
    }

    try {
      const token = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  }

  private saveAdminSession(token: string | null): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      if (token) {
        localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      }
    } catch {
      // The current page still updates even if storage is blocked.
    }
  }

  private async submitBookingOrder(order: BookingOrder): Promise<BookingOrder> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }

      const payload = await response.json() as { order?: BookingOrder; orders?: BookingOrder[] };
      this.adminDataSource.set('api');
      if (payload.orders) {
        this.adminOrders.set(payload.orders);
        this.saveAdminOrdersLocally(payload.orders);
      }

      return payload.order ?? order;
    } catch {
      this.adminDataSource.set('local');
      return order;
    }
  }

  private async syncAdminOrdersFromApi(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/orders`, {
        headers: this.getAdminAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }

      const payload = await response.json() as { orders?: BookingOrder[] };
      const orders = payload.orders ?? [];
      this.adminOrders.set(orders);
      this.saveAdminOrdersLocally(orders);
      this.adminDataSource.set('api');
      this.adminSyncMessage.set(`Connected to database · ${orders.length} order${orders.length === 1 ? '' : 's'}`);
    } catch {
      const localOrders = this.getAdminOrders();
      this.adminOrders.set(localOrders);
      this.adminDataSource.set('local');
      this.adminSyncMessage.set('Database connection unavailable. Showing cached orders until sync is restored.');
    }
  }

  private saveBookingOrder(order: BookingOrder, syncedWithApi = false): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const currentOrders = syncedWithApi ? this.adminOrders() : this.getAdminOrders();
    const orders = [order, ...currentOrders.filter((item) => item.id !== order.id)];
    localStorage.setItem('omarphone-last-order', JSON.stringify(order));
    this.saveAdminOrdersLocally(orders);
    this.adminOrders.set(orders);
  }

  private saveAdminOrdersLocally(orders: BookingOrder[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem('omarphone-admin-orders', JSON.stringify(orders));
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

  private getSavedCustomerDetails(): CustomerDetails {
    const fallback: CustomerDetails = {
      fullName: '',
      phone: '',
      email: '',
      city: '',
      address: '',
      zip: '',
      addressNotes: '',
      date: '',
      timeSlot: '',
      notes: '',
      payment: 'Pay Online',
    };

    if (typeof localStorage === 'undefined') {
      return fallback;
    }

    try {
      const rawDetails = localStorage.getItem('omarphone-customer-details');
      return rawDetails ? { ...fallback, ...JSON.parse(rawDetails) } : fallback;
    } catch {
      return fallback;
    }
  }

  private saveCustomerDetails(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const details: CustomerDetails = {
      fullName: this.customerName(),
      phone: this.customerPhone(),
      email: this.customerEmail(),
      city: this.customerCity(),
      address: this.customerAddress(),
      zip: this.customerZip(),
      addressNotes: this.customerAddressNotes(),
      date: this.customerDate(),
      timeSlot: this.customerTimeSlot(),
      notes: this.customerNotes(),
      payment: this.customerPayment(),
    };

    localStorage.setItem('omarphone-customer-details', JSON.stringify(details));
  }

  private getIssuePrice(title?: string): number {
    const prices: Record<string, number> = {
      'Screen Repair': 79,
      'Battery Replacement': 49,
      'Charging Port Repair': 59,
      'USB-C Port Repair': 69,
      'Lightning Port Repair': 59,
      'Dock Connector Repair': 59,
      'Camera Repair': 69,
      'Water Damage': 99,
      'Back Glass Repair': 89,
      'Face ID / Sensors': 119,
      'Speaker / Mic': 59,
      'Buttons / Switches': 49,
      'Home Button / Buttons': 59,
      'Software Issue': 49,
      'Accessory Help': 19,
      'Other Issue': 0,
    };

    return title ? prices[title] ?? 0 : 0;
  }

  private getRepairIssuesForDevice(deviceName: string | undefined): RepairIssue[] {
    if (!deviceName) {
      return this.repairIssues.filter((issue) => issue.availability !== 'accessory');
    }

    if (deviceName.includes('Accessories')) {
      return this.repairIssues.filter((issue) => issue.availability === 'accessory' || issue.key === 'other');
    }

    const generation = this.getIphoneGeneration(deviceName);
    const hasGlassBack = generation >= 8 && !deviceName.includes('SE 1st');
    const hasFaceId = generation >= 10 || /\biPhone X|iPhone XR|iPhone XS/.test(deviceName);
    const isLegacy = generation <= 8 || deviceName.includes('SE');
    const hasUsbC = generation >= 15 || deviceName.includes('Air');
    const hasDockConnector = generation <= 4 || deviceName.includes('1st Generation') || deviceName.includes('3G');

    return this.repairIssues
      .filter((issue) => {
        if (issue.availability === 'accessory') {
          return false;
        }
        if (issue.availability === 'modern-glass') {
          return hasGlassBack;
        }
        if (issue.availability === 'face-id') {
          return hasFaceId;
        }
        if (issue.availability === 'legacy') {
          return isLegacy;
        }
        return true;
      })
      .map((issue) => {
        if (issue.key === 'buttons') {
          return {
            ...issue,
            title: generation <= 8 ? 'Home Button / Buttons' : 'Buttons / Switches',
            copy: generation <= 8
              ? 'Home button, power, volume, mute switch or Touch ID button issues.'
              : issue.copy,
          };
        }

        if (issue.key !== 'charging-port') {
          return issue;
        }

        if (hasDockConnector) {
          return {
            ...issue,
            title: 'Dock Connector Repair',
            copy: '30-pin dock connector not charging, syncing poorly or physically damaged.',
          };
        }

        return {
          ...issue,
          title: hasUsbC ? 'USB-C Port Repair' : 'Lightning Port Repair',
          copy: hasUsbC
            ? 'USB-C not charging, loose connection, bent pins or debris damage.'
            : 'Lightning cable not charging, loose connection, bent pins or debris damage.',
        };
      });
  }

  private getIphoneGeneration(deviceName: string): number {
    if (deviceName.includes('1st Generation')) {
      return 1;
    }
    if (deviceName.includes('3GS') || deviceName.includes('3G')) {
      return 3;
    }
    if (deviceName.includes('SE 2022')) {
      return 13;
    }
    if (deviceName.includes('SE 2020')) {
      return 11;
    }
    const match = deviceName.match(/iPhone\s+(\d+)/);
    return match ? Number(match[1]) : 10;
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

    try {
      const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    } catch {
      // Fall back to the system theme when storage is unavailable.
    }

    if (typeof window.matchMedia !== 'function') {
      return 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private saveTheme(theme: Theme): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Theme still changes for this page even if storage is blocked.
    }
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

  private async syncAdminContentSections(): Promise<void> {
    try {
      const [sections, resources] = await Promise.all([
        this.contentService.loadSections(),
        this.contentService.loadResources(),
      ]);
      this.adminContentSections.set(sections);
      this.adminContentResources.set(resources);
      const selectedKey = sections.some((section) => section.key === this.selectedAdminContentKey())
        ? this.selectedAdminContentKey()
        : sections[0]?.key ?? 'home';
      this.selectedAdminContentKey.set(selectedKey);
      if (resources.some((resource) => resource.section === selectedKey)) {
        await this.loadAdminResourceSection(selectedKey);
      } else {
        this.setAdminContentDraft(sections.find((section) => section.key === selectedKey)?.payload ?? {});
      }
      this.adminContentMessage.set(`Connected to content API · ${sections.length} section${sections.length === 1 ? '' : 's'}`);
      this.adminContentError.set('');
    } catch {
      this.adminContentMessage.set('Content service unavailable');
      this.adminContentError.set('Could not load editable content. Check the production database connection.');
    }
  }

  private async loadAdminResourceSection(sectionKey: string): Promise<void> {
    const resources = this.adminContentResources().filter((resource) => resource.section === sectionKey);
    const entries = await Promise.all(resources.map(async (resource) => {
      const rows = await this.contentService.loadResourceRows(resource);
      return [resource.property, rows] as const;
    }));
    this.setAdminContentDraft(Object.fromEntries(entries));
    const currentGroup = this.selectedAdminGroupKey();
    this.selectedAdminGroupKey.set(resources.some((resource) => resource.property === currentGroup) ? currentGroup : resources[0]?.property ?? '');
    this.adminDeletedResourceRowIds.set([]);
  }

  private async saveSelectedAdminResource(resource: ContentResource): Promise<void> {
    const draft = this.cloneContentPayload(this.adminContentDraft());
    if (!draft || Array.isArray(draft) || typeof draft !== 'object') {
      return;
    }

    const record = draft as Record<string, unknown>;
    const rows = Array.isArray(record[resource.property])
      ? (record[resource.property] as unknown[]).filter(this.isAdminObjectItem) as ContentResourceRow[]
      : [];

    await Promise.all(this.adminDeletedResourceRowIds().map((id) => this.contentService.deleteResourceRow(resource, id)));
    for (const [index, row] of rows.entries()) {
      const payload = {
        ...row,
        sortOrder: Number.isFinite(Number(row.sortOrder)) ? Number(row.sortOrder) : index,
      };
      const id = this.getAdminResourceRowId(payload, resource);
      if (id === undefined || id === null || id === '') {
        await this.contentService.createResourceRow(resource, payload);
      } else {
        await this.contentService.updateResourceRow(resource, id, payload);
      }
    }

    this.adminDeletedResourceRowIds.set([]);
    await this.contentService.refresh();
  }

  private getAdminResourceRowId(row: Record<string, unknown>, resource: ContentResource | null): string | number | undefined {
    const idField = resource?.idField ?? 'id';
    const id = row[idField];
    return typeof id === 'string' || typeof id === 'number' ? id : undefined;
  }

  private normalizeAdminBlogPost(post: Record<string, unknown>, index: number): AdminBlogPost {
    const title = String(post['title'] ?? `Blog Post ${index + 1}`);
    const copy = String(post['copy'] ?? post['description'] ?? 'No excerpt added yet.');
    const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = String(post['slug'] ?? (generatedSlug || `blog-${index + 1}`));
    const category = String(post['category'] ?? post['tag'] ?? 'News & Updates');
    const tag = String(post['tag'] ?? category);
    const status = this.normalizeAdminBlogStatus(post['status'], index);
    const views = typeof post['views'] === 'number' ? post['views'] as number : this.estimateBlogViews(slug, index);

    return {
      slug,
      title,
      copy,
      date: String(post['date'] ?? 'Draft'),
      tag,
      category,
      tags: Array.isArray(post['tags']) ? post['tags'].map(String) : [tag],
      tone: String(post['tone'] ?? ['violet', 'green', 'orange', 'pink', 'blue'][index % 5]),
      image: String(post['image'] ?? '/assets/cutouts/screen-repair.png'),
      author: String(post['author'] ?? 'OmarPhone Team'),
      status,
      views,
      publishedAt: String(post['publishedAt'] ?? post['date'] ?? ''),
    };
  }

  private normalizeAdminBlogStatus(status: unknown, index: number): AdminBlogPost['status'] {
    if (status === 'Published' || status === 'Draft' || status === 'Scheduled' || status === 'Archived') {
      return status;
    }

    return index % 9 === 3 ? 'Draft' : index % 11 === 4 ? 'Scheduled' : 'Published';
  }

  private estimateBlogViews(slug: string, index: number): number {
    const seed = [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return 420 + ((seed + index * 317) % 2800);
  }

  private async mutateAdminBlogs(updater: (posts: AdminBlogPost[]) => AdminBlogPost[]): Promise<void> {
    if (!this.adminContentSections().length) {
      await this.syncAdminContentSections();
    }

    const resource = this.adminContentResources().find((item) => item.key === 'blogs');
    if (resource) {
      const currentPosts = (await this.contentService.loadResourceRows(resource))
        .filter(this.isAdminObjectItem)
        .map((post, index) => this.normalizeAdminBlogPost(post as Record<string, unknown>, index));
      const nextPosts = updater(currentPosts);
      const nextSlugs = new Set(nextPosts.map((post) => post.slug));

      await Promise.all(currentPosts
        .filter((post) => !nextSlugs.has(post.slug))
        .map((post) => this.contentService.deleteResourceRow(resource, post.slug)));

      for (const [index, post] of nextPosts.entries()) {
        const payload = { ...post, sortOrder: index };
        if (currentPosts.some((item) => item.slug === post.slug)) {
          await this.contentService.updateResourceRow(resource, post.slug, payload);
        } else {
          await this.contentService.createResourceRow(resource, payload);
        }
      }

      await this.selectAdminContentSection('blogs');
      await this.loadBackendContent();
      this.adminContentMessage.set('blogs saved to Postgres');
      return;
    }

    const section = this.adminContentSections().find((item) => item.key === 'blogs');
    const payload = this.cloneContentPayload(section?.payload ?? { posts: [] });
    const record = payload && !Array.isArray(payload) && typeof payload === 'object' ? payload as Record<string, unknown> : { posts: [] };
    const currentPosts = Array.isArray(record['posts'])
      ? record['posts'].filter(this.isAdminObjectItem).map((post, index) => this.normalizeAdminBlogPost(post as Record<string, unknown>, index))
      : [];
    record['posts'] = updater(currentPosts);

    const sections = await this.contentService.saveSection('blogs', record);
    this.adminContentSections.set(sections);
    this.setAdminContentDraft(sections.find((item) => item.key === 'blogs')?.payload ?? record);
    this.adminContentMessage.set('blogs saved to database');
  }

  private formatJson(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }

  private setAdminContentDraft(payload: unknown): void {
    const draft = this.cloneContentPayload(payload);
    this.adminContentDraft.set(draft);
    this.adminContentJson.set(this.formatJson(draft));
    const groups = this.adminContentGroups();
    const currentGroup = this.selectedAdminGroupKey();
    this.selectedAdminGroupKey.set(groups.some((group) => group.key === currentGroup) ? currentGroup : groups[0]?.key ?? '');
  }

  private updateAdminItem(index: number, updater: (item: Record<string, unknown>) => Record<string, unknown>): void {
    const draft = this.cloneContentPayload(this.adminContentDraft());
    const key = this.selectedAdminGroupKey();
    if (!draft || Array.isArray(draft) || typeof draft !== 'object' || !key) {
      return;
    }

    const record = draft as Record<string, unknown>;
    const items = Array.isArray(record[key]) ? [...record[key] as unknown[]] : [];
    const current = items[index];
    if (!this.isAdminObjectItem(current)) {
      return;
    }

    items[index] = updater(current as Record<string, unknown>);
    record[key] = items;
    this.adminContentDraft.set(record);
    this.adminContentJson.set(this.formatJson(record));
    this.adminContentError.set('');
  }

  private cloneContentPayload<T = unknown>(value: T): T {
    return JSON.parse(JSON.stringify(value ?? {}));
  }

  private startTranslationObserver(): void {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
      return;
    }

    this.translationObserver = new MutationObserver(() => this.scheduleTranslation());
    this.translationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private scheduleTranslation(): void {
    if (typeof requestAnimationFrame === 'undefined') {
      this.translationService.applyToDocument();
      return;
    }

    if (this.translationFrame) {
      cancelAnimationFrame(this.translationFrame);
    }

    this.translationFrame = requestAnimationFrame(() => {
      this.translationFrame = 0;
      this.translationService.applyToDocument();
    });
  }
}
