'use server';

import clientPromise from '@/lib/mongodb';
import { SchoolSchema } from '@/lib/models/schemas';

export async function seedSchool() {
  const client = await clientPromise;
  const db = client.db();

  const school = {
    name: 'Far North Secondary School',
    slug: 'far-north-secondary-school',
    settings: {}
  };

  const validated = SchoolSchema.parse(school);

  const result = await db.collection('schools').updateOne(
    { slug: validated.slug },
    { $set: validated },
    { upsert: true }
  );

  console.log('[SEED_SCHOOL]', { slug: validated.slug, result });

  const updatedSchool = await db.collection('schools').findOne({ slug: validated.slug });
  return JSON.parse(JSON.stringify(updatedSchool));
}
