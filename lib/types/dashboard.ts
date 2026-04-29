export interface School {
  id: string;
  schoolName: string;
  slug: string;
  logo?: string;
  stats?: {
    teachers: number;
    students: number;
    parents: number;
  };
}

export interface Teacher {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  bio?: string;
  email?: string;
  auth0Id?: string;
}

export interface ActivityLog {
  id: string;
  type: 'insight' | 'message' | 'alert' | 'success';
  title: string;
  description: string;
  timestamp: Date;
  schoolSlug: string;
  teacherSlug: string;
  metadata?: {
    trend?: 'up' | 'down';
    trendValue?: number;
    trendLabel?: string;
    [key: string]: any;
  };
}

export interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'scanning' | 'alert' | 'error';
  lastActivity: string;
  metadata?: any;
}

export interface DashboardData {
  school: School;
  teacher: Teacher;
  activities: ActivityLog[];
  agents: AgentStatus[];
  classes: {
    id: string;
    grade_name: string;
    learner_count: number;
    connection_rate?: number;
  }[];
  stats?: {
    totalLearners: number;
    activeGrades: number;
    pendingInvites: number;
    parentConnectionRate: number;
  };
}
