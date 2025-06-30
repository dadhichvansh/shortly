import { readFile, writeFile } from "fs/promises";
import { createServer } from "http";
import crypto from "crypto";
import path from "path";
import express from "express";
import { PORT } from "./validation.js";

const DATA_FILE = path.join("data", "links.json");
const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const loadLinks = async () => {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeFile(DATA_FILE, JSON.stringify({}));
      return {};
    }
    throw error;
  }
};

const saveLinks = async (links) => {
  await writeFile(DATA_FILE, JSON.stringify(links));
};

app.get("/", async (req, res) => {
  try {
    const file = await fs.readFile(path.join("public", "index.html"));
    const links = await loadLinks();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/", async (req, res) => {
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
  } catch (error) {}
});

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
