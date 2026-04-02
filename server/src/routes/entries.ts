import { Router } from 'express';
import { createPost, getPost, getAllPosts, updatePost, deletePost, setPostTaxonomies, getPostTaxonomies } from '../db/tenantQueries.js';
import { createPostSchema, updatePostSchema } from '@chronicles/shared';
import { parseId } from '../middleware/parseId.js';

const router = Router();

// Helper to serialize Buffer/Uint8Array fields to base64 for JSON response
function serializePost(post: Record<string, unknown>) {
  const result = { ...post };
  for (const key of ['contentEncrypted', 'contentIv', 'metadataEncrypted', 'metadataIv']) {
    const val = result[key];
    if (val instanceof Uint8Array || val instanceof Buffer) {
      result[key] = Buffer.from(val).toString('base64');
    }
  }
  return result;
}

// GET /api/entries — Get all entries
router.get('/', async (req, res) => {
  try {
    const posts = await getAllPosts(req.auth!.tenantSchemaName);
    res.json(posts.map(p => serializePost(p as unknown as Record<string, unknown>)));
  } catch (err) {
    console.error('Get entries error:', err);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// POST /api/entries — Create entry
router.post('/', async (req, res) => {
  try {
    const parsed = createPostSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { taxonomyIds, ...postData } = parsed.data;
    const input: Record<string, unknown> = {};

    if (postData.isEncrypted) {
      input.isEncrypted = true;
      input.contentEncrypted = postData.contentEncrypted ? Buffer.from(postData.contentEncrypted, 'base64') : undefined;
      input.contentIv = postData.contentIv ? Buffer.from(postData.contentIv, 'base64') : undefined;
      input.metadataEncrypted = postData.metadataEncrypted ? Buffer.from(postData.metadataEncrypted, 'base64') : undefined;
      input.metadataIv = postData.metadataIv ? Buffer.from(postData.metadataIv, 'base64') : undefined;
    } else {
      input.content = postData.content;
      input.metadata = postData.metadata;
    }

    const post = await createPost(req.auth!.tenantSchemaName, input as Parameters<typeof createPost>[1]);

    if (taxonomyIds?.length) {
      await setPostTaxonomies(req.auth!.tenantSchemaName, post.id, taxonomyIds);
    }

    res.status(201).json(serializePost(post as unknown as Record<string, unknown>));
  } catch (err) {
    console.error('Create entry error:', err);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// GET /api/entries/:id — Get single entry
router.get('/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ error: 'Invalid entry ID' }); return; }
    const post = await getPost(req.auth!.tenantSchemaName, id);
    if (!post) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    const taxonomies = await getPostTaxonomies(req.auth!.tenantSchemaName, id);
    res.json({ ...serializePost(post as unknown as Record<string, unknown>), taxonomies });
  } catch (err) {
    console.error('Get entry error:', err);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// PUT /api/entries/:id — Update entry
router.put('/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ error: 'Invalid entry ID' }); return; }
    const parsed = updatePostSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { taxonomyIds, ...updates } = parsed.data;
    const input: Record<string, unknown> = {};

    if (updates.contentEncrypted !== undefined) input.contentEncrypted = Buffer.from(updates.contentEncrypted, 'base64');
    if (updates.contentIv !== undefined) input.contentIv = Buffer.from(updates.contentIv, 'base64');
    if (updates.metadataEncrypted !== undefined) input.metadataEncrypted = Buffer.from(updates.metadataEncrypted, 'base64');
    if (updates.metadataIv !== undefined) input.metadataIv = Buffer.from(updates.metadataIv, 'base64');
    if (updates.content !== undefined) input.content = updates.content;
    if (updates.metadata !== undefined) input.metadata = updates.metadata;

    const post = await updatePost(req.auth!.tenantSchemaName, id, input as Parameters<typeof updatePost>[2]);

    if (taxonomyIds !== undefined) {
      await setPostTaxonomies(req.auth!.tenantSchemaName, id, taxonomyIds);
    }

    res.json(serializePost(post as unknown as Record<string, unknown>));
  } catch (err) {
    console.error('Update entry error:', err);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// DELETE /api/entries/:id — Delete entry
router.delete('/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ error: 'Invalid entry ID' }); return; }
    await deletePost(req.auth!.tenantSchemaName, id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete entry error:', err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

export default router;
