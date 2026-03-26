import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { z } from 'zod';

const prisma = new PrismaClient();

// ─── Zod Schemas ──────────────────────────────────────────

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).optional(),
  language: z.string().optional(),
  gradeLevel: z.number().int().min(1).max(12).optional(),
  learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
  pace: z.number().min(0.5).max(2.0).optional(),
  weeklyGoalMins: z.number().int().min(10).max(600).optional(),
});

export const startSessionSchema = z.object({
  contentId: z.string().min(1),
  wasOffline: z.boolean().optional().default(false),
});

export const endSessionSchema = z.object({
  sessionId: z.string().min(1),
  durationSecs: z.number().int().min(0),
  completionPct: z.number().min(0).max(100),
  quizScore: z.number().min(0).max(100).optional(),
});

export const syncSchema = z.object({
  deviceId: z.string().min(1),
  sessions: z.array(z.object({
    contentId: z.string(),
    startedAt: z.string(),
    endedAt: z.string().optional(),
    durationSecs: z.number().int(),
    completionPct: z.number(),
    quizScore: z.number().optional(),
  })),
});

// ─── Controllers ──────────────────────────────────────────

/**
 * GET /api/student/profile
 * Returns full learner profile + knowledge map.
 */
export async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({ where: { userId } });
    const learnerProfile = await prisma.learnerProfile.findUnique({ where: { userId } });

    if (!profile) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Profile not found',
      });
    }

    return res.json({
      success: true,
      data: { profile, learnerProfile },
      message: 'Profile retrieved',
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to retrieve profile', error: error.message,
    });
  }
}

/**
 * PUT /api/student/profile
 * Updates preferences, language, grade, learning style.
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { displayName, language, gradeLevel, learningStyle, pace, weeklyGoalMins } = req.body;

    const profileUpdate = {};
    if (displayName) profileUpdate.displayName = displayName;
    if (language) profileUpdate.language = language;
    if (gradeLevel !== undefined) profileUpdate.gradeLevel = gradeLevel;

    const profile = await prisma.profile.update({
      where: { userId },
      data: profileUpdate,
    });

    const learnerUpdate = {};
    if (learningStyle) learnerUpdate.learningStyle = learningStyle;
    if (pace !== undefined) learnerUpdate.pace = pace;
    if (weeklyGoalMins !== undefined) learnerUpdate.weeklyGoalMins = weeklyGoalMins;
    if (language) learnerUpdate.preferredLang = language;

    let learnerProfile = null;
    if (Object.keys(learnerUpdate).length > 0) {
      learnerProfile = await prisma.learnerProfile.update({
        where: { userId },
        data: { ...learnerUpdate, lastUpdated: new Date() },
      });
    }

    return res.json({
      success: true,
      data: { profile, learnerProfile },
      message: 'Profile updated',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to update profile', error: error.message,
    });
  }
}

/**
 * GET /api/student/feed
 * Returns AI-curated content feed by calling the AI service.
 */
export async function getFeed(req, res) {
  try {
    const userId = req.user.id;
    const learnerProfile = await prisma.learnerProfile.findUnique({ where: { userId } });
    const profile = await prisma.profile.findUnique({ where: { userId } });

    if (!learnerProfile) {
      return res.status(404).json({
        success: false, data: null,
        message: 'Learner profile not found',
      });
    }

    // Get recent topics from sessions
    const recentSessions = await prisma.learningSession.findMany({
      where: { studentId: userId },
      include: { content: true },
      orderBy: { startedAt: 'desc' },
      take: 5,
    });
    const recentTopics = recentSessions.map((s) => s.content.topic);

    try {
      // Call AI service for personalized feed
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/personalize/feed`,
        {
          userId,
          knowledgeMap: learnerProfile.knowledgeMap,
          preferredLang: learnerProfile.preferredLang,
          gradeLevel: profile?.gradeLevel || 5,
          recentTopics,
          availableOffline: false,
        },
        { timeout: 10000 }
      );

      return res.json({
        success: true,
        data: aiResponse.data,
        message: 'Feed generated',
      });
    } catch {
      // Fallback: return latest content if AI service unavailable
      const content = await prisma.content.findMany({
        where: {
          language: learnerProfile.preferredLang,
          gradeLevel: { gte: (profile?.gradeLevel || 5) - 1, lte: (profile?.gradeLevel || 5) + 1 },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      return res.json({
        success: true,
        data: { feed: content, source: 'fallback' },
        message: 'Feed generated (AI service unavailable, showing latest content)',
      });
    }
  } catch (error) {
    console.error('Get feed error:', error);
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to generate feed', error: error.message,
    });
  }
}

/**
 * POST /api/student/session/start
 * Logs the start of a learning session.
 */
export async function startSession(req, res) {
  try {
    const { contentId, wasOffline } = req.body;

    const session = await prisma.learningSession.create({
      data: {
        studentId: req.user.id,
        contentId,
        wasOffline: wasOffline || false,
      },
    });

    return res.status(201).json({
      success: true,
      data: session,
      message: 'Session started',
    });
  } catch (error) {
    console.error('Start session error:', error);
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to start session', error: error.message,
    });
  }
}

/**
 * POST /api/student/session/end
 * Logs the end of a session, computes stats, updates knowledge map.
 */
export async function endSession(req, res) {
  try {
    const { sessionId, durationSecs, completionPct, quizScore } = req.body;

    const session = await prisma.learningSession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        durationSecs,
        completionPct,
        quizScore: quizScore || null,
      },
      include: { content: true },
    });

    // Update learner profile
    const learnerProfile = await prisma.learnerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (learnerProfile && session.content) {
      const knowledgeMap = learnerProfile.knowledgeMap || {};
      const subject = session.content.subject;
      const topic = session.content.topic;

      if (!knowledgeMap[subject]) knowledgeMap[subject] = {};

      const oldScore = knowledgeMap[subject][topic] || 0;
      const sessionScore = (completionPct / 100) * (quizScore ? quizScore / 100 : 0.7);
      const newScore = 0.3 * sessionScore + 0.7 * oldScore;

      knowledgeMap[subject][topic] = Math.min(1, Math.max(0, newScore));

      const totalMins = learnerProfile.totalMinutes + Math.floor(durationSecs / 60);

      await prisma.learnerProfile.update({
        where: { userId: req.user.id },
        data: {
          knowledgeMap,
          totalMinutes: totalMins,
          lastUpdated: new Date(),
        },
      });
    }

    return res.json({
      success: true,
      data: session,
      message: 'Session ended and stats updated',
    });
  } catch (error) {
    console.error('End session error:', error);
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to end session', error: error.message,
    });
  }
}

/**
 * GET /api/student/sessions
 * Returns paginated session history.
 */
export async function getSessions(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.learningSession.findMany({
        where: { studentId: req.user.id },
        include: { content: { select: { title: true, subject: true, topic: true, type: true } } },
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.learningSession.count({ where: { studentId: req.user.id } }),
    ]);

    return res.json({
      success: true,
      data: { sessions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
      message: 'Sessions retrieved',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to retrieve sessions', error: error.message,
    });
  }
}

/**
 * GET /api/student/streak
 * Returns current streak and weekly goal progress.
 */
export async function getStreak(req, res) {
  try {
    const learnerProfile = await prisma.learnerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!learnerProfile) {
      return res.status(404).json({
        success: false, data: null,
        message: 'Learner profile not found',
      });
    }

    // Calculate this week's minutes
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekSessions = await prisma.learningSession.findMany({
      where: { studentId: req.user.id, startedAt: { gte: weekStart } },
    });

    const weekMinutes = weekSessions.reduce((sum, s) => sum + Math.floor(s.durationSecs / 60), 0);

    return res.json({
      success: true,
      data: {
        streakDays: learnerProfile.streakDays,
        weeklyGoalMins: learnerProfile.weeklyGoalMins,
        weekMinutes,
        goalProgress: Math.min(100, (weekMinutes / learnerProfile.weeklyGoalMins) * 100),
        totalMinutes: learnerProfile.totalMinutes,
      },
      message: 'Streak data retrieved',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to retrieve streak', error: error.message,
    });
  }
}

/**
 * POST /api/student/sync
 * Receives offline-captured session data and processes sync queue.
 */
export async function syncOfflineData(req, res) {
  try {
    const { deviceId, sessions } = req.body;
    const userId = req.user.id;
    const results = [];

    for (const sessionData of sessions) {
      try {
        const session = await prisma.learningSession.create({
          data: {
            studentId: userId,
            contentId: sessionData.contentId,
            startedAt: new Date(sessionData.startedAt),
            endedAt: sessionData.endedAt ? new Date(sessionData.endedAt) : null,
            durationSecs: sessionData.durationSecs,
            completionPct: sessionData.completionPct,
            quizScore: sessionData.quizScore || null,
            wasOffline: true,
          },
        });

        await prisma.syncQueue.create({
          data: {
            deviceId,
            userId,
            payload: sessionData,
            status: 'SYNCED',
            syncedAt: new Date(),
          },
        });

        results.push({ contentId: sessionData.contentId, status: 'synced', sessionId: session.id });
      } catch (err) {
        results.push({ contentId: sessionData.contentId, status: 'failed', error: err.message });
      }
    }

    return res.json({
      success: true,
      data: { synced: results.filter((r) => r.status === 'synced').length, failed: results.filter((r) => r.status === 'failed').length, results },
      message: 'Sync complete',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Sync failed', error: error.message,
    });
  }
}
