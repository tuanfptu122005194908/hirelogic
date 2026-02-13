import { motion } from 'framer-motion';
import { 
  Trophy, Calendar, Target, CheckCircle, Flame,
  ArrowRight, AlertCircle, Gift, Sparkles, Clock
} from 'lucide-react';
import { ChallengeProgress, CHALLENGE_RULES, DailyChallenge } from '@/types/challenge';
import { getChallengeStats } from '@/lib/challengeStore';
import { CountdownTimer } from './CountdownTimer';

interface ChallengeDashboardProps {
  progress: ChallengeProgress;
  currentDayChallenge: DailyChallenge | null;
  onStartProblem: (difficulty: 'Easy' | 'Medium' | 'Hard') => void;
  onViewGuide: () => void;
}

export const ChallengeDashboard = ({ 
  progress, 
  currentDayChallenge, 
  onStartProblem,
  onViewGuide 
}: ChallengeDashboardProps) => {
  const stats = getChallengeStats(progress);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const isDayComplete = currentDayChallenge?.completed ?? false;

  const difficulties = [
    {
      key: 'easy' as const,
      label: 'Dễ',
      emoji: '🟢',
      gradient: 'from-emerald-500 to-green-600',
      bgLight: 'from-emerald-50 to-green-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      progressColor: 'bg-emerald-500',
      buttonLabel: 'Easy',
    },
    {
      key: 'medium' as const,
      label: 'Trung bình',
      emoji: '🟡',
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'from-amber-50 to-orange-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      progressColor: 'bg-amber-500',
      buttonLabel: 'Medium',
    },
    {
      key: 'hard' as const,
      label: 'Khó',
      emoji: '🔴',
      gradient: 'from-rose-500 to-red-600',
      bgLight: 'from-rose-50 to-red-50',
      border: 'border-rose-200',
      text: 'text-rose-700',
      progressColor: 'bg-rose-500',
      buttonLabel: 'Hard',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Challenge Progress Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border border-primary/10 shadow-xl"
      >
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-primary/15 to-accent/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-br from-yellow-300/15 to-orange-300/15 rounded-full blur-3xl" />

        <div className="relative z-10 p-6 md:p-8">
          {/* Top row: Title + Reward */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-6">
            <div className="flex items-center gap-4">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shrink-0"
              >
                <Flame className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black gradient-text mb-0.5">
                  Thử Thách 20 Ngày
                </h2>
                <p className="text-muted-foreground font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Ngày {progress.currentDay} / {CHALLENGE_RULES.totalDays}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {!isDayComplete && currentDayChallenge && (
                <CountdownTimer deadline={currentDayChallenge.deadline} />
              )}
              <div className="text-center px-5 py-3 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 shadow-sm">
                <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
                  {formatCurrency(CHALLENGE_RULES.reward)}
                </p>
                <p className="text-xs font-bold text-amber-600 flex items-center justify-center gap-1">
                  <Gift className="w-3.5 h-3.5" /> Phần thưởng
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-muted-foreground">Tiến độ tổng</span>
              <span className="text-xl font-black gradient-text">
                {Math.round(stats.progressPercentage)}%
              </span>
            </div>
            <div className="h-4 bg-muted/40 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.progressPercentage}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary via-accent to-mint rounded-full relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              </motion.div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: progress.consecutiveDays, label: 'Ngày liên tiếp', color: 'from-blue-500 to-indigo-600', bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', icon: '🔥' },
              { value: stats.completedProblems, label: 'Bài đã làm', color: 'from-primary to-accent', bg: 'from-pink-50 to-purple-50', border: 'border-pink-200', icon: '✅' },
              { value: stats.daysRemaining, label: 'Ngày còn lại', color: 'from-emerald-500 to-green-600', bg: 'from-emerald-50 to-green-50', border: 'border-emerald-200', icon: '📅' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3, scale: 1.02 }}
                className={`text-center p-4 rounded-2xl bg-gradient-to-br ${stat.bg} border ${stat.border} shadow-sm`}
              >
                <p className="text-xs mb-1">{stat.icon}</p>
                <p className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs font-bold text-muted-foreground mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <button
            onClick={onViewGuide}
            className="mt-4 text-sm font-semibold text-primary hover:text-accent flex items-center gap-1.5 transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            Xem lại luật chơi
          </button>
        </div>
      </motion.div>

      {/* Today's Challenge */}
      {currentDayChallenge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-white/95 backdrop-blur-xl border border-accent/10 shadow-xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-md">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-xl gradient-text">
                Nhiệm Vụ Hôm Nay
              </h3>
              <p className="text-xs text-muted-foreground font-medium">Ngày {currentDayChallenge.day}</p>
            </div>
          </div>

          <div className="space-y-4">
            {difficulties.map((diff) => {
              const completed = currentDayChallenge.completedProblems[diff.key].length;
              const required = CHALLENGE_RULES.dailyRequirements[diff.key];
              const isDone = completed >= required;
              const percent = (completed / required) * 100;

              return (
                <motion.div
                  key={diff.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`rounded-2xl p-4 bg-gradient-to-r ${diff.bgLight} border ${diff.border} shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{diff.emoji}</span>
                      <span className={`font-bold ${diff.text}`}>{diff.label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-white/80 text-muted-foreground'}`}>
                        {completed}/{required}
                      </span>
                    </div>
                    {isDone ? (
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-xs font-bold">Hoàn thành</span>
                      </div>
                    ) : (
                      <motion.button
                        onClick={() => onStartProblem(diff.buttonLabel as 'Easy' | 'Medium' | 'Hard')}
                        className={`relative group px-5 py-2 bg-gradient-to-r ${diff.gradient} text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden`}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        />
                        <span className="relative z-10 flex items-center gap-2 text-sm">
                          Làm bài <ArrowRight className="w-4 h-4" />
                        </span>
                      </motion.button>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="h-2.5 bg-white/60 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full ${diff.progressColor} rounded-full`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {currentDayChallenge.completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl flex items-center gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-black text-emerald-800 text-lg">🎉 Hoàn thành ngày {currentDayChallenge.day}!</p>
                <p className="text-sm text-emerald-600">Quay lại vào ngày mai để tiếp tục thử thách</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* 20-Day Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl bg-white/95 backdrop-blur-xl border border-secondary/10 shadow-xl p-6 md:p-8"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-md">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-black text-xl gradient-text">
            Lịch Thử Thách
          </h3>
        </div>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {Array.from({ length: CHALLENGE_RULES.totalDays }).map((_, index) => {
            const day = index + 1;
            const challenge = progress.dailyChallenges[index];
            const isCompleted = challenge?.completed;
            const isCurrent = day === progress.currentDay;
            const isPast = day < progress.currentDay;

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.1 }}
                className={`
                  aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all cursor-default
                  ${isCompleted 
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-md shadow-emerald-200/50' 
                    : isCurrent 
                      ? 'bg-gradient-to-br from-primary to-accent text-white ring-2 ring-primary/30 ring-offset-2 shadow-md shadow-primary/30' 
                      : isPast && !isCompleted
                        ? 'bg-destructive/10 text-destructive border border-destructive/20'
                        : 'bg-muted/50 text-muted-foreground border border-muted'
                  }
                `}
              >
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : day}
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center gap-5 mt-4 text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm" />
            <span>Hoàn thành</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-gradient-to-br from-primary to-accent shadow-sm" />
            <span>Hôm nay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-destructive/10 border border-destructive/20" />
            <span>Bỏ lỡ</span>
          </div>
        </div>
      </motion.div>

      {/* Challenge Complete */}
      {stats.isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-white/95 backdrop-blur-xl border border-yellow-200 shadow-xl p-8 text-center bg-gradient-to-br from-yellow-50/80 via-white to-amber-50/80"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-xl shadow-yellow-200/50"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-black mb-2">🎉 Chúc mừng!</h2>
          <p className="text-muted-foreground mb-4">
            Bạn đã hoàn thành Thử Thách 20 Ngày!
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-100 rounded-xl border border-yellow-200 shadow-sm">
            <Gift className="w-5 h-5 text-yellow-600" />
            <span className="font-black text-yellow-700">{formatCurrency(CHALLENGE_RULES.reward)}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Liên hệ admin để nhận thưởng sau khi xác minh
          </p>
        </motion.div>
      )}
    </div>
  );
};
