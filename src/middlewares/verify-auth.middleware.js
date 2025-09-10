import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '../constants.js';
import {
  clearUserSession,
  findSessionById,
  refreshTokens,
  verifyJwt,
} from '../services/auth.service.js';

export const verifyAuthentication = async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  if (!accessToken && !refreshToken) {
    req.user = null;
    return next();
  }

  if (accessToken) {
    try {
      const decodedToken = verifyJwt(accessToken);
      req.user = decodedToken;
      return next();
    } catch (error) {
      console.error(
        'Error populating access_token to req.user:',
        error.message
      );
    }
  }

  if (refreshToken) {
    try {
      const { newAccessToken, newRefreshToken, user } = await refreshTokens(
        refreshToken
      );

      req.user = user;
      const baseConfig = { httpOnly: true, secure: true };

      res.cookie('access_token', newAccessToken, {
        ...baseConfig,
        maxAge: ACCESS_TOKEN_EXPIRY,
      });
      res.cookie('refresh_token', newRefreshToken, {
        ...baseConfig,
        maxAge: REFRESH_TOKEN_EXPIRY,
      });

      return next();
    } catch (error) {
      console.error('An error occurred while refreshing tokens:', error);

      // Cleanup DB session if refresh token expired/invalid
      try {
        const decoded = verifyJwt(refreshToken, { ignoreExpiration: true });

        if (decoded?.sessionId) {
          const session = await findSessionById(decoded.sessionId);

          if (session && session.expiresAt < new Date()) {
            await clearUserSession(decoded.sessionId);
          }
        }
      } catch (e) {
        console.error(
          'Failed to decode expired refresh token for cleanup:',
          e.message
        );
      }

      // Clear cookies and set user as null upon refresh failure
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      req.user = null;

      return next();
    }
  }

  req.user = null;
  return next();
};
