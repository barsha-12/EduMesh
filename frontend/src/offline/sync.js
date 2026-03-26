import db from './db';
import api from '../services/api';

/**
 * Sync manager — handles offline data synchronization.
 * Flushes queued sessions and updates when connectivity is restored.
 */

let isSyncing = false;

/**
 * Check online status and trigger sync if needed.
 */
export function initSyncManager() {
  // Listen for online events
  window.addEventListener('online', handleOnline);

  // Listen for SW sync messages
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SYNC_TRIGGERED') {
        flushSyncQueue();
      }
    });
  }

  // Check on app load
  if (navigator.onLine) {
    flushSyncQueue();
  }
}

/**
 * Called when device comes back online.
 */
async function handleOnline() {
  console.log('📡 Back online — starting sync');
  await flushSyncQueue();
}

/**
 * Flush all pending items in the sync queue to the backend.
 */
export async function flushSyncQueue() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const pendingItems = await db.syncQueue.where('status').equals('pending').toArray();

    if (pendingItems.length === 0) {
      isSyncing = false;
      return;
    }

    console.log(`🔄 Syncing ${pendingItems.length} queued items...`);

    // Group sessions for bulk sync
    const sessions = pendingItems
      .filter((item) => item.endpoint === '/student/sync')
      .map((item) => item.payload);

    if (sessions.length > 0) {
      try {
        const deviceId = getDeviceId();
        await api.post('/student/sync', { deviceId, sessions });

        // Mark as synced
        const ids = pendingItems.filter((i) => i.endpoint === '/student/sync').map((i) => i.id);
        await db.syncQueue.where('id').anyOf(ids).modify({ status: 'synced' });
        console.log(`✅ Synced ${sessions.length} sessions`);
      } catch (err) {
        console.error('Sync failed:', err);
        // Mark as failed — will retry on next online event
        const ids = pendingItems.filter((i) => i.endpoint === '/student/sync').map((i) => i.id);
        await db.syncQueue.where('id').anyOf(ids).modify({ status: 'failed' });
      }
    }

    // Process other queued API calls
    const otherItems = pendingItems.filter((item) => item.endpoint !== '/student/sync');
    for (const item of otherItems) {
      try {
        await api.post(item.endpoint, item.payload);
        await db.syncQueue.update(item.id, { status: 'synced' });
      } catch {
        await db.syncQueue.update(item.id, { status: 'failed' });
      }
    }
  } catch (err) {
    console.error('Sync queue flush error:', err);
  }

  isSyncing = false;
}

/**
 * Add an item to the sync queue (for when offline).
 */
export async function queueForSync(endpoint, payload) {
  await db.syncQueue.add({
    endpoint,
    payload,
    createdAt: new Date().toISOString(),
    status: 'pending',
  });
  console.log(`📋 Queued for sync: ${endpoint}`);
}

/**
 * Get pending sync count for UI display.
 */
export async function getPendingSyncCount() {
  return db.syncQueue.where('status').equals('pending').count();
}

/**
 * Cache content for offline access.
 */
export async function cacheContentOffline(content) {
  const existing = await db.content.where('contentId').equals(content.id).first();
  if (existing) {
    await db.content.update(existing.id, { ...content, cachedAt: new Date().toISOString() });
  } else {
    await db.content.add({
      contentId: content.id,
      ...content,
      cachedAt: new Date().toISOString(),
    });
  }
}

/**
 * Get cached content by ID.
 */
export async function getCachedContent(contentId) {
  return db.content.where('contentId').equals(contentId).first();
}

/**
 * Generate/retrieve a persistent device ID.
 */
function getDeviceId() {
  let id = localStorage.getItem('edumesh-device-id');
  if (!id) {
    id = 'device_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('edumesh-device-id', id);
  }
  return id;
}
