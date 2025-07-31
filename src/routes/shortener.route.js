import { Router } from "express";
import {
  fetchShortenedUrl,
  createShortenedUrl,
  redirectToShortenedUrl,
} from "../controllers/shortener.controller.js";

const router = Router();

router.get("/", fetchShortenedUrl);
router.post("/", createShortenedUrl);
router.get("/:shortCode", redirectToShortenedUrl);

export const shortenerRoute = router;
