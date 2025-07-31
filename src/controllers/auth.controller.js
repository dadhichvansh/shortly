import {
  userLoginSchema,
  userRegistrationSchema,
} from "../validators/auth.validator.js";
import {
  comparePassword,
  createUser,
  doesUserExist,
  generateToken,
  hashPassword,
} from "../services/auth.service.js";

export const registerPage = (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("auth/register", { errors: req.flash("errors") });
};

export const userRegister = async (req, res) => {
  try {
    if (req.user) return res.redirect("/");

    const { success, data, error } = userRegistrationSchema.safeParse(req.body);

    if (!success) {
      const errors = error.errors[0].message;
      req.flash("errors", errors);
      res.redirect("/register");
    }

    const { name, email, password } = data;
    const hashedPassword = await hashPassword(password);
    const userExists = await doesUserExist(email);

    if (userExists) {
      req.flash("errors", "Email already registered. Please use another one.");
      return res.redirect("/register");
    }
    await createUser({ name, email, hashedPassword });

    res.redirect("/login");
  } catch (error) {
    console.error(error.message);
  }
};

export const loginPage = (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("auth/login", { errors: req.flash("errors") });
};

export const userLogin = async (req, res) => {
  try {
    if (req.user) return res.redirect("/");

    const { success, data, error } = userLoginSchema.safeParse(req.body);

    if (!success) {
      const errors = error.errors[0].message;
      req.flash("errors", errors);
      res.redirect("/login");
    }

    const { email, password } = data;
    const user = await doesUserExist(email);
    const verifyPassword = await comparePassword(user.password, password);

    if (!user || !verifyPassword) {
      req.flash("errors", "Invalid email or password. Please try again.");
      return res.redirect("/login");
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    res.cookie("access_token", token);
    res.redirect("/");
  } catch (error) {
    console.error(error.message);
  }
};

export const userLogout = (req, res) => {
  res.clearCookie("access_token");
  res.redirect("/login");
};

export const fetchProfile = (req, res) => {
  if (!req.user) return res.send("Please login first");
  return res.send(`<h1>Hey ${req.user.username} - ${req.user.email}</h1>`);
};
