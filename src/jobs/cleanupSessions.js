import cron from 'node-cron';
import { lt } from 'drizzle-orm';
import { sessionsTable } from '../drizzle/schema.js';
import { db } from '../db/db.js';

async function cleanupExpiredSessions() {
  try {
    await db
      .delete(sessionsTable)
      .where(lt(sessionsTable.expiresAt, new Date()));
    console.log('🧹 Expired sessions cleaned up at', new Date().toISOString());
  } catch (err) {
    console.error('❌ Error cleaning sessions:', err);
  }
}

export function scheduleCleanupJob() {
  // Runs every midnight
  cron.schedule('0 0 * * *', () => {
    cleanupExpiredSessions();
  });
}
