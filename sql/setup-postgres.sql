BEGIN;

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  server_received_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  payload_json JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS content_sections (
  section_key TEXT PRIMARY KEY,
  payload_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  customized BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS blog_posts (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  copy TEXT NOT NULL,
  post_date TEXT NOT NULL,
  tag TEXT NOT NULL,
  category TEXT NOT NULL,
  tone TEXT NOT NULL,
  image TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'OmarPhone Team',
  status TEXT NOT NULL DEFAULT 'Published',
  views INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_slug TEXT NOT NULL REFERENCES blog_posts(slug) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (post_slug, tag)
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_post_date ON blog_posts(post_date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

INSERT INTO blog_posts (
  slug, title, copy, post_date, tag, category, tone, image,
  author, status, views, published_at, sort_order, updated_at
) VALUES
  ('laptop-overheating-what-to-do', 'Laptop Overheating? Here is What to Do', 'Learn common causes, quick fixes, and when to seek expert laptop repair support.', 'May 15, 2026', 'Repair Guide', 'Repair Guides', 'orange', '/assets/cutouts/laptop-repair.png', 'OmarPhone Team', 'Published', 0, NULL, 0, NOW()),
  ('camera-repair-services', 'We Now Offer Camera Repair Services', 'Blurry photos or damaged lenses? Our experts can bring your camera back to life.', 'May 12, 2026', 'News', 'News & Updates', 'pink', '/assets/cutouts/iphone.png', 'OmarPhone Team', 'Published', 0, NULL, 1, NOW()),
  ('when-should-you-replace-your-laptop-battery', 'When Should You Replace Your Laptop Battery?', 'Short battery life? Find out when it is time to replace your laptop battery.', 'May 8, 2026', 'Guides', 'Device Care', 'green', '/assets/cutouts/ipad-repair.png', 'OmarPhone Team', 'Published', 0, NULL, 2, NOW()),
  ('how-to-fix-slow-phone-performance', 'How to Fix Slow Phone Performance', 'Is your phone lagging? Try these simple tricks to boost performance instantly.', 'May 5, 2026', 'Tips & Tricks', 'Troubleshooting', 'violet', '/assets/cutouts/battery-repair.png', 'OmarPhone Team', 'Published', 0, NULL, 3, NOW()),
  ('camera-not-working-quick-fix-guide', 'Camera Not Working? Quick Fix Guide', 'Blurry or broken camera? Learn how to troubleshoot and fix camera issues.', 'May 2, 2026', 'Repair Guide', 'Troubleshooting', 'orange', '/assets/cutouts/iphone.png', 'OmarPhone Team', 'Published', 0, NULL, 4, NOW()),
  ('water-damage-repair-what-you-must-do-first', 'Water Damage Repair: What You Must Do First', 'Dropped your phone in water? Follow these steps immediately to save it.', 'Apr 28, 2026', 'News', 'Troubleshooting', 'pink', '/assets/cutouts/screen-repair.png', 'OmarPhone Team', 'Published', 0, NULL, 5, NOW()),
  ('best-ways-to-protect-your-phone-screen', 'Best Ways to Protect Your Phone Screen', 'Avoid costly repairs with these simple tips to protect your screen.', 'Apr 25, 2026', 'Tips & Tricks', 'Device Care', 'violet', '/assets/cutouts/screen-repair.png', 'OmarPhone Team', 'Published', 0, NULL, 6, NOW()),
  ('why-fast-charging-damages-your-battery', 'Why Fast Charging Damages Your Battery', 'Is fast charging safe? Learn how it affects your battery lifespan.', 'Apr 22, 2026', 'Guides', 'Device Care', 'green', '/assets/cutouts/battery-repair.png', 'OmarPhone Team', 'Published', 0, NULL, 7, NOW()),
  ('tablet-not-charging-try-these-fixes', 'Tablet Not Charging? Try These Fixes', 'Tablet will not charge? Here are common causes and easy solutions.', 'Apr 18, 2026', 'Repair Guide', 'Repair Guides', 'orange', '/assets/cutouts/ipad-repair.png', 'OmarPhone Team', 'Published', 0, NULL, 8, NOW()),
  ('signs-your-device-needs-professional-repair', 'Signs Your Device Needs Professional Repair', 'Not sure if your device needs repair? These warning signs will help.', 'Apr 15, 2026', 'News', 'Repair Guides', 'pink', '/assets/cutouts/fix-it.png', 'OmarPhone Team', 'Published', 0, NULL, 9, NOW())
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  copy = EXCLUDED.copy,
  post_date = EXCLUDED.post_date,
  tag = EXCLUDED.tag,
  category = EXCLUDED.category,
  tone = EXCLUDED.tone,
  image = EXCLUDED.image,
  author = EXCLUDED.author,
  status = EXCLUDED.status,
  views = EXCLUDED.views,
  published_at = EXCLUDED.published_at,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

DELETE FROM blog_post_tags
WHERE post_slug IN (
  'laptop-overheating-what-to-do',
  'camera-repair-services',
  'when-should-you-replace-your-laptop-battery',
  'how-to-fix-slow-phone-performance',
  'camera-not-working-quick-fix-guide',
  'water-damage-repair-what-you-must-do-first',
  'best-ways-to-protect-your-phone-screen',
  'why-fast-charging-damages-your-battery',
  'tablet-not-charging-try-these-fixes',
  'signs-your-device-needs-professional-repair'
);

INSERT INTO blog_post_tags (post_slug, tag, sort_order) VALUES
  ('laptop-overheating-what-to-do', 'Laptop Fix', 0),
  ('laptop-overheating-what-to-do', 'Device Care', 1),
  ('laptop-overheating-what-to-do', 'Tech Tips', 2),
  ('camera-repair-services', 'Camera Repair', 0),
  ('camera-repair-services', 'iPhone Repair', 1),
  ('camera-repair-services', 'Tech Tips', 2),
  ('when-should-you-replace-your-laptop-battery', 'Battery Tips', 0),
  ('when-should-you-replace-your-laptop-battery', 'Laptop Fix', 1),
  ('when-should-you-replace-your-laptop-battery', 'Device Care', 2),
  ('how-to-fix-slow-phone-performance', 'iPhone Repair', 0),
  ('how-to-fix-slow-phone-performance', 'Device Care', 1),
  ('how-to-fix-slow-phone-performance', 'Tech Tips', 2),
  ('camera-not-working-quick-fix-guide', 'Camera Repair', 0),
  ('camera-not-working-quick-fix-guide', 'iPhone Repair', 1),
  ('camera-not-working-quick-fix-guide', 'Tech Tips', 2),
  ('water-damage-repair-what-you-must-do-first', 'Water Damage', 0),
  ('water-damage-repair-what-you-must-do-first', 'iPhone Repair', 1),
  ('water-damage-repair-what-you-must-do-first', 'Repair Guides', 2),
  ('best-ways-to-protect-your-phone-screen', 'Screen Repair', 0),
  ('best-ways-to-protect-your-phone-screen', 'Cracked Screen', 1),
  ('best-ways-to-protect-your-phone-screen', 'Device Care', 2),
  ('why-fast-charging-damages-your-battery', 'Battery Tips', 0),
  ('why-fast-charging-damages-your-battery', 'Device Care', 1),
  ('why-fast-charging-damages-your-battery', 'Tech Tips', 2),
  ('tablet-not-charging-try-these-fixes', 'Tablet Repair', 0),
  ('tablet-not-charging-try-these-fixes', 'Battery Tips', 1),
  ('tablet-not-charging-try-these-fixes', 'Troubleshooting', 2),
  ('signs-your-device-needs-professional-repair', 'Device Care', 0),
  ('signs-your-device-needs-professional-repair', 'Tech Tips', 1),
  ('signs-your-device-needs-professional-repair', 'Troubleshooting', 2)
ON CONFLICT (post_slug, tag) DO UPDATE SET
  sort_order = EXCLUDED.sort_order;

DELETE FROM content_sections
WHERE section_key = 'blogs';

COMMIT;
