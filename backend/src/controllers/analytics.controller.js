import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// ─── Zod Schemas ──────────────────────────────────────────

export const analyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  region: z.string().optional(),
  subject: z.string().optional(),
});

// ─── Controllers ──────────────────────────────────────────

/**
 * GET /api/analytics/overview
 * Platform-wide statistics (admin/NGO only).
 */
export async function getOverview(req, res) {
  try {
    const [totalUsers, totalStudents, totalMentors, totalContent, totalSessions, totalCredentials] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'MENTOR' } }),
      prisma.content.count(),
      prisma.learningSession.count(),
      prisma.credential.count(),
    ]);

    // Active users last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await prisma.profile.count({
      where: { lastSeen: { gte: sevenDaysAgo } },
    });

    // Average session duration
    const sessionStats = await prisma.learningSession.aggregate({
      _avg: { durationSecs: true, completionPct: true },
      _sum: { durationSecs: true },
    });

    // Daily active users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSessions = await prisma.learningSession.findMany({
      where: { startedAt: { gte: thirtyDaysAgo } },
      select: { studentId: true, startedAt: true },
    });

    const dailyActive = {};
    recentSessions.forEach((s) => {
      const day = s.startedAt.toISOString().split('T')[0];
      if (!dailyActive[day]) dailyActive[day] = new Set();
      dailyActive[day].add(s.studentId);
    });

    const dauData = Object.entries(dailyActive)
      .map(([date, users]) => ({ date, count: users.size }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalMentors,
        totalContent,
        totalSessions,
        totalCredentials,
        activeUsersLast7Days: activeUsers,
        avgSessionDurationMins: Math.round((sessionStats._avg.durationSecs || 0) / 60),
        avgCompletionPct: Math.round(sessionStats._avg.completionPct || 0),
        totalLearningHours: Math.round((sessionStats._sum.durationSecs || 0) / 3600),
        dailyActiveUsers: dauData,
      },
      message: 'Overview statistics retrieved',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to retrieve overview', error: error.message,
    });
  }
}

/**
 * GET /api/analytics/region
 * Breakdown by country/region.
 */
export async function getRegionAnalytics(req, res) {
  try {
    const profiles = await prisma.profile.findMany({
      where: { location: { not: null } },
      select: { location: true, userId: true },
    });

    const regionMap = {};
    profiles.forEach((p) => {
      const loc = p.location;
      const country = loc?.country || 'Unknown';
      const region = loc?.region || 'Unknown';
      const key = `${country}-${region}`;
      if (!regionMap[key]) {
        regionMap[key] = { country, region, count: 0, lat: loc?.lat, lng: loc?.lng };
      }
      regionMap[key].count++;
    });

    return res.json({
      success: true,
      data: Object.values(regionMap).sort((a, b) => b.count - a.count),
      message: 'Region analytics retrieved',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to retrieve region analytics', error: error.message,
    });
  }
}

/**
 * GET /api/analytics/subject
 * Subject-wise engagement and completion rates.
 */
export async function getSubjectAnalytics(req, res) {
  try {
    const contentBySubject = await prisma.content.groupBy({
      by: ['subject'],
      _count: { id: true },
    });

    const subjectStats = await Promise.all(
      contentBySubject.map(async (item) => {
        const sessions = await prisma.learningSession.findMany({
          where: { content: { subject: item.subject } },
          select: { completionPct: true, durationSecs: true, quizScore: true },
        });

        const totalSessions = sessions.length;
        const avgCompletion = totalSessions > 0 ? sessions.reduce((sum, s) => sum + s.completionPct, 0) / totalSessions : 0;
        const avgQuizScore = sessions.filter((s) => s.quizScore !== null).length > 0
          ? sessions.filter((s) => s.quizScore !== null).reduce((sum, s) => sum + s.quizScore, 0) / sessions.filter((s) => s.quizScore !== null).length
          : 0;

        return {
          subject: item.subject,
          contentCount: item._count.id,
          totalSessions,
          avgCompletionPct: Math.round(avgCompletion),
          avgQuizScore: Math.round(avgQuizScore),
        };
      })
    );

    return res.json({
      success: true,
      data: subjectStats.sort((a, b) => b.totalSessions - a.totalSessions),
      message: 'Subject analytics retrieved',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to retrieve subject analytics', error: error.message,
    });
  }
}

/**
 * GET /api/analytics/cohort
 * Track a specific group of students over time.
 */
export async function getCohortAnalytics(req, res) {
  try {
    const { startDate, endDate, region } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const users = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        createdAt: { gte: start, lte: end },
      },
      select: { id: true, createdAt: true },
    });

    const userIds = users.map((u) => u.id);

    const sessions = await prisma.learningSession.findMany({
      where: { studentId: { in: userIds } },
      select: { studentId: true, durationSecs: true, completionPct: true, startedAt: true },
    });

    const weeklyProgress = {};
    sessions.forEach((s) => {
      const week = getWeekNumber(s.startedAt);
      if (!weeklyProgress[week]) {
        weeklyProgress[week] = { week, activeStudents: new Set(), totalMinutes: 0, sessions: 0 };
      }
      weeklyProgress[week].activeStudents.add(s.studentId);
      weeklyProgress[week].totalMinutes += Math.floor(s.durationSecs / 60);
      weeklyProgress[week].sessions++;
    });

    const cohortData = Object.values(weeklyProgress)
      .map((w) => ({
        week: w.week,
        activeStudents: w.activeStudents.size,
        totalMinutes: w.totalMinutes,
        sessions: w.sessions,
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    return res.json({
      success: true,
      data: {
        cohortSize: users.length,
        dateRange: { start: start.toISOString(), end: end.toISOString() },
        weeklyProgress: cohortData,
      },
      message: 'Cohort analytics retrieved',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to retrieve cohort analytics', error: error.message,
    });
  }
}

/**
 * GET /api/analytics/export
 * CSV export of filtered data.
 */
export async function exportAnalytics(req, res) {
  try {
    const sessions = await prisma.learningSession.findMany({
      include: { content: { select: { title: true, subject: true, topic: true } } },
      orderBy: { startedAt: 'desc' },
      take: 5000,
    });

    const csvHeaders = 'Session ID,Student ID,Content Title,Subject,Topic,Started At,Duration (min),Completion %,Quiz Score,Offline\n';
    const csvRows = sessions.map((s) =>
      `${s.id},${s.studentId},"${s.content.title}",${s.content.subject},${s.content.topic},${s.startedAt.toISOString()},${Math.round(s.durationSecs / 60)},${s.completionPct},${s.quizScore || ''},${s.wasOffline}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=edumesh-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csvHeaders + csvRows);
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to export analytics', error: error.message,
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────

function getWeekNumber(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const onejan = new Date(year, 0, 1);
  const weekNum = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}
