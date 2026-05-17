
export enum UserRole {
  TEACHER = 'TEACHER',
  PARENT = 'PARENT'
}

export enum HomeworkPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum HomeworkStatus {
  PENDING = 'PENDING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  subjects?: string[];
  classes?: string[];
}

export interface AILog {
  date: string;
  message: string;
  isSmartAttempt: boolean;
}

export interface Student {
  id: string;
  name: string;
  parentId: string;
  class: string;
  birthday?: string; // ISO format YYYY-MM-DD
  xp: number;
  rank: number;
  aiLogs?: AILog[];
  pendingUpdate?: {
    name: string;
    class: string;
    birthday?: string;
    requestDate: string;
  };
}

export interface Homework {
  id: string;
  subject: string;
  title: string;
  description: string;
  priority: HomeworkPriority;
  dueDate: string;
  teacherId: string;
  targetStudentIds: string[];
  snapshot?: string;
}

export interface HomeworkRecord {
  homeworkId: string;
  studentId: string;
  status: HomeworkStatus;
  acknowledged: boolean;
  lastUpdated: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  threadId: string;
}

export interface Developer {
  name: string;
  role: string;
}
