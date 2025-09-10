import { Router } from 'express';
import {
  fetchShortenedUrl,
  createShortenedUrl,
  redirectToShortenedUrl,
  fetchShortenedUrlEditPage,
  editShortenedUrl,
  deleteShortenedUrl,
} from '../controllers/shortener.controller.js';

const router = Router();

// Fetch the main page, create a new shortened URL, and redirect to the original URL
router.get('/', fetchShortenedUrl);
router.post('/', createShortenedUrl);
router.get('/:shortCode', redirectToShortenedUrl);

// Additional routes for editing and deleting shortened URLs
router.get('/edit/:id', fetchShortenedUrlEditPage);
router.post('/edit/:id', editShortenedUrl);
router.post('/delete/:id', deleteShortenedUrl);

export const shortenerRoute = router;
