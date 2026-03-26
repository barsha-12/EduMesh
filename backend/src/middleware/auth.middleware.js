import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT access tokens.
 * Attaches decoded user payload to req.user on success.
 */
export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Access token required',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Access token expired',
      });
    }
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid access token',
    });
  }
}
