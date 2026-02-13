import { motion } from 'framer-motion';
import { GameProgress, RANKS, BADGES } from '@/types/game';
import { getProblemById } from '@/data/problems';
import { getAverageScore } from '@/lib/gameStore';
import { 
  TrendingUp, 
  Trophy, 
  Target, 
  Calendar,
  ArrowLeft,
  Star,
  Zap
} from 'lucide-react';

interface ProgressScreenProps {
  progress: GameProgress;
  onBack: () => void;
}

export const ProgressScreen = ({ progress, onBack }: ProgressScreenProps) => {
  const history = progress.history || [];
  const avgScore = getAverageScore(history);
  const totalProblems = history.length;
  const currentRankIndex = RANKS.findIndex(r => r.name === progress.rank);
  const nextRank = RANKS[currentRankIndex + 1];

  // Calculate skill distribution
  const skillStats = history.reduce((acc, entry) => {
    const problem = getProblemById(entry.problemId);
    if (problem) {
      acc[problem.skill] = (acc[problem.skill] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Recent history (last 10)
  const recentHistory = [...history].reverse().slice(0, 10);

  // Score trend
  const scoreTrend = history.slice(-7).map(h => h.score);

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 max-w-4xl xl:max-w-5xl 2xl:max-w-6xl 3xl:max-w-7xl 4xl:max-w-[1600px]">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="mb-8 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </motion.button>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold gradient-text mb-8 text-center"
      >
        📊 Progress của bạn
      </motion.h1>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="glass-card-strong rounded-xl p-4 text-center">
          <Star className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold gradient-text">{progress.level}</p>
          <p className="text-xs text-muted-foreground">Level</p>
        </div>
        <div className="glass-card-strong rounded-xl p-4 text-center">
          <Zap className="w-6 h-6 text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold text-accent">{progress.xp}</p>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </div>
        <div className="glass-card-strong rounded-xl p-4 text-center">
          <Target className="w-6 h-6 text-mint mx-auto mb-2" />
          <p className="text-2xl font-bold text-mint">{avgScore}</p>
          <p className="text-xs text-muted-foreground">Điểm TB</p>
        </div>
        <div className="glass-card-strong rounded-xl p-4 text-center">
          <Trophy className="w-6 h-6 text-peach mx-auto mb-2" />
          <p className="text-2xl font-bold text-peach-foreground">{totalProblems}</p>
          <p className="text-xs text-muted-foreground">Bài đã làm</p>
        </div>
      </motion.div>

      {/* Rank Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card-strong rounded-2xl p-6 mb-6"
      >
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-peach" />
          Rank Progress
        </h3>

        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold gradient-text">{progress.rank}</p>
            <p className="text-xs text-muted-foreground">Current</p>
          </div>
          {nextRank && (
            <>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${((progress.xp - RANKS[currentRankIndex].minXP) / (nextRank.minXP - RANKS[currentRankIndex].minXP)) * 100}%` 
                    }}
                    className="h-full xp-bar rounded-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {nextRank.minXP - progress.xp} XP to next
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{nextRank.name}</p>
                <p className="text-xs text-muted-foreground">Next</p>
              </div>
            </>
          )}
        </div>

        {/* Rank ladder */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {RANKS.map((rank, i) => (
            <div
              key={rank.name}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                i <= currentRankIndex
                  ? 'bg-gradient-button text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {rank.name}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card-strong rounded-2xl p-6 mb-6"
      >
        <h3 className="font-semibold text-foreground mb-4">🏆 Badges</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(BADGES).map(([name, badge]) => {
            const earned = progress.badges.includes(name);
            return (
              <div
                key={name}
                className={`p-3 rounded-xl text-center transition-all ${
                  earned 
                    ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30' 
                    : 'bg-muted/50 opacity-50'
                }`}
              >
                <span className="text-2xl">{badge.icon}</span>
                <p className={`text-sm font-medium mt-1 ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Score Trend */}
      {scoreTrend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-strong rounded-2xl p-6 mb-6"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Điểm 7 bài gần nhất
          </h3>

          <div className="flex items-end justify-between gap-2 h-32">
            {scoreTrend.map((score, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(score / 10) * 100}%` }}
                  transition={{ delay: i * 0.1 }}
                  className={`w-full rounded-t-lg ${
                    score >= 8 ? 'bg-gradient-mint' : score >= 5 ? 'bg-gradient-peach' : 'bg-destructive'
                  }`}
                />
                <span className="text-xs text-muted-foreground">{score}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent History */}
      {recentHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-strong rounded-2xl p-6"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            Lịch sử gần đây
          </h3>

          <div className="space-y-3">
            {recentHistory.map((entry, i) => {
              const problem = getProblemById(entry.problemId);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      entry.score >= 8 ? 'bg-mint/20 text-mint' : 
                      entry.score >= 5 ? 'bg-peach/20 text-peach' : 
                      'bg-destructive/20 text-destructive'
                    }`}>
                      <span className="font-bold">{entry.score}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {problem?.title || `Problem #${entry.problemId}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('vi-VN')} • {entry.mode}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    entry.mode === 'interview' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-mint/10 text-mint'
                  }`}>
                    {entry.mode}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {recentHistory.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card-strong rounded-2xl p-12 text-center"
        >
          <p className="text-4xl mb-4">🚀</p>
          <p className="text-muted-foreground">
            Chưa có lịch sử. Hãy bắt đầu luyện tập ngay!
          </p>
        </motion.div>
      )}
    </div>
  );
};
