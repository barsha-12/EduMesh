import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// ─── Zod Schemas ──────────────────────────────────────────

export const contentQuerySchema = z.object({
  subject: z.string().optional(),
  topic: z.string().optional(),
  gradeLevel: z.string().optional(),
  language: z.string().optional(),
  type: z.enum(['VIDEO', 'ARTICLE', 'QUIZ', 'EXERCISE', 'PODCAST']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const createContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  type: z.enum(['VIDEO', 'ARTICLE', 'QUIZ', 'EXERCISE', 'PODCAST']),
  subject: z.string().min(1),
  topic: z.string().min(1),
  gradeLevel: z.number().int().min(1).max(12),
  language: z.string().default('en'),
  durationMins: z.number().int().min(1),
  offlineBlob: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  sourceUrl: z.string().url().optional(),
});

export const updateContentSchema = createContentSchema.partial();

// ─── Controllers ──────────────────────────────────────────

/**
 * GET /api/content
 * Search/filter content by subject, topic, grade, language, type.
 */
export async function getContent(req, res) {
  try {
    const { subject, topic, gradeLevel, language, type, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (subject) where.subject = subject;
    if (topic) where.topic = { contains: topic, mode: 'insensitive' };
    if (gradeLevel) where.gradeLevel = parseInt(gradeLevel);
    if (language) where.language = language;
    if (type) where.type = type;

    const [content, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.content.count({ where }),
    ]);

    return res.json({
      success: true,
      data: { content, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } },
      message: 'Content retrieved',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to retrieve content', error: error.message,
    });
  }
}

/**
 * GET /api/content/:id
 * Returns full content detail.
 */
export async function getContentById(req, res) {
  try {
    const content = await prisma.content.findUnique({
      where: { id: req.params.id },
    });

    if (!content) {
      return res.status(404).json({
        success: false, data: null,
        message: 'Content not found',
      });
    }

    return res.json({
      success: true,
      data: content,
      message: 'Content retrieved',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to retrieve content', error: error.message,
    });
  }
}

/**
 * GET /api/content/:id/offline
 * Returns content packaged for offline storage.
 */
export async function getOfflineContent(req, res) {
  try {
    const content = await prisma.content.findUnique({
      where: { id: req.params.id },
    });

    if (!content) {
      return res.status(404).json({
        success: false, data: null, message: 'Content not found',
      });
    }

    // Package for offline: include all data needed to render without network
    const offlinePackage = {
      id: content.id,
      title: content.title,
      body: content.body,
      type: content.type,
      subject: content.subject,
      topic: content.topic,
      gradeLevel: content.gradeLevel,
      language: content.language,
      durationMins: content.durationMins,
      offlineBlob: content.offlineBlob,
      tags: content.tags,
      cachedAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      data: offlinePackage,
      message: 'Offline content package ready',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to generate offline package', error: error.message,
    });
  }
}

/**
 * POST /api/content
 * Admin creates new content (with AI auto-tagging).
 */
export async function createContent(req, res) {
  try {
    const data = req.body;

    const content = await prisma.content.create({ data });

    return res.status(201).json({
      success: true,
      data: content,
      message: 'Content created',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to create content', error: error.message,
    });
  }
}

/**
 * PUT /api/content/:id
 * Admin updates content.
 */
export async function updateContent(req, res) {
  try {
    const content = await prisma.content.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return res.json({
      success: true,
      data: content,
      message: 'Content updated',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to update content', error: error.message,
    });
  }
}

/**
 * DELETE /api/content/:id
 * Admin removes content.
 */
export async function deleteContent(req, res) {
  try {
    await prisma.content.delete({ where: { id: req.params.id } });

    return res.json({
      success: true,
      data: null,
      message: 'Content deleted',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to delete content', error: error.message,
    });
  }
}
