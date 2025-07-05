
import path from "path";
import express from "express";
import { PORT } from "./validation.js";
import { shortenerRoute } from "./routes/shortener.route.js";

const DATA_FILE = path.join("data", "links.json");
const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(shortenerRoute);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
