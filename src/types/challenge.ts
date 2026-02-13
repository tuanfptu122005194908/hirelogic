// Challenge Types for 20-Day Challenge System

export interface DailyChallenge {
  day: number;
  date: string; // YYYY-MM-DD
  deadline: string; // ISO string with timezone (23:59:59 of the date)
  completed: boolean;
  problems: {
    easy: number[]; // Array of 3 problem IDs
    medium: number[]; // Array of 1 problem ID
    hard: number[]; // Array of 1 problem ID
  };
  completedProblems: {
    easy: number[];
    medium: number[];
    hard: number[];
  };
}

export interface ChallengeProgress {
  isActive: boolean;
  startDate: string | null;
  currentDay: number;
  consecutiveDays: number;
  completedDays: number;
  dailyChallenges: DailyChallenge[];
  activityLogs: ActivityLog[];
  lastActivityDate: string | null;
  failed: boolean; // True if user failed to complete a day
  failedReason?: string; // Reason for failure
  completed?: boolean; // True if challenge completed successfully (20 days)
  banned?: boolean; // True if account is permanently banned (5+ violations)
  violationCount?: number; // Number of anti-cheat violations
}

export interface ActivityLog {
  timestamp: string;
  problemId: number;
  action: 'start' | 'typing' | 'paste' | 'submit';
  details?: {
    pasteLength?: number;
    typingSpeed?: number; // chars per minute
    totalPasteEvents?: number;
    codeLength?: number;
    timeTaken?: number; // seconds
  };
}

export interface SuspiciousActivity {
  problemId: number;
  date: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

export const CHALLENGE_RULES = {
  totalDays: 20,
  dailyRequirements: {
    easy: 3,
    medium: 1,
    hard: 1,
  },
  reward: 200000, // 200k VND
  minScoreToPass: 6, // Minimum score to count as completed
  maxPastePercentage: 30, // Max 30% of code can be pasted
  minTypingSpeed: 10, // Minimum 10 chars per minute to be valid
};
