'use server';

import clientPromise from '@/lib/mongodb';
import { StorySchema, MessageSchema } from '@/lib/models/dashboard-schemas';
import { ObjectId } from 'mongodb';

export async function postToClassStory(data: {
  schoolId: string,
  classroomId: string,
  teacherId: string,
  content: string,
  media?: { url: string, type: 'image' | 'video' }[]
}) {
  const client = await clientPromise;
  const db = client.db();

  const validated = StorySchema.parse({
    ...data,
    media: data.media || [],
    comments: [],
    createdAt: new Date(),
  });

  const result = await db.collection('stories').insertOne(validated);

  console.log('[STORY_POST]', { schoolId: data.schoolId, classroomId: data.classroomId, teacherId: data.teacherId });

  return { success: true, id: result.insertedId };
}

export async function sendMessage(data: {
  schoolId: string,
  senderId: string,
  receiverId: string,
  content: string
}) {
  const client = await clientPromise;
  const db = client.db();

  const validated = MessageSchema.parse({
    ...data,
    status: 'sent',
    timestamp: new Date(),
  });

  const result = await db.collection('messages').insertOne(validated);

  console.log('[MESSAGE_SEND]', { schoolId: data.schoolId, senderId: data.senderId, receiverId: data.receiverId });

  return { success: true, id: result.insertedId };
}
