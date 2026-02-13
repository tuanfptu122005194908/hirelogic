import { useState } from 'react';
import { motion } from 'framer-motion';
import { Problem } from '@/types/game';
import { getAllProblems } from '@/data/problems';
import { ArrowLeft, Search, Filter, ChevronRight, Star, Zap, Trophy } from 'lucide-react';

interface ProblemListScreenProps {
  onSelectProblem: (problem: Problem) => void;
  onBack: () => void;
  completedProblemIds: number[];
}

const difficultyColors = {
  Easy: 'text-mint bg-mint/10 border-mint/30',
  Medium: 'text-accent bg-accent/10 border-accent/30',
  Hard: 'text-peach bg-peach/10 border-peach/30',
};

const levelNames = [
  '', // 0
  'Cơ bản - Array',
  'String & Hash',
  'Linked List & Binary Search',
  'DP & Tree cơ bản',
  'Sliding Window & DP',
  'Graph',
  'DP & Tree nâng cao',
  'Heap & Intervals',
  'Backtracking & Trie',
  'Expert',
];

export const ProblemListScreen = ({ 
  onSelectProblem, 
  onBack,
  completedProblemIds 
}: ProblemListScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const allProblems = getAllProblems();

  const filteredProblems = allProblems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         problem.skill.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === null || problem.level === selectedLevel;
    const matchesDifficulty = selectedDifficulty === null || problem.difficulty === selectedDifficulty;
    return matchesSearch && matchesLevel && matchesDifficulty;
  });

  const levels = [...new Set(allProblems.map(p => p.level))].sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card-strong border-b border-border">
        <div className="container mx-auto px-4 py-4 max-w-6xl xl:max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2000px] 4xl:max-w-[2400px]">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Danh sách bài tập</h1>
              <p className="text-sm text-muted-foreground">
                {allProblems.length} bài • {completedProblemIds.length} đã hoàn thành
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc skill..."
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedLevel(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedLevel === null 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Tất cả Level
            </button>
            {levels.map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedLevel === level 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Level {level}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            {['Easy', 'Medium', 'Hard'].map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  selectedDifficulty === diff 
                    ? difficultyColors[diff as keyof typeof difficultyColors]
                    : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problem List */}
      <div className="container mx-auto px-4 py-4">
        {filteredProblems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy bài tập phù hợp</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProblems.map((problem, index) => {
              const isCompleted = completedProblemIds.includes(problem.id);
              
              return (
                <motion.button
                  key={problem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => onSelectProblem(problem)}
                  className={`w-full text-left glass-card rounded-xl p-4 hover:bg-muted/50 transition-all group ${
                    isCompleted ? 'border-mint/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">#{problem.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[problem.difficulty]}`}>
                          {problem.difficulty}
                        </span>
                        {isCompleted && (
                          <span className="text-xs text-mint flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            Đã làm
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {problem.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {problem.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {problem.skill}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Level {problem.level}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
