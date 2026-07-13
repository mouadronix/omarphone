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
  return CONTENT_RESOURCE_DEFINITIONS;
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

