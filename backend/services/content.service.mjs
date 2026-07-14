import { CONTENT_RESOURCE_DEFINITIONS, CONTENT_RESOURCES } from '../content-tables.mjs';
import {
  deleteContentSection,
  deleteContentTableRow,
  listContentTables,
  readContentSections,
  readContentTableRows,
  readMergedSiteContent,
  upsertContentSection,
  upsertContentTableRow,
} from '../../api/_store.mjs';

export function listContentResources() {
  return [
    {
      key: 'blogs',
      endpoint: '/api/blogs',
      section: 'blogs',
      property: 'posts',
      table: 'blog_posts',
      columns: ['slug', 'title', 'copy', 'date', 'tag', 'category', 'tags', 'tone', 'image', 'author', 'status', 'views', 'publishedAt'],
      idField: 'slug',
    },
    ...CONTENT_RESOURCE_DEFINITIONS,
  ];
}

export function findContentResourceTable(resourceName) {
  return CONTENT_RESOURCES[resourceName] ?? null;
}

export {
  deleteContentSection,
  deleteContentTableRow,
  listContentTables,
  readContentSections,
  readContentTableRows,
  readMergedSiteContent,
  upsertContentSection,
  upsertContentTableRow,
};
