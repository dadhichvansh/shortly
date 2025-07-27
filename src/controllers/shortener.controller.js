import crypto from "crypto";
import {
  fetchShortenedUrls,
  fetchShortenedUrlByShortCode,
  saveShortenedUrl,
} from "../services/shortener.service.js";

const fetchShortenedUrl = async (req, res) => {
  try {
    const links = await fetchShortenedUrls();
    res.render("index", { links, host: req.host });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
};

const createShortenedUrl = async (req, res) => {
  try {
    const { url, shortCode } = req.body;

    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");
    const link = await fetchShortenedUrlByShortCode(shortCode);

    if (link) {
      return res
        .status(400)
        .send("Short code already exists. Try choosing another.");
    }

    await saveShortenedUrl({ url, finalShortCode });

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
};

const redirectToShortenedUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const link = await fetchShortenedUrlByShortCode(shortCode);

    if (!link) return res.status(404).send("Page not found.");
    return res.redirect(link.url);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
};

export { fetchShortenedUrl, createShortenedUrl, redirectToShortenedUrl };
