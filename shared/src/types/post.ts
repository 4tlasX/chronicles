import type { Taxonomy } from './taxonomy.js';

export interface Post {
  id: number;
  content: string | null;
  metadata: Record<string, unknown>;
  contentEncrypted: string | null;
  contentIv: string | null;
  metadataEncrypted: string | null;
  metadataIv: string | null;
  isEncrypted: boolean;
  createdAt: string;
  updatedAt: string;
  taxonomies?: Taxonomy[];
}

export interface CreatePostRequest {
  content?: string;
  metadata?: Record<string, unknown>;
  contentEncrypted?: string;
  contentIv?: string;
  metadataEncrypted?: string;
  metadataIv?: string;
  isEncrypted?: boolean;
  taxonomyIds?: number[];
}

export interface UpdatePostRequest {
  content?: string;
  metadata?: Record<string, unknown>;
  contentEncrypted?: string;
  contentIv?: string;
  metadataEncrypted?: string;
  metadataIv?: string;
  taxonomyIds?: number[];
}
