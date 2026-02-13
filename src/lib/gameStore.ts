import { GameProgress, RANKS } from '@/types/game';

const STORAGE_KEY = 'codemind_progress';

const defaultProgress: GameProgress = {
  level: 1,
  xp: 0,
  rank: 'Intern',
  badges: [],
  history: [],
};

export const loadProgress = (): GameProgress => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with default progress to ensure all required properties exist
      return { ...defaultProgress, ...parsed };
    }
  } catch (error) {
    console.error('Error loading progress:', error);
  }
  return { ...defaultProgress };
};

export const saveProgress = (progress: GameProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

export const calculateRank = (xp: number): string => {
  let currentRank = RANKS[0].name;
  for (const rank of RANKS) {
    if (xp >= rank.minXP) {
      currentRank = rank.name;
    }
  }
  return currentRank;
};

export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 50) + 1;
};

export const getXPForScore = (score: number, mode: 'practice' | 'interview'): number => {
  const baseXP = score * 5;
  const modeMultiplier = mode === 'interview' ? 1.5 : 1;
  
  if (score >= 9) return Math.round(80 * modeMultiplier);
  if (score >= 7) return Math.round(50 * modeMultiplier);
  if (score >= 5) return Math.round(30 * modeMultiplier);
  return Math.round(baseXP * modeMultiplier);
};

export const checkNewBadges = (
  progress: GameProgress,
  newScore: number,
  mode: 'practice' | 'interview'
): string[] => {
  const newBadges: string[] = [];

  // Ensure progress has required properties
  const history = progress.history || [];
  const badges = progress.badges || [];

  // First Blood
  if (history.length === 0 && !badges.includes('First Blood')) {
    newBadges.push('First Blood');
  }

  // Interview Ready
  if (mode === 'interview' && newScore >= 9 && !badges.includes('Interview Ready')) {
    newBadges.push('Interview Ready');
  }

  // Logic Thinker (8+ score 3 times)
  const highScores = history.filter(h => h.score >= 8).length;
  if (highScores >= 2 && newScore >= 8 && !badges.includes('Logic Thinker')) {
    newBadges.push('Logic Thinker');
  }

  // Quick Thinker (Interview under 10 min with score >= 7)
  if (mode === 'interview' && newScore >= 7 && !badges.includes('Quick Thinker')) {
    newBadges.push('Quick Thinker');
  }

  // Streak Master (5 in a row)
  if (history.length >= 4 && !badges.includes('Streak Master')) {
    newBadges.push('Streak Master');
  }

  return newBadges;
};

export const addHistoryEntry = (
  progress: GameProgress,
  problemId: number,
  score: number,
  mode: 'practice' | 'interview',
  feedback?: string
): GameProgress => {
  const xpGained = getXPForScore(score, mode);
  const newXP = progress.xp + xpGained;
  const newBadges = checkNewBadges(progress, score, mode);
  
  const updatedProgress: GameProgress = {
    ...progress,
    xp: newXP,
    level: calculateLevel(newXP),
    rank: calculateRank(newXP),
    badges: [...progress.badges, ...newBadges],
    history: [
      ...progress.history,
      {
        problemId,
        score,
        date: new Date().toISOString(),
        mode,
        feedback,
      },
    ],
  };

  saveProgress(updatedProgress);
  return updatedProgress;
};

export const getAverageScore = (history: GameProgress['history']): number => {
  if (history.length === 0) return 0;
  const sum = history.reduce((acc, h) => acc + h.score, 0);
  return Math.round((sum / history.length) * 10) / 10;
};

export const getSkillStats = (history: GameProgress['history']): Record<string, number> => {
  const stats: Record<string, { total: number; count: number }> = {};
  
  history.forEach(entry => {
    // This would need problem data to be accurate
    // For now, return mock data
  });

  return {};
};
