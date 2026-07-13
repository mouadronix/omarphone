BEGIN;

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

WITH source_posts AS (
  SELECT
    post,
    ordinality - 1 AS sort_order
  FROM content_sections,
    jsonb_array_elements(payload_json->'posts') WITH ORDINALITY AS items(post, ordinality)
  WHERE section_key = 'blogs'
)
INSERT INTO blog_posts (
  slug,
  title,
  copy,
  post_date,
  tag,
  category,
  tone,
  image,
  author,
  status,
  views,
  published_at,
  sort_order,
  updated_at
)
SELECT
  post->>'slug',
  post->>'title',
  COALESCE(post->>'copy', ''),
  COALESCE(post->>'date', ''),
  COALESCE(post->>'tag', post->>'category', 'News'),
  COALESCE(post->>'category', post->>'tag', 'News'),
  COALESCE(post->>'tone', 'violet'),
  COALESCE(post->>'image', '/assets/cutouts/screen-repair.png'),
  COALESCE(post->>'author', 'OmarPhone Team'),
  COALESCE(post->>'status', 'Published'),
  COALESCE(NULLIF(post->>'views', '')::integer, 0),
  NULLIF(post->>'publishedAt', '')::timestamptz,
  sort_order,
  NOW()
FROM source_posts
WHERE post ? 'slug'
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

WITH source_tags AS (
  SELECT
    post->>'slug' AS post_slug,
    tag.value #>> '{}' AS tag,
    tag.ordinality - 1 AS sort_order
  FROM content_sections,
    jsonb_array_elements(payload_json->'posts') AS posts(post),
    jsonb_array_elements(COALESCE(post->'tags', jsonb_build_array(post->>'tag'))) WITH ORDINALITY AS tag(value, ordinality)
  WHERE section_key = 'blogs'
)
INSERT INTO blog_post_tags (post_slug, tag, sort_order)
SELECT post_slug, tag, sort_order
FROM source_tags
WHERE post_slug IS NOT NULL AND tag IS NOT NULL
ON CONFLICT (post_slug, tag) DO UPDATE SET
  sort_order = EXCLUDED.sort_order;

DELETE FROM content_sections
WHERE section_key = 'blogs';

COMMIT;
