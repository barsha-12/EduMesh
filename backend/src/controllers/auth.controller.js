import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

// ─── Zod Schemas ──────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['STUDENT', 'MENTOR', 'ADMIN', 'NGO']).optional().default('STUDENT'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  language: z.string().optional().default('en'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// ─── Helpers ──────────────────────────────────────────────

/**
 * Generate access and refresh JWT tokens
 * @param {{ id: string, email: string, role: string }} user
 * @returns {{ accessToken: string, refreshToken: string }}
 */
function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
}

// OTP store (in production, use Redis)
const otpStore = new Map();

// ─── Controllers ──────────────────────────────────────────

/**
 * POST /api/auth/register
 * Creates a new user account with hashed password and returns tokens.
 */
export async function register(req, res) {
  try {
    const { email, password, role, displayName, language } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Email already registered',
      });
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, rounds);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        profile: {
          create: {
            displayName,
            language,
          },
        },
      },
      include: { profile: true },
    });

    // Create learner profile for students
    if (role === 'STUDENT') {
      await prisma.learnerProfile.create({
        data: {
          userId: user.id,
          knowledgeMap: {},
          preferredLang: language,
        },
      });
    }

    const tokens = generateTokens(user);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
        accessToken: tokens.accessToken,
      },
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Registration failed',
      error: error.message,
    });
  }
}

/**
 * POST /api/auth/login
 * Verifies credentials and returns access + refresh tokens.
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password',
      });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password',
      });
    }

    // Update online status
    if (user.profile) {
      await prisma.profile.update({
        where: { userId: user.id },
        data: { isOnline: true, lastSeen: new Date() },
      });
    }

    const tokens = generateTokens(user);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
        accessToken: tokens.accessToken,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Login failed',
      error: error.message,
    });
  }
}

/**
 * POST /api/auth/refresh
 * Exchanges a refresh token for a new access token.
 */
export async function refresh(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Refresh token required',
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid refresh token',
      });
    }

    const tokens = generateTokens(user);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      data: { accessToken: tokens.accessToken },
      message: 'Token refreshed',
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid or expired refresh token',
    });
  }
}

/**
 * POST /api/auth/logout
 * Clears the refresh token cookie.
 */
export async function logout(req, res) {
  try {
    res.clearCookie('refreshToken');

    if (req.user) {
      await prisma.profile.updateMany({
        where: { userId: req.user.id },
        data: { isOnline: false, lastSeen: new Date() },
      });
    }

    return res.json({
      success: true,
      data: null,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Logout failed',
      error: error.message,
    });
  }
}

/**
 * POST /api/auth/forgot-password
 * Generates OTP and sends it via email (stubbed for dev).
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether email exists
      return res.json({
        success: true,
        data: null,
        message: 'If an account exists with that email, an OTP has been sent',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    // In production, send email via SMTP
    console.log(`[DEV] OTP for ${email}: ${otp}`);

    return res.json({
      success: true,
      data: null,
      message: 'If an account exists with that email, an OTP has been sent',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to process forgot password request',
      error: error.message,
    });
  }
}

/**
 * POST /api/auth/reset-password
 * Verifies OTP and updates the user's password.
 */
export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    const stored = otpStore.get(email);
    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid or expired OTP',
      });
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(newPassword, rounds);

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    otpStore.delete(email);

    return res.json({
      success: true,
      data: null,
      message: 'Password reset successful',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Password reset failed',
      error: error.message,
    });
  }
}
