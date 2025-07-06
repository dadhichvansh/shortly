import express from "express";
import { PORT } from "./validation.js";
import { shortenerRoute } from "./routes/shortener.route.js";

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(shortenerRoute);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
