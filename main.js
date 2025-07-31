import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import { PORT } from "./validation.js";
import { verifyAuthentication } from "./src/middlewares/verify-auth.middleware.js";
import { shortenerRoute } from "./src/routes/shortener.route.js";
import { authRoutes } from "./src/routes/auth.route.js";

const app = express();
const viewsPath = path.join(import.meta.dirname, "src", "views");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", viewsPath);

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
  })
);

app.use(flash());

app.use(verifyAuthentication);
app.use((req, res, next) => {
  res.locals.user = req.user ?? null;
  return next();
});

app.use(authRoutes);
app.use(shortenerRoute);

app.listen(PORT, () => {
  console.log(`Listening to server on http://localhost:${PORT}/`);
});
