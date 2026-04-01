import { AgentResponse, TargetType, AgentResponseType } from '@/lib/types/messaging';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export class MessagingAgent {
  /**
   * Analyze message context and determine intended recipients
   */
  static async analyzeMessage(
    schoolId: string,
    senderId: string,
    content: string,
    metadata?: any
  ): Promise<AgentResponse> {
    // 1. Context Detection (NLP Mock)
    const context = await this.detectContext(schoolId, content);

    // 2. Audience Intelligence
    const targetType = this.determineTarget(content, context);

    // 3. Resolve actual recipients (IDs) from the detected context
    const recipients = await this.resolveRecipients(schoolId, context, targetType);

    // 4. Generate structured JSON response
    const type: AgentResponseType = this.determineType(content, context);
    const message = this.generateAIContent(content, context, type);
    const suggestions = this.generateSuggestions(content, context, type);

    return {
      type,
      target: targetType,
      recipients,
      message,
      suggestions,
      metadata: context,
    };
  }

  /**
   * Smart Context Awareness
   * Scans content for learners, grades, and subjects within the school scope
   */
  private static async detectContext(schoolId: string, content: string) {
    const lowerContent = content.toLowerCase();
    const context: any = {};

    const client = await clientPromise;
    if (client) {
      const db = client.db();

      // In a real implementation, we would query 'students' and 'classrooms' to match names
      // For this implementation, we use regex/keyword detection with schoolId scoping concepts

      // Example matching for learner names (Mocked database check)
      const learners = ['Thabo', 'Sarah', 'Kobus', 'Ayanda'];
      for (const learner of learners) {
        if (lowerContent.includes(learner.toLowerCase())) {
          context.learnerName = learner;
          // In reality: context.studentId = await db.collection('students').findOne({ name: learner, schoolId })._id;
          break;
        }
      }

      // Matching for grade levels
      const gradeMatches = lowerContent.match(/grade\s*(\d+)/i);
      if (gradeMatches) {
        context.grade = `Grade ${gradeMatches[1]}`;
        // In reality: context.gradeId = await db.collection('classrooms').findOne({ grade: context.grade, schoolId })._id;
      }

      // Matching for subjects
      const subjects = ['Math', 'Science', 'English', 'History'];
      for (const sub of subjects) {
        if (lowerContent.includes(sub.toLowerCase())) {
          context.subject = sub;
          break;
        }
      }
    }

    if (lowerContent.includes('late') || lowerContent.includes('absent') || lowerContent.includes('homework')) {
        context.detectedIntention = 'performance_alert';
    }

    return context;
  }

  /**
   * Group Intelligence logic
   */
  private static determineTarget(content: string, context: any): TargetType {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('entire class') || lowerContent.includes('all parents') || lowerContent.includes('grade-wide')) {
      return 'group';
    }
    if (context.learnerName && !lowerContent.includes('class')) {
      return 'individual';
    }
    return 'individual';
  }

  /**
   * Resolve recipient IDs based on detected context and school metadata
   */
  private static async resolveRecipients(schoolId: string, context: any, target: TargetType): Promise<string[]> {
    const recipients: string[] = [];
    const client = await clientPromise;
    if (!client) return [];

    const db = client.db();

    if (target === 'individual' && context.learnerName) {
      // Find parent IDs for the specific student in this school
      // const student = await db.collection('students').findOne({ name: context.learnerName, schoolId });
      // if (student) recipients.push(...student.parentIds);

      // Mocked recipient for individual (Parent of Thabo)
      recipients.push('parent_id_123');
    } else if (target === 'group' && context.grade) {
      // Find all parent IDs for a grade within this school
      // const learnersInGrade = await db.collection('students').find({ grade: context.grade, schoolId }).toArray();
      // recipients.push(...new Set(learnersInGrade.flatMap(l => l.parentIds)));

      // Mocked recipients for group (All parents in Grade 10)
      recipients.push('parent_id_1', 'parent_id_2', 'parent_id_3');
    }

    return recipients;
  }

  private static determineType(content: string, context: any): AgentResponseType {
    if (context.detectedIntention === 'performance_alert') return 'alert';
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('suggest') || lowerContent.includes('reply')) return 'suggestion';
    return 'message';
  }

  private static generateAIContent(content: string, context: any, type: AgentResponseType): string {
    if (type === 'alert' && context.learnerName) {
      return `Automated Alert: ${context.learnerName}'s ${context.subject || 'work'} is flagged for ${context.detectedIntention === 'performance_alert' ? 'low engagement' : 'review'}. Notify parents?`;
    }
    if (context.learnerName && context.subject) {
      return `Drafting update for ${context.learnerName} regarding ${context.subject} performance.`;
    }
    return content;
  }

  private static generateSuggestions(content: string, context: any, type: AgentResponseType): string[] {
    const suggestions: string[] = [];

    if (context.learnerName) {
      suggestions.push(`Send performance update to ${context.learnerName}'s parents`);
      suggestions.push(`Link to ${context.learnerName}'s point history`);
    }

    if (context.grade && !context.learnerName) {
      suggestions.push(`Post announcement to all ${context.grade} students`);
    }

    if (type === 'alert') {
      suggestions.push("Mark as urgent priority");
      suggestions.push("Notify Principal automatically");
    }

    return suggestions;
  }
}
