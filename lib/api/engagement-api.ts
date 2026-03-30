import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { ActivityLog, AgentStatus } from '@/lib/types/dashboard';

export const EngagementAPI = {
  /**
   * Fetch recent activity for the "Intelligence Stream"
   */
  async getRecentActivity(schoolSlug: string, teacherSlug: string): Promise<ActivityLog[]> {
    const client = await clientPromise;
    const db = client.db();

    // In a real implementation, we would query the 'activities' or 'audit_logs' collection
    // filtered by schoolId/teacherId. For now, let's provide some realistic mocked data
    // derived from what we would find in the MongoDB collections (stories, points, messages).

    // In production, this would be:
    // const activities = await db.collection('activities')
    //   .find({ schoolSlug, teacherSlug })
    //   .sort({ timestamp: -1 })
    //   .limit(10)
    //   .toArray();

    return [
      {
        id: 'act_1',
        type: 'insight',
        title: 'Mood Spike Detected',
        description: 'Class participation in "Grade 4 - Blue" increased significantly after today\'s Science lab. 8 students were highly engaged.',
        timestamp: new Date(),
        schoolSlug,
        teacherSlug,
        metadata: {
          trend: 'up',
          trendValue: 24,
          trendLabel: 'Participation spike'
        }
      },
      {
        id: 'act_2',
        type: 'alert',
        title: 'Low Engagement Flag',
        description: '3 parents haven\'t opened the weekly story update for 2 consecutive weeks. Consider a direct message nudge.',
        timestamp: new Date(Date.now() - 3600000),
        schoolSlug,
        teacherSlug,
        metadata: {
          trend: 'down',
          trendValue: 12,
          trendLabel: 'Parent views'
        }
      },
      {
        id: 'act_3',
        type: 'message',
        title: 'New Parent Inquiry',
        description: 'Mrs. Dlamini sent a message regarding Thabo\'s Math progress. "Thanks for the update, he\'s loving the new modules!"',
        timestamp: new Date(Date.now() - 7200000),
        schoolSlug,
        teacherSlug,
      },
      {
        id: 'act_4',
        type: 'success',
        title: 'Goal Achieved!',
        description: 'Your class reached 500 "Teamwork" points this month. A reward celebration is recommended.',
        timestamp: new Date(Date.now() - 86400000),
        schoolSlug,
        teacherSlug,
      }
    ];
  },

  /**
   * Fetch active Sentinel Agents status
   */
  async getAgentStatus(schoolSlug: string, teacherSlug: string): Promise<AgentStatus[]> {
    // This represents the AI monitoring tasks running for this teacher
    return [
      {
        id: 'agent_1',
        name: 'Reinforcement Sentinel',
        status: 'active',
        lastActivity: 'Scanned 4m ago',
      },
      {
        id: 'agent_2',
        name: 'Parent Engagement Monitor',
        status: 'scanning',
        lastActivity: 'Analyzing messages...',
      },
      {
        id: 'agent_3',
        name: 'Behavior Trend Detector',
        status: 'active',
        lastActivity: 'Weekly report ready',
      }
    ];
  }
};
