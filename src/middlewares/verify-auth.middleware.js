import { verifyJwt } from "../services/auth.service.js";

export const verifyAuthentication = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decodedToken = verifyJwt(token);
    req.user = decodedToken;
  } catch (error) {
    req.user = null;
    console.error(error.message);
  }

  return next();
};
