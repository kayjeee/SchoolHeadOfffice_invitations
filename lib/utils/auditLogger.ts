import clientPromise from '../mongodb';
import { AuditLogSchema } from '../models/schemas';

export async function createAuditLog(log: {
  schoolId?: string;
  userId?: string;
  action: string;
  metadata: any;
}) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('audit_logs');

    const validatedLog = AuditLogSchema.parse({
      ...log,
      timestamp: new Date(),
    });

    await collection.insertOne(validatedLog);

    console.log(`[AUDIT_LOG]`, {
      ...validatedLog,
      timestamp: validatedLog.timestamp.toISOString(),
    });
  } catch (error) {
    console.error('[AUDIT_LOG_ERROR]', error);
  }
}
