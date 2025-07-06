import crypto from "crypto";
import { loadLinks, saveLinks } from "../models/shortener.model.js";

const fetchShortenedUrl = async (req, res) => {
  try {
    const links = await loadLinks();

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
    const links = await loadLinks();

    if (links[finalShortCode]) {
      return res
        .status(400)
        .send("Short code already exists. Please choose another.");
    }

    links[finalShortCode] = url;
    await saveLinks(links);

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
};

const redirectToShortenedUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const links = await loadLinks();

    if (!links[shortCode]) return res.status(404).send("Page not found.");
    return res.redirect(links[shortCode]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
};

export { fetchShortenedUrl, createShortenedUrl, redirectToShortenedUrl };
