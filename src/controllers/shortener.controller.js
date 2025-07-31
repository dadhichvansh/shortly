import crypto from "crypto";
import {
  fetchShortenedUrls,
  fetchShortenedUrlByShortCode,
  saveShortenedUrl,
  findShortLinkById,
  updateShortCode,
  deleteShortenedUrlById,
} from "../services/shortener.service.js";
import { z } from "zod";

export const fetchShortenedUrl = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const links = await fetchShortenedUrls(req.user.id);

    res.render("index", { links, host: req.host, errors: req.flash("errors") });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
};

export const createShortenedUrl = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const { url, shortCode } = req.body;
    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");
    const link = await fetchShortenedUrlByShortCode(shortCode);

    if (link) {
      // return res
      //   .status(400)
      //   .send("Short code already exists. Try choosing another.");
      req.flash(
        "errors",
        "URL with that short code already exists, please choose another."
      );
      return res.redirect("/");
    }

    await saveShortenedUrl({
      url,
      shortCode: finalShortCode,
      userId: req.user.id,
    });

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
};

export const redirectToShortenedUrl = async (req, res) => {
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

export const fetchShortenedUrlEditPage = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const { data: id, error } = z.coerce
      .number()
      .int()
      .safeParse(req.params.id);

    if (error) return res.redirect("/404");

    const shortLink = await findShortLinkById(id);
    if (!shortLink) return res.redirect("/404");

    res.render("edit-shortLink", {
      id: shortLink.id,
      url: shortLink.url,
      shortCode: shortLink.shortCode,
      errors: req.flash("errors"),
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error.");
  }
};

export const editShortenedUrl = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const { data: id, error } = z.coerce
      .number()
      .int()
      .safeParse(req.params.id);

    if (error) return res.redirect("/404");

    const { url, shortCode } = req.body;
    const newUpdatedShortCode = await updateShortCode({ id, url, shortCode });

    if (!newUpdatedShortCode) return res.redirect("/404");
    res.redirect("/");
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      req.flash("errors", "Shortcode already exists, please choose another.");
      return res.redirect(`/edit/${id}`);
    }

    console.error(error.message);
    return res.status(500).send("Internal server error.");
  }
};

export const deleteShortenedUrl = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const { data: id, error } = z.coerce
      .number()
      .int()
      .safeParse(req.params.id);

    if (error) return res.redirect("/404");

    await deleteShortenedUrlById(id);
    res.redirect("/");
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal server error.");
  }
};
