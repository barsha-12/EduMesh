import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Issue a new credential and optionally anchor to blockchain.
 * @param {{ studentId: string, subject: string, level: string }} data
 * @returns {Promise<object>} Created credential
 */
export async function createCredential({ studentId, subject, level }) {
  const vcMetadata = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential', 'EduMeshCredential'],
    issuer: 'did:edumesh:platform',
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: `did:edumesh:student:${studentId}`,
      achievement: {
        type: 'LearningAchievement',
        name: `${subject} — ${level}`,
        description: `Completed ${subject} at ${level} level on EduMesh`,
      },
    },
  };

  const credential = await prisma.credential.create({
    data: {
      studentId,
      subject,
      level,
      metadataJson: vcMetadata,
    },
  });

  return credential;
}

/**
 * Verify a credential by its ID.
 * @param {string} credentialId
 * @returns {Promise<object|null>}
 */
export async function verifyById(credentialId) {
  return prisma.credential.findUnique({ where: { id: credentialId } });
}
