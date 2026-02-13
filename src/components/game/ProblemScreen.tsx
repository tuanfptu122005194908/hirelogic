import { motion } from 'framer-motion';
import { Problem } from '@/types/game';
import { ArrowRight, BookOpen, Lightbulb, Code, Layers, Zap, Hash } from 'lucide-react';

interface ProblemScreenProps {
  problem: Problem;
  mode: 'practice' | 'interview';
  onStart: () => void;
  onBack: () => void;
}

export const ProblemScreen = ({ problem, mode, onStart, onBack }: ProblemScreenProps) => {
  const difficultyConfig = {
    Easy: { 
      bg: 'from-emerald-500/10 to-green-500/10', 
      text: 'text-emerald-700', 
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      glow: 'shadow-emerald-200/50'
    },
    Medium: { 
      bg: 'from-amber-500/10 to-orange-500/10', 
      text: 'text-amber-700', 
      badge: 'bg-amber-100 text-amber-700 border-amber-200',
      glow: 'shadow-amber-200/50'
    },
    Hard: { 
      bg: 'from-rose-500/10 to-red-500/10', 
      text: 'text-rose-700', 
      badge: 'bg-rose-100 text-rose-700 border-rose-200',
      glow: 'shadow-rose-200/50'
    },
  };

  const config = difficultyConfig[problem.difficulty];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/80 via-white to-purple-50/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="mb-6 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-primary/10 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all flex items-center gap-2 shadow-sm"
        >
          ← Quay lại
        </motion.button>

        {/* Problem Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-3xl p-8 shadow-xl border border-white/60 bg-white/90 backdrop-blur-md ${config.glow}`}
        >
          {/* Decorative gradient blob */}
          <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br ${config.bg} blur-3xl opacity-60`} />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-br from-pink-200/30 to-purple-200/30 blur-3xl" />

          <div className="relative z-10">
            {/* Header Badges */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap items-center gap-3 mb-6"
            >
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${config.badge}`}>
                {problem.difficulty === 'Easy' ? '🟢' : problem.difficulty === 'Medium' ? '🟡' : '🔴'} {problem.difficulty}
              </span>
              <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-secondary/50 text-secondary-foreground border border-secondary/30 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {problem.skill}
              </span>
              <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-accent/10 text-accent border border-accent/20 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                Level {problem.level}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-3xl md:text-4xl font-black text-foreground mb-6 leading-tight"
            >
              {problem.title}
            </motion.h1>

            {/* Description */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/10"
            >
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2 text-lg">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Code className="w-4 h-4 text-accent" />
                </div>
                Yêu cầu
              </h3>
              <p className="text-muted-foreground leading-relaxed text-base">{problem.description}</p>
            </motion.div>

            {/* Input/Output */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="grid md:grid-cols-2 gap-4 mb-8"
            >
              <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
                <h4 className="font-bold text-sm text-blue-700 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Input
                </h4>
                <p className="text-foreground text-sm font-mono bg-white/70 rounded-lg p-3">{problem.input}</p>
              </div>
              <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 shadow-sm">
                <h4 className="font-bold text-sm text-emerald-700 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Output
                </h4>
                <p className="text-foreground text-sm font-mono bg-white/70 rounded-lg p-3">{problem.output}</p>
              </div>
            </motion.div>

            {/* Examples */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h3 className="font-bold text-foreground mb-4 text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                Ví dụ
              </h3>
              <div className="space-y-3">
                {problem.examples.map((example, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="rounded-2xl p-5 font-mono text-sm border border-primary/10 bg-gradient-to-r from-white to-primary/5 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-sans font-bold text-muted-foreground uppercase tracking-wider">Input</span>
                        <code className="text-accent font-semibold bg-accent/10 px-3 py-1 rounded-lg">{example.input}</code>
                      </div>
                      <span className="text-primary hidden md:inline text-lg">→</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-sans font-bold text-muted-foreground uppercase tracking-wider">Output</span>
                        <code className="text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-lg">{example.output}</code>
                      </div>
                    </div>
                    {example.explanation && (
                      <p className="mt-3 text-xs text-muted-foreground font-sans bg-yellow-50/80 rounded-lg px-3 py-2 border border-yellow-100">
                        💡 {example.explanation}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hints (Practice mode only) */}
            {mode === 'practice' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl p-5 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200/60 shadow-sm"
              >
                <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 rounded-lg bg-amber-200/50 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                  </div>
                  Gợi ý
                </h3>
                <ul className="space-y-2.5">
                  {problem.hints.map((hint, index) => (
                    <motion.li 
                      key={index} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 + index * 0.1 }}
                      className="text-sm text-foreground flex items-start gap-3 bg-white/60 rounded-xl px-4 py-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{hint}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full mt-6 relative overflow-hidden bg-gradient-to-r from-primary via-pink-500 to-accent text-white font-black py-5 rounded-2xl text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-shadow"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
          />
          <span className="relative z-10">Bắt đầu giải bài</span>
          <ArrowRight className="w-5 h-5 relative z-10" />
        </motion.button>
      </div>
    </div>
  );
};
