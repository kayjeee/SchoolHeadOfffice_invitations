# Database Schema Proposal

## Collections

### 1. `schools`
Stores multi-tenant school information.
- `_id`: ObjectId
- `name`: string
- `slug`: string (unique)
- `settings`: object (branding, feature flags)

### 2. `invites`
Teacher invitations.
- `_id`: ObjectId
- `schoolId`: ObjectId
- `tokenHash`: string (SHA-256)
- `email`: string
- `role`: string ('teacher')
- `expiresAt`: Date
- `status`: string ('pending', 'accepted', 'expired')
- `createdAt`: Date

### 3. `teachers`
Teacher profiles.
- `_id`: ObjectId
- `auth0Id`: string (unique)
- `schoolId`: ObjectId
- `name`: string
- `email`: string
- `settings`: object (Quiet Hours, notifications)

### 4. `classrooms`
- `_id`: ObjectId
- `schoolId`: ObjectId
- `teacherId`: ObjectId
- `name`: string
- `grade`: string
- `students`: Array<{ studentId: ObjectId, avatar: string }>

### 5. `students`
- `_id`: ObjectId
- `schoolId`: ObjectId
- `name`: string
- `parentIds`: Array<ObjectId>

### 6. `points` (Point History)
- `_id`: ObjectId
- `schoolId`: ObjectId
- `teacherId`: ObjectId
- `studentId`: ObjectId (or groupId)
- `category`: string (Participation, Teamwork, etc.)
- `value`: number (Always positive)
- `timestamp`: Date

### 7. `stories` (Class Story)
- `_id`: ObjectId
- `schoolId`: ObjectId
- `classroomId`: ObjectId
- `teacherId`: ObjectId
- `content`: string
- `media`: Array<{ url: string, type: string }>
- `comments`: Array<{ userId: ObjectId, text: string, timestamp: Date }>
- `createdAt`: Date

### 8. `messages`
- `_id`: ObjectId
- `schoolId`: ObjectId
- `senderId`: ObjectId
- `receiverId`: ObjectId
- `content`: string
- `status`: string ('sent', 'delivered', 'read')
- `timestamp`: Date

### 9. `portfolios`
- `_id`: ObjectId
- `schoolId`: ObjectId
- `studentId`: ObjectId
- `teacherId`: ObjectId
- `content`: string
- `media`: Array<{ url: string, type: string }>
- `feedback`: string
- `createdAt`: Date

### 10. `audit_logs`
- `_id`: ObjectId
- `schoolId`: ObjectId
- `userId`: ObjectId
- `action`: string
- `metadata`: object
- `timestamp`: Date
