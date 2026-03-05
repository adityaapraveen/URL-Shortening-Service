import { Router } from 'express';
import * as urlService from '../services/urlService.js';
import authenticate from '../middleware/authenticate.js';
import { asyncHandler, ValidationError } from '../utils/errors.js';

const router = Router();

// All URL routes require authentication
router.use(authenticate);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { original_url, custom_slug, title, expires_at } = req.body;

    const url = await urlService.createUrl(req.user.id, {
      original_url,
      custom_slug,
      title,
      expires_at,
    });

    res.status(201).json({ success: true, data: { url } });
  })
);
// Get all URLs for the authenticated user.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const urls = await urlService.getUserUrls(req.user.id);
    res.status(200).json({ success: true, data: { urls } });
  })
);

// Get a single URL by ID (must belong to the authenticated user).
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const url = await urlService.getUrlById(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: { url } });
  })
);

// Update a URL's title or active status.
// Body: { title?, is_active? }
//
// SENIOR DEV NOTE: We use PATCH not PUT. PUT replaces the entire resource.
// PATCH applies a partial update. Since we're only allowing title/is_active
// to be changed (not slug or original_url), PATCH is semantically correct.
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { title, is_active } = req.body;

    if (title === undefined && is_active === undefined) {
      throw new ValidationError('Provide at least one field to update: title or is_active.');
    }

    const url = await urlService.updateUrl(req.params.id, req.user.id, { title, is_active });
    res.status(200).json({ success: true, data: { url } });
  })
);


// Delete a URL and all its associated click data (cascade handled by DB).
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await urlService.deleteUrl(req.params.id, req.user.id);

    // 204 No Content — correct HTTP response for a successful delete with no body
    res.status(204).send();
  })
);

export default router;
