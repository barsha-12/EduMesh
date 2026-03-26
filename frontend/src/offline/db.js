import Dexie from 'dexie';

/**
 * EduMesh IndexedDB schema via Dexie.js
 * Stores content, sessions, profile, and sync queue for offline support.
 */
const db = new Dexie('EduMeshDB');

db.version(1).stores({
  content:   '++id, contentId, subject, gradeLevel, language, cachedAt',
  sessions:  '++id, contentId, startedAt, syncStatus',
  profile:   '++id, userId',
  syncQueue: '++id, endpoint, payload, createdAt, status',
});

export default db;
