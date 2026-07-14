import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const TONES = ['violet', 'blue', 'pink', 'green', 'orange', 'cyan'];
const FALLBACK_APPLE_PHONE_FILES = [
  'iphone-1st-generation.png',
  'iphone-3g.png',
  'iphone-3gs.png',
  'iphone-4.png',
  'iphone-4-verizon.png',
  'iphone-4s.png',
  'iphone-5.png',
  'iphone-5c.png',
  'iphone-5s.png',
  'iphone-6.png',
  'iphone-6-plus.png',
  'iphone-6s.png',
  'iphone-6s-plus.png',
  'iphone-7.png',
  'iphone-7-plus.png',
  'iphone-8.png',
  'iphone-8-plus.png',
  'iphone-11.png',
  'iphone-11-pro.png',
  'iphone-11-pro-max.png',
  'iphone-12.png',
  'iphone-12-mini.png',
  'iphone-12-pro.png',
  'iphone-12-pro-max.png',
  'iphone-13.png',
  'iphone-13-mini.png',
  'iphone-13-pro.png',
  'iphone-13-pro-max.png',
  'iphone-14.png',
  'iphone-14-plus.png',
  'iphone-14-pro.png',
  'iphone-14-pro-max.png',
  'iphone-15.png',
  'iphone-15-plus.png',
  'iphone-15-pro.png',
  'iphone-15-pro-max.png',
  'iphone-16.png',
  'iphone-16e.png',
  'iphone-16-plus.png',
  'iphone-16-pro.png',
  'iphone-16-pro-max.png',
  'iphone-17.png',
  'iphone-17e.png',
  'iphone-17-pro.png',
  'iphone-17-pro-max.png',
  'iphone-air.png',
  'iphone-se-1st-generation.png',
  'iphone-se-2020.png',
  'iphone-se-2022.png',
  'iphone-x.png',
  'iphone-xr.png',
  'iphone-xs.png',
  'iphone-xs-max.png',
];

function titleCasePhone(fileName) {
  return fileName
    .replace(/\.png$/i, '')
    .split('-')
    .map((part) => {
      if (part === 'iphone') return 'iPhone';
      if (part === 'se') return 'SE';
      if (part === 'xs') return 'XS';
      if (part === 'xr') return 'XR';
      if (part === 'x') return 'X';
      if (part === '3g') return '3G';
      if (part === '3gs') return '3GS';
      if (part === '4s') return '4S';
      if (part === '5s') return '5S';
      if (part === '5c') return '5C';
      if (part === '6s') return '6S';
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ')
    .replace('1st Generation', '1st Generation')
    .replace('2020', '2020')
    .replace('2022', '2022');
}

export async function getSiteContent(projectDir) {
  const applePhoneDir = join(projectDir, 'public', 'images', 'phones', 'apple');
  let phoneFiles = FALLBACK_APPLE_PHONE_FILES;
  try {
    phoneFiles = await readdir(applePhoneDir);
  } catch {
    phoneFiles = FALLBACK_APPLE_PHONE_FILES;
  }
  const appleDevices = phoneFiles
    .filter((file) => file.endsWith('.png'))
    .filter((file) => !file.includes('accessories'))
    .map((file, index) => ({
      name: titleCasePhone(file),
      image: `/images/phones/apple/${file}`,
      tone: TONES[index % TONES.length],
      brand: 'Apple',
      category: 'Phones',
    }));

  return {
    home: {
      services: [
        { title: 'Phone Screen Repair', price: 'Free quote', copy: 'Cracked or broken screen? We will make it look brand new.', icon: 'screen', tone: 'violet', image: '/assets/cutouts/screen-repair.png' },
        { title: 'Phone Battery Replacement', price: 'Free quote', copy: 'Fast battery drain? Get your power back.', icon: 'battery', tone: 'green', image: '/assets/cutouts/battery-repair.png' },
        { title: 'Laptop Screen Repair', price: 'Free quote', copy: 'Cracked or flickering display? We fix it fast.', icon: 'laptop', tone: 'blue', image: '/assets/cutouts/laptop-repair.png' },
        { title: 'Laptop Battery Replacement', price: 'Free quote', copy: 'Short battery life? Get long-lasting performance.', icon: 'chip', tone: 'orange', image: '/assets/cutouts/ipad-repair.png' },
        { title: 'Camera Repair', price: 'Free quote', copy: 'Blurry photos? We fix camera issues quickly.', icon: 'camera', tone: 'pink', image: '/assets/cutouts/iphone.png' },
        { title: 'Tablet Repair', price: 'Free quote', copy: 'All tablet issues fixed quickly and beautifully.', icon: 'tablet', tone: 'cyan', image: '/assets/cutouts/ipad-repair.png' },
      ],
      testimonials: [
        ['reda salhaoui', 'Google Maps Review', 'Negozio ben fornito, personale disponibile e competente. Ottimo il servizio di riparazione: ho risparmiato evitando di cambiare telefono. Consigliato!'],
        ['mohamed arjdal', 'Google Maps Review', 'Omar e suo fratello sono due veri professionisti: gentili, preparati e sempre disponibili con i clienti.'],
        ['Marco Goria', 'Local Guide Review', 'Buona scelta di cellulari e apparecchiature elettroniche per tutti i gusti ed esigenze. Effettuano anche riparazioni a prezzi piu che onesti.'],
        ['LORENZO RUSSO', 'Charging Port Repair', 'Mi hanno sistemato il telefono, aggiustandomi l ingresso USB-C per la ricarica. Lavoro veloce e prezzo piu che onesto.'],
      ],
    },
    booking: {
      devices: appleDevices,
      repairIssues: [
        { key: 'screen', title: 'Screen Repair', copy: 'Cracked glass, broken OLED, dead pixels or touch issues.', icon: 'smartphone', tone: 'violet', image: '/images/ifixit/cutouts/iphone-17-pro-screen.png', availability: 'all' },
        { key: 'battery', title: 'Battery Replacement', copy: 'Fast drain, swollen battery, random shutdowns or poor health.', icon: 'battery', tone: 'green', image: '/images/ifixit/cutouts/iphone-17-pro-battery.png', availability: 'all' },
        { key: 'charging-port', title: 'Charging Port Repair', copy: 'Loose cable, port not charging, bent pins or debris damage.', icon: 'zap', tone: 'orange', image: '/images/ifixit/cutouts/iphone-17-pro-usbc.png', availability: 'all' },
        { key: 'camera', title: 'Camera Repair', copy: 'Blurry lens, shaking focus, black camera or broken camera glass.', icon: 'camera', tone: 'pink', image: '/images/ifixit/cutouts/iphone-17-pro-rear-camera.png', availability: 'all' },
        { key: 'water', title: 'Water Damage', copy: 'Liquid exposure, corrosion, no power or unstable behavior.', icon: 'water', tone: 'cyan', image: '/images/ifixit/cutouts/iphone-17-pro-opened.png', availability: 'all' },
        { key: 'back-glass', title: 'Back Glass Repair', copy: 'Cracked rear glass, damaged housing or exposed internal parts.', icon: 'smartphone', tone: 'violet', image: '/images/ifixit/cutouts/iphone-17-pro-back-glass.png', availability: 'modern-glass' },
        { key: 'face-id', title: 'Face ID / Sensors', copy: 'Front sensor, earpiece, TrueDepth or proximity sensor diagnostics.', icon: 'scan', tone: 'blue', image: '/images/ifixit/cutouts/iphone-17-pro-front-camera.png', availability: 'face-id' },
        { key: 'speaker', title: 'Speaker / Mic', copy: 'Low sound, distorted audio, muffled microphone or call problems.', icon: 'speaker', tone: 'orange', image: '/images/ifixit/cutouts/iphone-17-pro-front-camera.png', availability: 'all' },
        { key: 'buttons', title: 'Buttons / Switches', copy: 'Power, volume, mute, home button or action button problems.', icon: 'settings', tone: 'cyan', image: '/images/ifixit/cutouts/iphone-17-pro-tools.png', availability: 'legacy' },
        { key: 'software', title: 'Software Issue', copy: 'Boot loop, slow system, frozen apps or update problems.', icon: 'settings', tone: 'blue', image: '/images/ifixit/cutouts/iphone-17-pro-tools.png', availability: 'all' },
        { key: 'accessory', title: 'Accessory Help', copy: 'Cases, cables, chargers, adapters and compatibility support.', icon: 'box', tone: 'green', image: '/images/phones/apple/iphone-accessories.png', availability: 'accessory' },
        { key: 'other', title: 'Other Issue', copy: 'Not sure yet? We inspect the device and identify the fault.', icon: 'dots', tone: 'violet', image: '/images/ifixit/cutouts/iphone-17-pro-opened.png', availability: 'all' },
      ],
    },
    reviews: {
      stats: [
        { value: '4.7', label: 'Average Rating', copy: 'Based on 23 Google reviews', icon: 'shield', tone: 'violet' },
        { value: '23', label: 'Google Reviews', copy: 'Real Omar Phone customers', icon: 'message-circle', tone: 'pink' },
        { value: '20', label: '5-Star Reviews', copy: 'Customers recommend Omar Phone', icon: 'star', tone: 'blue' },
        { value: '3 mo', label: 'Recent Feedback', copy: 'Latest public review activity', icon: 'clock', tone: 'orange' },
      ],
      reviews: [
        { name: 'reda salhaoui', date: '3 mesi fa', copy: 'Negozio ben fornito, personale disponibile e competente. Ottimo il servizio di riparazione: ho risparmiato evitando di cambiare telefono. Consigliato!', stars: '★★★★★', service: 'Google Maps Review', icon: 'smartphone', tone: 'violet', avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjXNlvlFr5WY2kzyfCL16rSjYjqK68Cg9DtnSXTm4KNmDqqLJhk=w96-h96-p-rp-mo-br100' },
        { name: 'mohamed arjdal', date: '3 mesi fa', copy: 'Omar e suo fratello sono due veri professionisti: gentili, preparati e sempre disponibili con i clienti.', stars: '★★★★★', service: 'Google Maps Review', icon: 'laptop', tone: 'pink', avatar: 'https://lh3.googleusercontent.com/a/ACg8ocK_ISa5ZG712AeceHfgAacWkCKcdTp1RmJPrBx-BkrmWEr42A=w96-h96-p-rp-mo-br100' },
        { name: 'Marco Goria', date: '2 anni fa', copy: 'Buona scelta di cellulari e apparecchiature elettroniche per tutti i gusti ed esigenze. Effettuano anche riparazioni a prezzi piu che onesti.', stars: '★★★★★', service: 'Local Guide Review', icon: 'battery', tone: 'blue', avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjUeJpgE3I3g_z5S7Bo8Ha-a2BS0JGt1qbWatb54ZiHrACS67O4=w96-h96-p-rp-mo-ba4-br100' },
        { name: 'LORENZO RUSSO', date: '3 settimane fa', copy: 'Mi hanno sistemato il telefono, aggiustandomi l ingresso USB-C per la ricarica. Lavoro veloce e prezzo piu che onesto.', stars: '★★★★★', service: 'Charging Port Repair', icon: 'zap', tone: 'pink', avatar: '' },
        { name: 'Daniele Palmisano', date: '2 mesi fa', copy: 'Ho portato il mio iPhone 12 dopo un incidente: Omar e stato meraviglioso e mi ha aiutato quando il telefono mi serviva subito.', stars: '★★★★★', service: 'iPhone Repair Review', icon: 'smartphone', tone: 'violet', avatar: '' },
      ],
    },
    blogs: {
      posts: [
        { slug: '5-signs-you-need-a-new-phone-screen', title: '5 Signs You Need a New Phone Screen', copy: 'Cracked screen or unresponsive touch? Here are the top signs it is time for a professional repair.', date: 'May 20, 2026', tag: 'Tips & Tricks', category: 'Tips & Tricks', tags: ['iPhone Repair', 'Screen Repair', 'Cracked Screen', 'Tech Tips'], tone: 'violet', image: '/assets/cutouts/screen-repair.png' },
        { slug: 'how-to-extend-your-phone-battery-life', title: 'How to Extend Your Phone Battery Life', copy: 'Simple habits that help your battery last longer and keep your phone running smoothly every day.', date: 'May 18, 2026', tag: 'Guides', category: 'Device Care', tags: ['Battery Tips', 'iPhone Repair', 'Device Care', 'Tech Tips'], tone: 'green', image: '/assets/cutouts/battery-repair.png' },
        { slug: 'laptop-overheating-what-to-do', title: 'Laptop Overheating? Here is What to Do', copy: 'Learn common causes, quick fixes, and when to seek expert laptop repair support.', date: 'May 15, 2026', tag: 'Repair Guide', category: 'Repair Guides', tags: ['Laptop Fix', 'Device Care', 'Tech Tips'], tone: 'orange', image: '/assets/cutouts/laptop-repair.png' },
        { slug: 'camera-repair-services', title: 'We Now Offer Camera Repair Services', copy: 'Blurry photos or damaged lenses? Our experts can bring your camera back to life.', date: 'May 12, 2026', tag: 'News', category: 'News & Updates', tags: ['Camera Repair', 'iPhone Repair', 'Tech Tips'], tone: 'pink', image: '/assets/cutouts/iphone.png' },
        { slug: 'when-should-you-replace-your-laptop-battery', title: 'When Should You Replace Your Laptop Battery?', copy: 'Short battery life? Find out when it is time to replace your laptop battery.', date: 'May 8, 2026', tag: 'Guides', category: 'Device Care', tags: ['Battery Tips', 'Laptop Fix', 'Device Care'], tone: 'green', image: '/assets/cutouts/ipad-repair.png' },
        { slug: 'how-to-fix-slow-phone-performance', title: 'How to Fix Slow Phone Performance', copy: 'Is your phone lagging? Try these simple tricks to boost performance instantly.', date: 'May 5, 2026', tag: 'Tips & Tricks', category: 'Troubleshooting', tags: ['iPhone Repair', 'Device Care', 'Tech Tips'], tone: 'violet', image: '/assets/cutouts/battery-repair.png' },
        { slug: 'camera-not-working-quick-fix-guide', title: 'Camera Not Working? Quick Fix Guide', copy: 'Blurry or broken camera? Learn how to troubleshoot and fix camera issues.', date: 'May 2, 2026', tag: 'Repair Guide', category: 'Troubleshooting', tags: ['Camera Repair', 'iPhone Repair', 'Tech Tips'], tone: 'orange', image: '/assets/cutouts/iphone.png' },
        { slug: 'water-damage-repair-what-you-must-do-first', title: 'Water Damage Repair: What You Must Do First', copy: 'Dropped your phone in water? Follow these steps immediately to save it.', date: 'Apr 28, 2026', tag: 'News', category: 'Troubleshooting', tags: ['Water Damage', 'iPhone Repair', 'Repair Guides'], tone: 'pink', image: '/assets/cutouts/screen-repair.png' },
        { slug: 'best-ways-to-protect-your-phone-screen', title: 'Best Ways to Protect Your Phone Screen', copy: 'Avoid costly repairs with these simple tips to protect your screen.', date: 'Apr 25, 2026', tag: 'Tips & Tricks', category: 'Device Care', tags: ['Screen Repair', 'Cracked Screen', 'Device Care'], tone: 'violet', image: '/assets/cutouts/screen-repair.png' },
        { slug: 'why-fast-charging-damages-your-battery', title: 'Why Fast Charging Damages Your Battery', copy: 'Is fast charging safe? Learn how it affects your battery lifespan.', date: 'Apr 22, 2026', tag: 'Guides', category: 'Device Care', tags: ['Battery Tips', 'Device Care', 'Tech Tips'], tone: 'green', image: '/assets/cutouts/battery-repair.png' },
        { slug: 'tablet-not-charging-try-these-fixes', title: 'Tablet Not Charging? Try These Fixes', copy: 'Tablet will not charge? Here are common causes and easy solutions.', date: 'Apr 18, 2026', tag: 'Repair Guide', category: 'Repair Guides', tags: ['Tablet Repair', 'Battery Tips', 'Troubleshooting'], tone: 'orange', image: '/assets/cutouts/ipad-repair.png' },
        { slug: 'signs-your-device-needs-professional-repair', title: 'Signs Your Device Needs Professional Repair', copy: 'Not sure if your device needs repair? These warning signs will help.', date: 'Apr 15, 2026', tag: 'News', category: 'Repair Guides', tags: ['Device Care', 'Tech Tips', 'Troubleshooting'], tone: 'pink', image: '/assets/cutouts/fix-it.png' },
      ],
    },
    beforeAfter: {
      repairs: [
        { device: 'iPhone 16 Pro Max', service: 'Back Glass Repair', copy: 'Damaged back housing restored with a clean premium finish.', time: '2 Hours', tone: 'violet', beforeImage: '/images/before and after/iphone before.png', afterImage: '/images/before and after/iphone after.png', kind: 'Phone' },
        { device: 'MacBook Air M2', service: 'Screen Replacement', copy: 'Flickering and dim display replaced with a brand new one.', time: '4 Hours', tone: 'pink', beforeImage: '/images/before and after/Macbook air before.jpg', afterImage: '/images/before and after/Macbook air after.jpg', kind: 'Laptop' },
        { device: 'iPad Pro 2020', service: 'Screen Replacement', copy: 'Broken tablet display replaced and tested for touch response.', time: '4 Hours', tone: 'blue', beforeImage: '/images/before and after/ipad screen before.png', afterImage: '/images/before and after/ipad screen after.png', kind: 'Tablet' },
        { device: 'Apple Watch Ultra', service: 'Screen Replacement', copy: 'Deep scratches removed, display looks crystal clear.', time: '1 Hour', tone: 'orange', beforeImage: '/images/before and after/apple watch before.png', afterImage: '/images/before and after/apple watch after.png', kind: 'Smartwatch' },
      ],
      testimonials: [
        ['reda salhaoui', 'Google Maps Review', 'Negozio ben fornito, personale disponibile e competente. Ottimo il servizio di riparazione: ho risparmiato evitando di cambiare telefono. Consigliato!'],
        ['mohamed arjdal', 'Google Maps Review', 'Omar e suo fratello sono due veri professionisti: gentili, preparati e sempre disponibili con i clienti.'],
        ['Marco Goria', 'Local Guide Review', 'Buona scelta di cellulari e apparecchiature elettroniche per tutti i gusti ed esigenze. Effettuano anche riparazioni a prezzi piu che onesti.'],
        ['LORENZO RUSSO', 'Charging Port Repair', 'Mi hanno sistemato il telefono, aggiustandomi l ingresso USB-C per la ricarica. Lavoro veloce e prezzo piu che onesto.'],
      ],
    },
    services: {
      heroTrust: [
        { title: 'Skilled Technicians', copy: '', icon: 'shield', tone: 'violet' },
        { title: 'Premium Quality Parts', copy: '', icon: 'badge', tone: 'pink' },
        { title: 'Fast Turnaround', copy: '', icon: 'clock', tone: 'violet' },
      ],
      services: [
        { title: 'Phone Screen Repair', copy: 'Cracked or broken screen? We will make it look brand new.', price: 'Free quote', image: '/assets/cutouts/screen-repair.png', icon: 'smartphone', tone: 'violet' },
        { title: 'Phone Battery Replacement', copy: 'Fast battery drain? Get your power back.', price: 'Free quote', image: '/assets/cutouts/battery-repair.png', icon: 'battery', tone: 'green' },
        { title: 'Laptop Screen Repair', copy: 'Cracked or flickering display? We fix it fast.', price: 'Free quote', image: '/assets/cutouts/laptop-repair.png', icon: 'laptop', tone: 'blue' },
        { title: 'Laptop Battery Replacement', copy: 'Short battery life? Get long-lasting performance.', price: 'Free quote', image: '/assets/cutouts/ipad-repair.png', icon: 'settings', tone: 'orange' },
        { title: 'Camera Repair', copy: 'Blurry photos? We fix camera issues quickly.', price: 'Free quote', image: '/assets/cutouts/iphone.png', icon: 'camera', tone: 'pink' },
        { title: 'Tablet Repair', copy: 'All tablet issues fixed quickly and beautifully.', price: 'Free quote', image: '/assets/cutouts/ipad-repair.png', icon: 'tablet', tone: 'cyan' },
      ],
      trustFeatures: [
        { title: 'Warranty on All Repairs', copy: 'We stand by our work. All repairs come with warranty for your peace of mind.', icon: 'shield', tone: 'violet' },
        { title: 'Quick Turnaround', copy: 'Most repairs are completed on the same day. Get back to what matters.', icon: 'clock', tone: 'pink' },
        { title: 'Data Protection', copy: 'Your data is 100% safe with our secure repair process.', icon: 'lock', tone: 'violet' },
        { title: 'Premium Quality Parts', copy: 'We use high-quality parts for lasting performance and reliability.', icon: 'badge', tone: 'violet' },
      ],
      process: [
        { title: 'Device Check-in', copy: 'We inspect your device and understand the issue.', icon: 'clipboard', tone: 'violet' },
        { title: 'Diagnosis', copy: 'Our experts run a complete diagnostic and provide a quote.', icon: 'search', tone: 'violet' },
        { title: 'Repair', copy: 'We repair your device using premium quality parts and tools.', icon: 'tools', tone: 'violet' },
        { title: 'Quality Check', copy: 'Multi-point testing to ensure your device works perfectly.', icon: 'shield', tone: 'violet' },
        { title: 'Ready for Pickup', copy: 'We return your device good as new.', icon: 'box', tone: 'violet' },
      ],
    },
    support: {
      faqs: [
        { question: 'How long does a typical repair take?', answer: 'Most repairs are completed within 30 minutes to 2 hours depending on the issue.' },
        { question: 'Do you offer warranty on repairs?', answer: 'Yes. All our repairs come with a warranty. Duration depends on the type of repair.' },
        { question: 'How can I track my repair status?', answer: 'You can track your repair in real-time using our Track Repair page.' },
        { question: 'Do I need to book an appointment?', answer: 'Walk-ins are welcome, but booking an appointment saves your time.' },
        { question: 'What payment methods do you accept?', answer: 'We accept cash, all major credit/debit cards, and digital payments.' },
        { question: 'Can I get a quote before the repair?', answer: 'Absolutely. Book a repair or visit our store and we will confirm a free quote before starting.' },
      ],
      quickActions: [
        { title: 'Track Your Repair', copy: 'Send your repair ID to support', icon: 'box', tone: 'violet', href: 'https://wa.me/393298571129' },
        { title: 'Free Repair Quote', copy: 'Ask for a diagnosis', icon: 'message-circle', tone: 'blue', href: '/book' },
        { title: 'Device Health Check', copy: 'Check your device status', icon: 'activity', tone: 'orange', href: '/book' },
        { title: 'Book a Repair', copy: 'Schedule an appointment', icon: 'calendar', tone: 'pink', href: '/book' },
      ],
      contactInfo: [
        { title: '+39 329 857 1129', copy: 'Mon - Sat : 9:00 AM - 7:00 PM', icon: 'phone', tone: 'violet', href: 'tel:+393298571129' },
        { title: 'hello@omarphone.com', copy: 'We reply within 15 minutes', icon: 'mail', tone: 'violet', href: 'mailto:hello@omarphone.com' },
        { title: '123 Tech Avenue', copy: 'Casablanca, 20000 Morocco', icon: 'map-pin', tone: 'violet', href: 'https://maps.google.com' },
      ],
    },
  };
}
