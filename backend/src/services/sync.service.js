import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Process offline-captured data from a sync queue entry.
 * @param {{ deviceId: string, userId: string, sessions: object[] }} data
 * @returns {Promise<object>} Sync result
 */
export async function processSync({ deviceId, userId, sessions }) {
  const results = [];

  for (const sessionData of sessions) {
    try {
      const session = await prisma.learningSession.create({
        data: {
          studentId: userId,
          contentId: sessionData.contentId,
          startedAt: new Date(sessionData.startedAt),
          endedAt: sessionData.endedAt ? new Date(sessionData.endedAt) : null,
          durationSecs: sessionData.durationSecs || 0,
          completionPct: sessionData.completionPct || 0,
          quizScore: sessionData.quizScore || null,
          wasOffline: true,
        },
      });

      // Mark as synced in the queue
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
    } catch (error) {
      // Log failure but continue processing other items
      await prisma.syncQueue.create({
        data: {
          deviceId,
          userId,
          payload: sessionData,
          status: 'FAILED',
        },
      });

      results.push({ contentId: sessionData.contentId, status: 'failed', error: error.message });
    }
  }

  return {
    synced: results.filter((r) => r.status === 'synced').length,
    failed: results.filter((r) => r.status === 'failed').length,
    results,
  };
}

/**
 * Get pending sync items for a user.
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export async function getPendingSync(userId) {
  return prisma.syncQueue.findMany({
    where: { userId, status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
  });
}
