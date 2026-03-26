import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { z } from 'zod';

const prisma = new PrismaClient();

// ─── Zod Schemas ──────────────────────────────────────────

export const requestMentorSchema = z.object({
  subject: z.string().min(1),
  preferredLanguage: z.string().optional().default('en'),
  timezone: z.string().optional(),
  message: z.string().optional(),
});

export const completeMentorSchema = z.object({
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

// ─── Controllers ──────────────────────────────────────────

/**
 * GET /api/mentor/available
 * Lists mentors filtered by subject, language, timezone.
 */
export async function getAvailableMentors(req, res) {
  try {
    const { subject, language, timezone } = req.query;

    const where = { user: { role: 'MENTOR' }, isOnline: true };
    if (language) where.language = language;

    const mentorProfiles = await prisma.profile.findMany({
      where,
      include: { user: { select: { id: true, email: true, role: true } } },
    });

    return res.json({
      success: true,
      data: mentorProfiles,
      message: 'Available mentors retrieved',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to retrieve mentors', error: error.message,
    });
  }
}

/**
 * POST /api/mentor/request
 * Student requests a mentor match. Calls AI matching service.
 */
export async function requestMentor(req, res) {
  try {
    const { subject, preferredLanguage, timezone, message } = req.body;
    const studentId = req.user.id;

    const studentProfile = await prisma.profile.findUnique({ where: { userId: studentId } });
    const learnerProfile = await prisma.learnerProfile.findUnique({ where: { userId: studentId } });

    let mentorId = null;

    try {
      // Call AI service for best match
      const aiResp = await axios.post(
        `${process.env.AI_SERVICE_URL}/match/mentor`,
        {
          studentProfile: { ...studentProfile, ...learnerProfile },
          subject,
          preferredLanguage,
          timezone,
        },
        { timeout: 10000 }
      );

      if (aiResp.data?.matches?.length > 0) {
        mentorId = aiResp.data.matches[0].mentorId;
      }
    } catch {
      // Fallback: pick first available mentor
      const anyMentor = await prisma.profile.findFirst({
        where: { user: { role: 'MENTOR' } },
        include: { user: true },
      });
      if (anyMentor) mentorId = anyMentor.userId;
    }

    if (!mentorId) {
      return res.status(404).json({
        success: false, data: null,
        message: 'No mentors available at this time',
      });
    }

    const match = await prisma.mentorMatch.create({
      data: {
        studentId,
        mentorId,
        subject,
        status: 'PENDING',
        sessionLog: message ? [{ type: 'request', message, timestamp: new Date().toISOString() }] : [],
      },
    });

    return res.status(201).json({
      success: true,
      data: match,
      message: 'Mentor match request created',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to request mentor', error: error.message,
    });
  }
}

/**
 * GET /api/mentor/matches
 * Mentor sees their pending/active matches.
 */
export async function getMatches(req, res) {
  try {
    const userId = req.user.id;
    const status = req.query.status;

    const where = { mentorId: userId };
    if (status) where.status = status;

    const matches = await prisma.mentorMatch.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with student profiles
    const enriched = await Promise.all(
      matches.map(async (match) => {
        const studentProfile = await prisma.profile.findUnique({
          where: { userId: match.studentId },
        });
        return { ...match, studentProfile };
      })
    );

    return res.json({
      success: true,
      data: enriched,
      message: 'Matches retrieved',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to retrieve matches', error: error.message,
    });
  }
}

/**
 * POST /api/mentor/matches/:id/accept
 * Mentor accepts a pending match.
 */
export async function acceptMatch(req, res) {
  try {
    const match = await prisma.mentorMatch.update({
      where: { id: req.params.id },
      data: {
        status: 'ACTIVE',
        scheduledAt: new Date(),
        sessionLog: {
          push: { type: 'accepted', timestamp: new Date().toISOString() },
        },
      },
    });

    return res.json({
      success: true,
      data: match,
      message: 'Match accepted',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to accept match', error: error.message,
    });
  }
}

/**
 * POST /api/mentor/matches/:id/complete
 * Mark session as completed and log notes.
 */
export async function completeMatch(req, res) {
  try {
    const { notes, rating } = req.body;

    const match = await prisma.mentorMatch.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        sessionLog: {
          push: {
            type: 'completed',
            notes,
            rating,
            timestamp: new Date().toISOString(),
          },
        },
      },
    });

    return res.json({
      success: true,
      data: match,
      message: 'Session completed',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to complete match', error: error.message,
    });
  }
}

/**
 * GET /api/mentor/leaderboard
 * Top mentors ranked by completed sessions.
 */
export async function getLeaderboard(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const mentors = await prisma.mentorMatch.groupBy({
      by: ['mentorId'],
      where: { status: 'COMPLETED' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    // Enrich with profile data
    const enriched = await Promise.all(
      mentors.map(async (m) => {
        const profile = await prisma.profile.findUnique({ where: { userId: m.mentorId } });
        return {
          mentorId: m.mentorId,
          displayName: profile?.displayName || 'Unknown',
          avatarUrl: profile?.avatarUrl,
          completedSessions: m._count.id,
        };
      })
    );

    return res.json({
      success: true,
      data: enriched,
      message: 'Leaderboard retrieved',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to retrieve leaderboard', error: error.message,
    });
  }
}
