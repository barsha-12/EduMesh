import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// ─── Zod Schemas ──────────────────────────────────────────

export const issueCredentialSchema = z.object({
  studentId: z.string().min(1),
  subject: z.string().min(1),
  level: z.string().min(1),
  txHash: z.string().optional(),
  ipfsCid: z.string().optional(),
  metadataJson: z.object({}).passthrough().optional(),
});

// ─── Controllers ──────────────────────────────────────────

/**
 * POST /api/credential/issue
 * Admin/system issues a credential to a student.
 */
export async function issueCredential(req, res) {
  try {
    const { studentId, subject, level, txHash, ipfsCid, metadataJson } = req.body;

    // Build W3C Verifiable Credential metadata
    const vcMetadata = metadataJson || {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'EduMeshCredential'],
      issuer: 'did:edumesh:platform',
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: `did:edumesh:student:${studentId}`,
        achievement: {
          type: 'LearningAchievement',
          name: `${subject} — ${level}`,
          description: `Completed ${subject} at ${level} level on EduMesh platform`,
        },
      },
    };

    const credential = await prisma.credential.create({
      data: {
        studentId,
        subject,
        level,
        txHash: txHash || null,
        ipfsCid: ipfsCid || null,
        metadataJson: vcMetadata,
      },
    });

    return res.status(201).json({
      success: true,
      data: credential,
      message: 'Credential issued successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to issue credential', error: error.message,
    });
  }
}

/**
 * GET /api/credential/student/:id
 * Get all credentials for a student.
 */
export async function getStudentCredentials(req, res) {
  try {
    const credentials = await prisma.credential.findMany({
      where: { studentId: req.params.id },
      orderBy: { issuedAt: 'desc' },
    });

    return res.json({
      success: true,
      data: credentials,
      message: 'Credentials retrieved',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Failed to retrieve credentials', error: error.message,
    });
  }
}

/**
 * GET /api/credential/verify/:id
 * Public endpoint — verify credential authenticity.
 */
export async function verifyCredential(req, res) {
  try {
    const credential = await prisma.credential.findUnique({
      where: { id: req.params.id },
    });

    if (!credential) {
      return res.status(404).json({
        success: false, data: null,
        message: 'Credential not found',
      });
    }

    const verification = {
      valid: true,
      credential: {
        id: credential.id,
        subject: credential.subject,
        level: credential.level,
        issuedAt: credential.issuedAt,
        metadataJson: credential.metadataJson,
      },
      blockchain: {
        anchored: !!credential.txHash,
        txHash: credential.txHash,
        network: credential.txHash ? 'Polygon' : null,
      },
      ipfs: {
        stored: !!credential.ipfsCid,
        cid: credential.ipfsCid,
        gateway: credential.ipfsCid ? `${process.env.IPFS_GATEWAY}${credential.ipfsCid}` : null,
      },
    };

    return res.json({
      success: true,
      data: verification,
      message: 'Credential verified',
    });
  } catch (error) {
    return res.status(500).json({
      success: false, data: null,
      message: 'Verification failed', error: error.message,
    });
  }
}
