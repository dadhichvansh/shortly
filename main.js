import express from "express";
import path from "path";
import { PORT } from "./validation.js";
import { shortenerRoute } from "./src/routes/shortener.route.js";

const app = express();
const viewsPath = path.join(import.meta.dirname, "src", "views");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", viewsPath);

app.use(shortenerRoute);

app.listen(PORT, () => {
  console.log(`Listening to server on http://localhost:${PORT}/`);
});
