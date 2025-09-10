import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import requestIp from 'request-ip';
import { PORT } from './src/validators/env.validator.js';
import { verifyAuthentication } from './src/middlewares/verify-auth.middleware.js';
import { shortenerRoute } from './src/routes/shortener.route.js';
import { authRoutes } from './src/routes/auth.route.js';
import { scheduleCleanupJob } from './src/jobs/cleanupSessions.js';

// Initialize Express app
const app = express();

// Set views directory
const viewsPath = path.join(import.meta.dirname, 'src', 'views');

// Serve static files from the "public" directory
app.use(express.static('public'));

// Middleware to parse incoming requests with JSON payloads and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', viewsPath);

// Middleware for cookie parsing
app.use(cookieParser());

app.use(
  session({
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
    },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    maxAge: 1000 * 60 * 60, // 1 hour
  })
);

// Middleware for flash messages and request IP logging
app.use(flash());
app.use(requestIp.mw());

// Middleware to verify if the user is authenticated
app.use(verifyAuthentication);

// Custom middleware to set flash messages and user data in response locals
app.use((req, res, next) => {
  res.locals.user = req.user ?? null;
  return next();
});

// Routes
app.use(authRoutes);
app.use(shortenerRoute);

// Start cron job for session cleanup
scheduleCleanupJob();

// Start the server
app.listen(PORT, () => {
  console.log(`Listening to server at http://localhost:${PORT}/`);
});
