# Classroom & Engagement System

## Purpose
Core functionality for teachers to manage students, award positive reinforcement, and share updates.

## Features

### 1. Digital Classroom
- **Data Flow**: `Teacher -> Create Class -> Add Students -> Assign Avatars`.
- **Database**: `classrooms` and `students` collections.

### 2. Positive Reinforcement
- **Rules**: ONLY positive points. Categories: Participation, Teamwork, Respect, Leadership.
- **Data Flow**: `Teacher -> Select Student -> Choose Category -> Point Saved`.
- **AI Extension**: `reinforcementAnalyzer.ts` tracks which students haven't received points recently and nudges the teacher.

### 3. Class Story
- **Purpose**: Bridge communication between school and home.
- **Data Flow**: `Teacher -> Post Update (Text/Image) -> Parent Feed`.
- **AI Extension**: `storySummarizer.ts` creates a weekly highlight reel for parents.

### 4. Messaging
- **Quiet Hours**: Teachers set "Off" times where notifications are silenced.
- **Status**: Track 'read' status.
- **AI Extension**: `disengagementDetector.ts` flags parents who haven't opened messages or stories.

## Future Scaling
- **Media Storage**: Integrate with S3 or Uploadthing for story images and portfolios.
- **Real-time**: Use WebSockets or Ably for instant messaging notifications.
