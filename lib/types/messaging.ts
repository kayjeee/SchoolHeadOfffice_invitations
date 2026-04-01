import { z } from 'zod';

export type MessageType = 'text' | 'image' | 'file' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type TargetType = 'individual' | 'group';
export type AgentResponseType = 'message' | 'suggestion' | 'alert';

export interface Participant {
  id: string;
  name: string;
  role: 'teacher' | 'parent' | 'principal' | 'staff';
  avatar?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: Date;
  metadata?: {
    learnerName?: string;
    grade?: string;
    subject?: string;
    [key: string]: any;
  };
}

export interface Conversation {
  id: string;
  schoolId: string;
  type: 'direct' | 'group';
  participants: Participant[];
  lastMessage?: Message;
  metadata?: {
    groupName?: string;
    gradeId?: string;
    classId?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentResponse {
  type: AgentResponseType;
  target: TargetType;
  recipients: string[];
  message: string;
  suggestions: string[];
  metadata?: {
    learnerName?: string;
    grade?: string;
    subject?: string;
    detectedIntention?: string;
    [key: string]: any;
  };
}
