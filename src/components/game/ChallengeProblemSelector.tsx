import { motion } from 'framer-motion';
import { Problem } from '@/types/game';
import { getProblemsByDifficulty } from '@/data/problems';
import { ArrowLeft, ChevronRight, X, Trophy, CheckCircle, Lock } from 'lucide-react';

interface ChallengeProblemSelectorProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completedProblemIds: number[];
  allCompletedProblemIds: number[]; // All problems completed across all days
  onSelectProblem: (problem: Problem) => void;
  onClose: () => void;
}

const difficultyColors = {
  Easy: { bg: 'bg-green-500/20', text: 'text-green-700', border: 'border-green-500/30', label: 'Dễ' },
  Medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-700', border: 'border-yellow-500/30', label: 'Trung bình' },
  Hard: { bg: 'bg-red-500/20', text: 'text-red-700', border: 'border-red-500/30', label: 'Khó' },
};

export const ChallengeProblemSelector = ({
  difficulty,
  completedProblemIds,
  allCompletedProblemIds,
  onSelectProblem,
  onClose,
}: ChallengeProblemSelectorProps) => {
  const problems = getProblemsByDifficulty(difficulty);
  const colors = difficultyColors[difficulty];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-background rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-border"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  Chọn bài tập
                  <span className={`text-sm px-2.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                    {colors.label}
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  {problems.length} bài • Chọn một bài để làm
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Problem List */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-4">
          <div className="space-y-2">
            {problems.map((problem, index) => {
              const isCompletedToday = completedProblemIds.includes(problem.id);
              const isCompletedPreviously = allCompletedProblemIds.includes(problem.id) && !isCompletedToday;
              const isDisabled = isCompletedToday || isCompletedPreviously;

              return (
                <motion.button
                  key={problem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => !isDisabled && onSelectProblem(problem)}
                  disabled={isDisabled}
                  className={`w-full text-left rounded-xl p-4 transition-all group border ${
                    isCompletedToday
                      ? 'bg-mint/5 border-mint/30 opacity-60 cursor-not-allowed'
                      : isCompletedPreviously
                      ? 'bg-muted/20 border-muted/30 opacity-40 cursor-not-allowed'
                      : 'bg-muted/30 border-border hover:bg-muted/50 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">#{problem.id}</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {problem.skill}
                        </span>
                        {isCompletedToday && (
                          <span className="text-xs text-mint flex items-center gap-1 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Đã hoàn thành hôm nay
                          </span>
                        )}
                        {isCompletedPreviously && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                            <Lock className="w-3.5 h-3.5" />
                            Đã làm trước đó
                          </span>
                        )}
                      </div>
                      <h3 className={`font-semibold truncate ${
                        isDisabled ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary'
                      } transition-colors`}>
                        {problem.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {problem.description}
                      </p>
                    </div>
                    {!isDisabled && (
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
