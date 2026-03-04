# AI Extension Layer

## Purpose
Provide intelligent insights without bloating core business logic.

## Architecture
All AI modules reside in `lib/ai/` and are called via standardized hooks or background jobs.

## Planned Modules

### 1. `reinforcementAnalyzer.ts`
- **Input**: `points` history for a classroom.
- **Output**: List of students needing encouragement.
- **Goal**: Ensure no student is left behind in positive reinforcement.

### 2. `parentEngagementScore.ts`
- **Input**: `messages` read status, `stories` views/comments.
- **Output**: Engagement score (0-100).
- **Goal**: Identify parents who are drifting away from school involvement.

### 3. `behaviorTrendDetector.ts`
- **Input**: Aggregated `points` categories.
- **Output**: Trends (e.g., "Class teamwork increased by 20% this week").
- **Goal**: Provide teachers with data for parent-teacher conferences.

### 4. `storyAssistant.ts`
- **Input**: Draft story text.
- **Output**: Polished, professional, and encouraging text suggestions.

## Implementation Standard
AI modules should return structured JSON that the UI can consume.
```typescript
interface AIInsight {
  type: string;
  targetId: string;
  message: string;
  confidence: number;
}
```
