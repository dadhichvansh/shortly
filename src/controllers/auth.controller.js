import {
  userLoginSchema,
  userRegistrationSchema,
  verifyEmailSchema,
  verifyUserSchema,
} from '../validators/auth.validator.js';
import {
  createUserSession,
  clearEmailVerificationTokens,
  clearUserSession,
  comparePassword,
  createUser,
  doesUserExist,
  findEmailVerificationToken,
  findUserById,
  hashPassword,
  sendNewEmailVerificationLink,
  updateUserByName,
  verifyUserEmailAndUpdate,
} from '../services/auth.service.js';
import { fetchShortenedUrls } from '../services/shortener.service.js';

export const registerPage = (req, res) => {
  if (req.user) return res.redirect('/');
  return res.render('auth/register', { errors: req.flash('errors') });
};

export const userRegister = async (req, res) => {
  try {
    if (req.user) return res.redirect('/');

    const { success, data, error } = userRegistrationSchema.safeParse(req.body);

    if (!success) {
      const errors = error.errors[0].message;
      req.flash('errors', errors);
      res.redirect('/register');
    }

    const { name, email, password } = data;
    const hashedPassword = await hashPassword(password);
    const userExists = await doesUserExist(email);

    if (userExists) {
      req.flash('errors', 'Email already registered. Please use another one.');
      return res.redirect('/register');
    }

    const [user] = await createUser({ name, email, hashedPassword });

    // creating a session
    await createUserSession({ req, res, user, name, email });
    await sendNewEmailVerificationLink({ userId: user.id, email });

    res.redirect('/');
  } catch (error) {
    console.error(error.message);
  }
};

export const loginPage = (req, res) => {
  if (req.user) return res.redirect('/');
  return res.render('auth/login', { errors: req.flash('errors') });
};

export const userLogin = async (req, res) => {
  try {
    if (req.user) return res.redirect('/');

    const { success, data, error } = userLoginSchema.safeParse(req.body);

    if (!success) {
      const errors = error.errors[0].message;
      req.flash('errors', errors);
      res.redirect('/login');
    }

    const { email, password } = data;
    const user = await doesUserExist(email);
    const verifiedPassword = await comparePassword(user.password, password);

    if (!user || !verifiedPassword) {
      req.flash('errors', 'Invalid email or password. Please try again.');
      return res.redirect('/login');
    }

    // creating a session
    await createUserSession({ req, res, user });

    res.redirect('/');
  } catch (error) {
    console.error(error.message);
  }
};

export const userLogout = async (req, res) => {
  try {
    await clearUserSession(req.user.sessionId);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.redirect('/login');
  } catch (error) {
    console.error('Error occurred while logging out:', error.message);
  }
};

export const fetchProfilePage = async (req, res) => {
  try {
    if (!req.user) return res.redirect('/login');

    const user = await findUserById(req.user.id);

    if (!user) return res.redirect('/login');

    const userShortLinks = await fetchShortenedUrls(user.id);

    res.render('auth/profile', {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isEmailValid: user.isEmailValid,
        createdAt: user.createdAt,
        links: userShortLinks,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error.message);
  }
};

export const fetchEditProfilePage = async (req, res) => {
  try {
    if (!req.user) return res.redirect('/login');
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).send('User not found.');

    res.render('auth/edit-profile', {
      name: user.username,
      errors: req.flash('errors'),
    });
  } catch (error) {
    console.error('Error fetching edit profile:', error.message);
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    if (!req.user) return res.redirect('/login');

    const { success, data, error } = verifyUserSchema.safeParse(req.body);

    if (!success) {
      const errors = error.errors[0].message;
      req.flash('errors', errors);
      return res.redirect('/edit-profile');
    }

    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).send('User not found.');

    // Update user profile logic here
    await updateUserByName({ id: req.user.id, name: data.name });

    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating profile:', error.message);
  }
};

export const fetchVerifyEmailPage = async (req, res) => {
  if (!req.user) return res.redirect('/');
  const user = await findUserById(req.user.id);
  if (!user || user.isEmailValid) return res.redirect('/');

  res.render('auth/verify-email', {
    email: req.user.email,
  });
};

export const resendVerificationLink = async (req, res) => {
  if (!req.user) return res.redirect('/');
  const user = await findUserById(req.user.id);
  if (!user || user.isEmailValid) return res.redirect('/');

  await sendNewEmailVerificationLink({
    userId: req.user.id,
    email: req.user.email,
  });

  res.redirect('/verify-email');
};

export const verifyEmailToken = async (req, res) => {
  const { data, error } = verifyEmailSchema.safeParse(req.query);

  if (error) return res.send('Verification link invalid or expired!');

  const [token] = await findEmailVerificationToken(data);

  await verifyUserEmailAndUpdate(token.email);
  clearEmailVerificationTokens(token.email).catch(console.error);

  return res.redirect('/profile');
};
