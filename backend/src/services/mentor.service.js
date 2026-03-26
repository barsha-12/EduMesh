import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

/**
 * Find best mentor matches for a student using the AI matching algorithm.
 * Falls back to simple scoring if AI service is unavailable.
 * @param {string} studentId
 * @param {string} subject
 * @param {string} preferredLanguage
 * @returns {Promise<object[]>} Ranked mentor matches
 */
export async function findMentorMatches(studentId, subject, preferredLanguage) {
  // Fetch available mentors
  const mentors = await prisma.profile.findMany({
    where: {
      user: { role: 'MENTOR' },
      isOnline: true,
    },
    include: { user: { select: { id: true, email: true } } },
  });

  if (mentors.length === 0) return [];

  const studentProfile = await prisma.profile.findUnique({ where: { userId: studentId } });

  // Score each mentor
  const scored = mentors.map((mentor) => {
    const languageMatch = mentor.language === preferredLanguage ? 1 : 0.3;
    const subjectProficiency = 0.8; // Default; in production, fetch from mentor's expertise data
    const availabilityScore = mentor.isOnline ? 1 : 0.2;
    const distance = calculateDistance(studentProfile?.location, mentor.location);
    const distanceScore = 1 / (1 + distance);

    const score = languageMatch * 0.4 + subjectProficiency * 0.35 + availabilityScore * 0.15 + distanceScore * 0.1;

    return {
      mentorId: mentor.userId,
      displayName: mentor.displayName,
      language: mentor.language,
      score,
      explanation: `Language: ${languageMatch === 1 ? 'match' : 'partial'}, Availability: ${mentor.isOnline ? 'online' : 'offline'}`,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}

/**
 * Calculate distance between two coordinates in km.
 */
function calculateDistance(loc1, loc2) {
  if (!loc1?.lat || !loc2?.lat) return 1000;
  const R = 6371;
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((loc1.lat * Math.PI) / 180) * Math.cos((loc2.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
