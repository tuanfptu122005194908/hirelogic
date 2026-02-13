import { ChallengeProgress, DailyChallenge, ActivityLog, CHALLENGE_RULES, SuspiciousActivity } from '@/types/challenge';
export { CHALLENGE_RULES } from '@/types/challenge';
import { getLocalDateString, getDaysDifference, getDeadlineString } from './dateUtils';

const CHALLENGE_STORAGE_KEY = 'think_interviewer_challenge';
const ACTIVITY_STORAGE_KEY = 'think_interviewer_activity';

const defaultChallengeProgress: ChallengeProgress = {
  isActive: false,
  startDate: null,
  currentDay: 0,
  consecutiveDays: 0,
  completedDays: 0,
  dailyChallenges: [],
  activityLogs: [],
  lastActivityDate: null,
  failed: false,
  failedReason: undefined,
};

export const loadChallengeProgress = (): ChallengeProgress => {
  try {
    const saved = localStorage.getItem(CHALLENGE_STORAGE_KEY);
    if (saved) {
      const progress = JSON.parse(saved);
      // Check if challenge is still valid (not broken streak)
      return validateChallengeProgress(progress);
    }
  } catch (error) {
    console.error('Error loading challenge progress:', error);
  }
  return { ...defaultChallengeProgress };
};

export const saveChallengeProgress = (progress: ChallengeProgress): void => {
  try {
    localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving challenge progress:', error);
  }
};

export const validateChallengeProgress = (progress: ChallengeProgress): ChallengeProgress => {
  if (!progress.isActive || !progress.lastActivityDate) {
    return progress;
  }

  const today = getLocalDateString();
  const lastActivity = progress.lastActivityDate;
  const diffDays = getDaysDifference(lastActivity, today);

  // If more than 1 day has passed without activity, reset challenge
  if (diffDays > 1) {
    return {
      ...defaultChallengeProgress,
      activityLogs: progress.activityLogs, // Keep logs for review
      failed: true,
      failedReason: `Bạn đã bỏ lỡ ${diffDays - 1} ngày. Thử thách đã kết thúc.`,
    };
  }

  return progress;
};

export const startChallenge = (): ChallengeProgress => {
  const today = getLocalDateString();
  const progress: ChallengeProgress = {
    isActive: true,
    startDate: today,
    currentDay: 1,
    consecutiveDays: 0,
    completedDays: 0,
    dailyChallenges: [generateDailyChallenge(1, today)],
    activityLogs: [],
    lastActivityDate: today,
    failed: false,
    failedReason: undefined,
  };
  saveChallengeProgress(progress);
  return progress;
};

export const generateDailyChallenge = (day: number, date: string): DailyChallenge => {
  // Generate random problem IDs for each difficulty
  // In real app, this would be more sophisticated
  const easyProblems = generateRandomProblemIds(3, 'Easy');
  const mediumProblems = generateRandomProblemIds(1, 'Medium');
  const hardProblems = generateRandomProblemIds(1, 'Hard');

  return {
    day,
    date,
    deadline: getDeadlineString(date), // 23:59:59 of the date
    completed: false,
    problems: {
      easy: easyProblems,
      medium: mediumProblems,
      hard: hardProblems,
    },
    completedProblems: {
      easy: [],
      medium: [],
      hard: [],
    },
  };
};

const generateRandomProblemIds = (count: number, difficulty: string): number[] => {
  // This would be replaced with actual problem selection logic
  const baseId = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 50 : 80;
  const ids: number[] = [];
  for (let i = 0; i < count; i++) {
    ids.push(baseId + Math.floor(Math.random() * 20) + i);
  }
  return ids;
};

export const logActivity = (
  progress: ChallengeProgress,
  log: Omit<ActivityLog, 'timestamp'>
): ChallengeProgress => {
  const newLog: ActivityLog = {
    ...log,
    timestamp: new Date().toISOString(),
  };

  const updatedProgress = {
    ...progress,
    activityLogs: [...progress.activityLogs, newLog],
    lastActivityDate: getLocalDateString(),
  };

  saveChallengeProgress(updatedProgress);
  return updatedProgress;
};

export const markProblemCompleted = (
  progress: ChallengeProgress,
  problemId: number,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  score: number
): ChallengeProgress => {
  if (score < CHALLENGE_RULES.minScoreToPass) {
    return progress;
  }

  const currentChallenge = progress.dailyChallenges[progress.currentDay - 1];
  if (!currentChallenge) return progress;

  const diffKey = difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
  
  if (currentChallenge.completedProblems[diffKey].includes(problemId)) {
    return progress; // Already completed
  }

  const updatedChallenge: DailyChallenge = {
    ...currentChallenge,
    completedProblems: {
      ...currentChallenge.completedProblems,
      [diffKey]: [...currentChallenge.completedProblems[diffKey], problemId],
    },
  };

  // Check if daily challenge is complete
  const isComplete = 
    updatedChallenge.completedProblems.easy.length >= CHALLENGE_RULES.dailyRequirements.easy &&
    updatedChallenge.completedProblems.medium.length >= CHALLENGE_RULES.dailyRequirements.medium &&
    updatedChallenge.completedProblems.hard.length >= CHALLENGE_RULES.dailyRequirements.hard;

  if (isComplete) {
    updatedChallenge.completed = true;
  }

  const dailyChallenges = [...progress.dailyChallenges];
  dailyChallenges[progress.currentDay - 1] = updatedChallenge;

  const updatedProgress: ChallengeProgress = {
    ...progress,
    dailyChallenges,
    completedDays: isComplete ? progress.completedDays + 1 : progress.completedDays,
    consecutiveDays: isComplete ? progress.consecutiveDays + 1 : progress.consecutiveDays,
    lastActivityDate: getLocalDateString(),
  };

  saveChallengeProgress(updatedProgress);
  return updatedProgress;
};

export const advanceToNextDay = (progress: ChallengeProgress): ChallengeProgress => {
  if (progress.currentDay >= CHALLENGE_RULES.totalDays) {
    return {
      ...progress,
      isActive: false, // Mark as complete
    };
  }

  const today = getLocalDateString();
  const nextDay = progress.currentDay + 1;

  const updatedProgress: ChallengeProgress = {
    ...progress,
    currentDay: nextDay,
    dailyChallenges: [...progress.dailyChallenges, generateDailyChallenge(nextDay, today)],
    lastActivityDate: today,
  };

  saveChallengeProgress(updatedProgress);
  return updatedProgress;
};

export const detectSuspiciousActivity = (logs: ActivityLog[], problemId: number): SuspiciousActivity[] => {
  const suspiciousActivities: SuspiciousActivity[] = [];
  const problemLogs = logs.filter(l => l.problemId === problemId);

  // Check for excessive pasting
  const pasteEvents = problemLogs.filter(l => l.action === 'paste');
  const totalPasteLength = pasteEvents.reduce((sum, l) => sum + (l.details?.pasteLength || 0), 0);
  const submitLog = problemLogs.find(l => l.action === 'submit');
  const codeLength = submitLog?.details?.codeLength || 1;

  if (totalPasteLength / codeLength > CHALLENGE_RULES.maxPastePercentage / 100) {
    suspiciousActivities.push({
      problemId,
      date: new Date().toISOString(),
      reason: `Phát hiện copy/paste quá nhiều (${Math.round(totalPasteLength / codeLength * 100)}% code)`,
      severity: 'high',
    });
  }

  // Check for suspiciously fast typing (could indicate paste via typing simulation)
  const typingLogs = problemLogs.filter(l => l.action === 'typing' && l.details?.typingSpeed);
  const avgTypingSpeed = typingLogs.reduce((sum, l) => sum + (l.details?.typingSpeed || 0), 0) / (typingLogs.length || 1);
  
  if (avgTypingSpeed > 500) { // 500+ chars/min is suspicious
    suspiciousActivities.push({
      problemId,
      date: new Date().toISOString(),
      reason: 'Tốc độ gõ code bất thường',
      severity: 'medium',
    });
  }

  return suspiciousActivities;
};

export const getChallengeStats = (progress: ChallengeProgress) => {
  const totalProblemsRequired = CHALLENGE_RULES.totalDays * 
    (CHALLENGE_RULES.dailyRequirements.easy + 
     CHALLENGE_RULES.dailyRequirements.medium + 
     CHALLENGE_RULES.dailyRequirements.hard);

  const completedProblems = progress.dailyChallenges.reduce((sum, day) => {
    return sum + 
      day.completedProblems.easy.length + 
      day.completedProblems.medium.length + 
      day.completedProblems.hard.length;
  }, 0);

  const isComplete = progress.completed === true || 
    (!progress.failed && progress.completedDays >= CHALLENGE_RULES.totalDays);

  return {
    daysRemaining: CHALLENGE_RULES.totalDays - progress.completedDays,
    progressPercentage: (progress.completedDays / CHALLENGE_RULES.totalDays) * 100,
    totalProblemsRequired,
    completedProblems,
    isComplete,
    reward: CHALLENGE_RULES.reward,
  };
};
