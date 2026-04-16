import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth_token;

  if (!token) return res.status(401).json({ user: null });

  try {
    const JWT_SECRET = process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) throw new Error('Auth missing');
    const user = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ user: null });
  }
}
