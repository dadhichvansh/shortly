import { Router } from "express";
import {
  fetchShortenedUrl,
  createShortenedUrl,
  redirectToShortenedUrl,
} from "../controllers/shortener.controller.js";

const shortenerRoute = Router();

shortenerRoute.get("/", fetchShortenedUrl);
shortenerRoute.post("/", createShortenedUrl);
shortenerRoute.get("/:shortCode", redirectToShortenedUrl);

export { shortenerRoute };
