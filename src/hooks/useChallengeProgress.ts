import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChallengeProgress, DailyChallenge, CHALLENGE_RULES, ActivityLog } from '@/types/challenge';
import { useAuth } from './useAuth';
import { problems } from '@/data/problems';
import { 
  getLocalDateString, 
  isToday, 
  getDaysDifference, 
  isBeforeDeadline,
  getDeadlineString 
} from '@/lib/dateUtils';

// Metadata stored in activity_logs JSON to persist failed/banned status
interface ChallengeMetadata {
  _type: 'challenge_status';
  failed: boolean;
  failedReason?: string;
  banned: boolean;
  completed?: boolean;
  violationCount?: number;
}

const METADATA_TYPE = 'challenge_status';

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

// Extract metadata from activity_logs
const extractMetadata = (activityLogs: any[]): ChallengeMetadata | null => {
  if (!Array.isArray(activityLogs)) return null;
  const meta = activityLogs.find((log: any) => log._type === METADATA_TYPE);
  return meta || null;
};

// Save metadata into activity_logs (replace existing or add)
const setMetadataInLogs = (activityLogs: any[], metadata: ChallengeMetadata): any[] => {
  const filtered = Array.isArray(activityLogs) 
    ? activityLogs.filter((log: any) => log._type !== METADATA_TYPE)
    : [];
  return [...filtered, metadata];
};

// Get problems by difficulty from the actual problem list
const getProblemsByDifficulty = (difficulty: 'Easy' | 'Medium' | 'Hard'): number[] => {
  return problems.filter(p => p.difficulty === difficulty).map(p => p.id);
};

// Generate random problems ensuring no repeats across days
const generateRandomProblemIds = (
  count: number, 
  difficulty: 'Easy' | 'Medium' | 'Hard',
  excludeIds: number[] = []
): number[] => {
  const availableIds = getProblemsByDifficulty(difficulty).filter(id => !excludeIds.includes(id));
  const shuffled = [...availableIds].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Get all previously used problem IDs from daily challenges
const getUsedProblemIds = (dailyChallenges: DailyChallenge[]): number[] => {
  const usedIds: number[] = [];
  dailyChallenges.forEach(day => {
    usedIds.push(...day.problems.easy, ...day.problems.medium, ...day.problems.hard);
  });
  return usedIds;
};

const generateDailyChallenge = (day: number, date: string, excludeIds: number[] = []): DailyChallenge => {
  const easyProblems = generateRandomProblemIds(3, 'Easy', excludeIds);
  const mediumProblems = generateRandomProblemIds(1, 'Medium', excludeIds);
  const hardProblems = generateRandomProblemIds(1, 'Hard', excludeIds);

  return {
    day,
    date,
    deadline: getDeadlineString(date),
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

// Validate and update challenge progress based on current date
const validateAndUpdateProgress = (progress: ChallengeProgress): ChallengeProgress => {
  // If already failed or banned, DON'T allow restart
  if (progress.failed || progress.banned) {
    return {
      ...progress,
      isActive: false,
    };
  }

  if (!progress.isActive) {
    return progress;
  }

  const today = getLocalDateString();
  const lastActivity = progress.lastActivityDate;
  
  if (!lastActivity) {
    return progress;
  }

  // Check if it's still the same day
  if (isToday(lastActivity)) {
    return progress;
  }

  // Get the current day's challenge
  const currentDayChallenge = progress.dailyChallenges[progress.currentDay - 1];
  
  if (!currentDayChallenge) {
    return progress;
  }

  const daysDiff = getDaysDifference(lastActivity, today);

  // If more than 1 day has passed, the user failed
  if (daysDiff > 1) {
    return {
      ...progress,
      isActive: false,
      failed: true,
      consecutiveDays: 0,
      failedReason: `Bạn đã bỏ lỡ ${daysDiff - 1} ngày. Thử thách đã kết thúc vĩnh viễn.`,
    };
  }

  // It's the next day (daysDiff === 1)
  // Check if yesterday's challenge was completed (all 5 problems)
  if (!currentDayChallenge.completed) {
    return {
      ...progress,
      isActive: false,
      failed: true,
      consecutiveDays: 0,
      failedReason: `Bạn chưa hoàn thành đủ 5 bài trong Ngày ${progress.currentDay}. Thử thách đã kết thúc vĩnh viễn.`,
    };
  }

  // Yesterday was completed, advance to next day
  if (progress.currentDay >= CHALLENGE_RULES.totalDays) {
    return {
      ...progress,
      isActive: false,
      completed: true,
    };
  }

  // Generate new daily challenge for today
  const usedIds = getUsedProblemIds(progress.dailyChallenges);
  const newDayNumber = progress.currentDay + 1;
  const newDailyChallenge = generateDailyChallenge(newDayNumber, today, usedIds);

  return {
    ...progress,
    currentDay: newDayNumber,
    consecutiveDays: progress.consecutiveDays + 1,
    dailyChallenges: [...progress.dailyChallenges, newDailyChallenge],
    lastActivityDate: today,
  };
};

// Check if account is banned - now uses metadata from user_progress, not cheat_logs
const checkAccountBanned = async (_userId: string): Promise<boolean> => {
  // Ban status is now persisted in user_progress activity_logs metadata
  // This function is kept for interface compatibility but the actual check
  // happens when loading metadata from activity_logs
  return false;
};

export const useChallengeProgress = () => {
  const { user, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState<ChallengeProgress>(defaultChallengeProgress);
  const [loading, setLoading] = useState(true);

  // Load progress from database
  const loadProgress = useCallback(async () => {
    if (!user) {
      setProgress(defaultChallengeProgress);
      setLoading(false);
      return;
    }

    try {
      // Load progress and check ban status in parallel
      const [progressResult, isBanned] = await Promise.all([
        supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id as any)
          .maybeSingle(),
        checkAccountBanned(user.id),
      ]);

      const { data, error } = progressResult;

      if (error) {
        console.error('Error loading progress:', error);
        setProgress(defaultChallengeProgress);
      } else if (data && !('error' in data)) {
        const dbData = data as any;
        let dailyChallenges: DailyChallenge[] = (dbData.daily_challenges as unknown as DailyChallenge[]) || [];
        
        // Ensure all daily challenges have deadline (backward compatibility)
        dailyChallenges = dailyChallenges.map(challenge => {
          if (!challenge.deadline) {
            return {
              ...challenge,
              deadline: getDeadlineString(challenge.date),
            };
          }
          return challenge;
        });

        // Extract persisted metadata from activity_logs
        const rawLogs = (dbData.activity_logs as any[]) || [];
        const metadata = extractMetadata(rawLogs);
        const regularLogs = rawLogs.filter((log: any) => log._type !== METADATA_TYPE);
        
        let challengeProgress: ChallengeProgress = {
          isActive: dbData.is_active as boolean,
          startDate: dbData.start_date as string,
          currentDay: dbData.current_day as number,
          consecutiveDays: dbData.consecutive_days as number,
          completedDays: dbData.completed_days as number,
          dailyChallenges,
          activityLogs: regularLogs,
          lastActivityDate: dbData.last_activity_date as string,
          // CRITICAL: Load failed/banned/violations from persisted metadata
          failed: metadata?.failed || false,
          failedReason: metadata?.failedReason,
          completed: metadata?.completed || false,
          banned: metadata?.banned || false,
          violationCount: metadata?.violationCount || 0,
        };

        // If banned from metadata, enforce it
        if (challengeProgress.banned || (challengeProgress.violationCount || 0) >= 5) {
          challengeProgress.banned = true;
          challengeProgress.isActive = false;
          challengeProgress.failed = true;
          challengeProgress.failedReason = 'Tài khoản này đã bị cấm vĩnh viễn do vi phạm 5 lần. Tài khoản khác vẫn hoạt động bình thường.';
        }
        
        // Validate and update based on current date (only if not already failed/banned)
        challengeProgress = validateAndUpdateProgress(challengeProgress);
        
        // If progress changed (day advanced, failed, or banned), save it back
        const hasChanged = 
          challengeProgress.currentDay !== dbData.current_day || 
          challengeProgress.failed !== (metadata?.failed || false) ||
          challengeProgress.banned !== (metadata?.banned || false);
        
        if (hasChanged) {
          await saveProgress(challengeProgress);
        }
        
        setProgress(challengeProgress);
      } else {
        // No progress record yet
        // But still check if account is banned
        if (isBanned) {
          const bannedProgress: ChallengeProgress = {
            ...defaultChallengeProgress,
            banned: true,
            failed: true,
            failedReason: 'Tài khoản này đã bị cấm vĩnh viễn do vi phạm 5 lần.',
          };
          setProgress(bannedProgress);
        } else {
          setProgress(defaultChallengeProgress);
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      setProgress(defaultChallengeProgress);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save progress to database (includes metadata in activity_logs)
  const saveProgress = useCallback(async (newProgress: ChallengeProgress) => {
    if (!user) return;

    try {
      // Build metadata to persist (includes violation count)
      const metadata: ChallengeMetadata = {
        _type: METADATA_TYPE,
        failed: newProgress.failed,
        failedReason: newProgress.failedReason,
        banned: newProgress.banned || false,
        completed: newProgress.completed,
        violationCount: newProgress.violationCount || 0,
      };

      // Embed metadata in activity_logs
      const logsWithMetadata = setMetadataInLogs(newProgress.activityLogs, metadata);

      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id as any)
        .maybeSingle();

      const dbData = {
        is_active: newProgress.isActive && !newProgress.failed && !newProgress.banned,
        start_date: newProgress.startDate,
        current_day: newProgress.currentDay,
        consecutive_days: newProgress.consecutiveDays,
        completed_days: newProgress.completedDays,
        daily_challenges: JSON.parse(JSON.stringify(newProgress.dailyChallenges)),
        activity_logs: JSON.parse(JSON.stringify(logsWithMetadata)),
        last_activity_date: newProgress.lastActivityDate,
      };

      if (existing) {
        const { error: updateError } = await supabase
          .from('user_progress')
          .update(dbData as any)
          .eq('user_id', user.id as any);
        if (updateError) console.error('Error updating progress:', updateError);
      } else {
        const { error: insertError } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            ...dbData,
          } as any);
        if (insertError) console.error('Error inserting progress:', insertError);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [user]);

  // Start challenge - ONLY if not failed/banned
  const startChallenge = useCallback(async () => {
    // Block if account is banned or previously failed
    if (progress.banned) {
      return progress;
    }
    if (progress.failed) {
      return progress;
    }

    const today = getLocalDateString();
    const newProgress: ChallengeProgress = {
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
      banned: false,
    };
    
    setProgress(newProgress);
    await saveProgress(newProgress);
    return newProgress;
  }, [saveProgress, progress.banned, progress.failed]);

  // Reset challenge (admin only - requires password check in UI)
  const resetChallenge = useCallback(async () => {
    const resetProgress: ChallengeProgress = {
      ...defaultChallengeProgress,
      failed: false,
      failedReason: undefined,
      banned: false,
    };
    
    setProgress(resetProgress);
    await saveProgress(resetProgress);
    return resetProgress;
  }, [saveProgress]);

  // Mark problem completed
  const markProblemCompleted = useCallback(async (
    problemId: number,
    difficulty: 'Easy' | 'Medium' | 'Hard',
    score: number
  ) => {
    // Block if banned
    if (progress.banned) {
      return progress;
    }

    // First, validate current progress
    const validatedProgress = validateAndUpdateProgress(progress);
    
    // If validation resulted in failure, save and return
    if (validatedProgress.failed) {
      setProgress(validatedProgress);
      await saveProgress(validatedProgress);
      return validatedProgress;
    }

    if (score < CHALLENGE_RULES.minScoreToPass) {
      return validatedProgress;
    }

    const currentChallenge = validatedProgress.dailyChallenges[validatedProgress.currentDay - 1];
    if (!currentChallenge) return validatedProgress;

    // Check if deadline has passed
    if (!isBeforeDeadline(currentChallenge.date)) {
      if (!currentChallenge.completed) {
        const failedProgress: ChallengeProgress = {
          ...validatedProgress,
          isActive: false,
          failed: true,
          consecutiveDays: 0,
          failedReason: `Đã quá hạn hoàn thành Ngày ${validatedProgress.currentDay}. Thử thách đã kết thúc vĩnh viễn.`,
        };
        setProgress(failedProgress);
        await saveProgress(failedProgress);
        return failedProgress;
      }
      return validatedProgress;
    }

    const diffKey = difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
    
    if (currentChallenge.completedProblems[diffKey].includes(problemId)) {
      return validatedProgress; // Already completed - locked
    }

    const updatedChallenge: DailyChallenge = {
      ...currentChallenge,
      completedProblems: {
        ...currentChallenge.completedProblems,
        [diffKey]: [...currentChallenge.completedProblems[diffKey], problemId],
      },
    };

    // Check if daily challenge is complete (all 5 problems done)
    const isComplete = 
      updatedChallenge.completedProblems.easy.length >= CHALLENGE_RULES.dailyRequirements.easy &&
      updatedChallenge.completedProblems.medium.length >= CHALLENGE_RULES.dailyRequirements.medium &&
      updatedChallenge.completedProblems.hard.length >= CHALLENGE_RULES.dailyRequirements.hard;

    if (isComplete) {
      updatedChallenge.completed = true;
    }

    const dailyChallenges = [...validatedProgress.dailyChallenges];
    dailyChallenges[validatedProgress.currentDay - 1] = updatedChallenge;

    const today = getLocalDateString();
    const newProgress: ChallengeProgress = {
      ...validatedProgress,
      dailyChallenges,
      completedDays: isComplete ? validatedProgress.completedDays + 1 : validatedProgress.completedDays,
      consecutiveDays: isComplete ? validatedProgress.consecutiveDays + 1 : validatedProgress.consecutiveDays,
      lastActivityDate: today,
    };

    // Validate again after update
    const finalProgress = validateAndUpdateProgress(newProgress);

    setProgress(finalProgress);
    await saveProgress(finalProgress);
    return finalProgress;
  }, [progress, saveProgress]);

  // Load on mount and when user changes
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Increment violation count and persist to DB
  const addViolation = useCallback(async () => {
    const newCount = (progress.violationCount || 0) + 1;
    const isBanned = newCount >= 5;
    
    const updatedProgress: ChallengeProgress = {
      ...progress,
      violationCount: newCount,
      banned: isBanned,
      failed: isBanned ? true : progress.failed,
      failedReason: isBanned 
        ? 'Tài khoản này đã bị cấm vĩnh viễn do vi phạm 5 lần.'
        : progress.failedReason,
      isActive: isBanned ? false : progress.isActive,
    };
    
    setProgress(updatedProgress);
    await saveProgress(updatedProgress);
    return newCount;
  }, [progress, saveProgress]);

  return {
    progress,
    loading,
    startChallenge,
    markProblemCompleted,
    resetChallenge,
    addViolation,
    isAuthenticated,
  };
};
