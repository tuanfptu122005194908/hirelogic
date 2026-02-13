import { motion } from 'framer-motion';
import { AIResponse, Problem, BADGES } from '@/types/game';
import { 
  Trophy, 
  TrendingUp, 
  CheckCircle, 
  Code, 
  BookOpen,
  TestTube,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { MarkdownCode, CodeHighlight } from './CodeHighlight';
import { useState } from 'react';

interface ResultScreenProps {
  problem: Problem;
  aiResponse: AIResponse;
  xpGained: number;
  newBadges: string[];
  onContinue: () => void;
}

type TabId = 'score' | 'explanation' | 'code' | 'tests' | 'theory';

export const ResultScreen = ({ 
  problem, 
  aiResponse, 
  xpGained, 
  newBadges,
  onContinue, 
}: ResultScreenProps) => {
  const [activeTab, setActiveTab] = useState<'score' | 'explanation' | 'code' | 'tests' | 'theory'>('score');
  const [theoryAnswers, setTheoryAnswers] = useState<Record<number, number>>({});
  const [showTheoryResults, setShowTheoryResults] = useState(false);

  const scoreColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return 'text-mint';
    if (ratio >= 0.5) return 'text-peach';
    return 'text-destructive';
  };

  const totalScoreColor = () => {
    if (aiResponse.totalScore >= 8) return 'from-mint to-accent';
    if (aiResponse.totalScore >= 5) return 'from-peach to-primary';
    return 'from-destructive to-primary';
  };

  const handleTheorySubmit = () => {
    setShowTheoryResults(true);
  };

  const tabs = [
    { id: 'score', label: 'Điểm số', icon: Trophy },
    { id: 'explanation', label: 'Giải thích', icon: BookOpen },
    { id: 'code', label: 'Code Guide', icon: Code },
    { id: 'tests', label: 'Test Cases', icon: TestTube },
    { id: 'theory', label: 'Lý thuyết', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 max-w-4xl xl:max-w-5xl 2xl:max-w-6xl 3xl:max-w-7xl 4xl:max-w-[1600px]">
      {/* Header with Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card-strong rounded-2xl p-8 mb-6 text-center relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r ${totalScoreColor()} rounded-full blur-3xl`} />
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="relative"
        >
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r ${totalScoreColor()} shadow-glow mb-4`}>
            <span className="text-5xl font-bold text-white">{aiResponse.totalScore}</span>
            <span className="text-xl text-white/80">/10</span>
          </div>
        </motion.div>

        <h2 className="text-2xl font-bold text-foreground mb-2">{problem.title}</h2>
        
        {/* XP Gained */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-accent"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-bold text-lg">+{xpGained} XP</span>
        </motion.div>

        {/* New Badges */}
        {newBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-4 flex flex-wrap justify-center gap-2"
          >
            {newBadges.map((badge) => (
              <span
                key={badge}
                className="px-4 py-2 bg-gradient-button text-white rounded-full font-medium animate-bounce-subtle"
              >
                {BADGES[badge as keyof typeof BADGES]?.icon} {badge}
              </span>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-button text-white shadow-button'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-strong rounded-2xl p-6 mb-6"
      >
        {/* Score Tab */}
        {activeTab === 'score' && (
          <div className="space-y-6">
            {/* Detailed Scores */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Chi tiết điểm số</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(aiResponse.scores).map(([key, value]) => {
                  const maxScores: Record<string, number> = {
                    understanding: 3, approach: 3, codeLogic: 2, explanation: 2,
                    edgeCases: 1, complexity: 1, communication: 1, creativity: 1,
                    codeStyle: 1, overallThinking: 1
                  };
                  const labels: Record<string, string> = {
                    understanding: 'Hiểu bài', approach: 'Ý tưởng', codeLogic: 'Logic code',
                    explanation: 'Giải thích', edgeCases: 'Edge cases', complexity: 'Độ phức tạp',
                    communication: 'Giao tiếp', creativity: 'Sáng tạo', codeStyle: 'Code style',
                    overallThinking: 'Tư duy'
                  };
                  return (
                    <div key={key} className="bg-muted/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{labels[key]}</p>
                      <p className={`text-lg font-bold ${scoreColor(value, maxScores[key])}`}>
                        {value}/{maxScores[key]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 border-l-4 border-primary">
              <p className="text-foreground leading-relaxed">{aiResponse.feedback}</p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-mint/5 rounded-xl p-4 border border-mint/20">
                <h4 className="font-medium text-mint mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Điểm mạnh
                </h4>
                <ul className="space-y-2">
                  {aiResponse.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-mint">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-peach/5 rounded-xl p-4 border border-peach/20">
                <h4 className="font-medium text-peach-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Cần cải thiện
                </h4>
                <ul className="space-y-2">
                  {aiResponse.improvements.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-peach">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Explanation Tab */}
        {activeTab === 'explanation' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              Giải thích thuật toán
            </h3>
            <MarkdownCode content={aiResponse.algorithmExplanation} />
          </div>
        )}

        {/* Code Guide Tab */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Code className="w-5 h-5 text-accent" />
              Hướng dẫn Code
            </h3>
            <MarkdownCode content={aiResponse.codeGuide} />
          </div>
        )}

        {/* Test Cases Tab */}
        {activeTab === 'tests' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <TestTube className="w-5 h-5 text-accent" />
              Test Cases bổ sung
            </h3>
            <div className="space-y-3">
              {[...problem.testCases, ...aiResponse.additionalTestCases].map((tc, i) => (
                <div key={i} className="bg-muted/50 rounded-xl p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 font-mono text-sm">
                    <span className="text-muted-foreground">Input:</span>
                    <code className="text-accent">{String(tc.input)}</code>
                    <span className="text-muted-foreground hidden md:inline">→</span>
                    <span className="text-muted-foreground">Output:</span>
                    <code className="text-primary">{String(tc.output)}</code>
                  </div>
                  {'explanation' in tc && tc.explanation && (
                    <p className="mt-2 text-xs text-muted-foreground">💡 {String(tc.explanation)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Theory Tab */}
        {activeTab === 'theory' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-accent" />
              Câu hỏi lý thuyết
            </h3>
            
            {problem.theoryQuestions.map((q, qIndex) => (
              <div key={qIndex} className="bg-muted/30 rounded-xl p-4">
                <p className="font-medium text-foreground mb-3">{qIndex + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = theoryAnswers[qIndex] === optIndex;
                    const isCorrect = q.correct === optIndex;
                    const showResult = showTheoryResults;

                    let bgClass = 'bg-background hover:bg-muted/50';
                    if (showResult && isCorrect) bgClass = 'bg-mint/20 border-mint';
                    else if (showResult && isSelected && !isCorrect) bgClass = 'bg-destructive/20 border-destructive';
                    else if (isSelected) bgClass = 'bg-primary/10 border-primary';

                    return (
                      <button
                        key={optIndex}
                        onClick={() => {
                          if (!showTheoryResults) {
                            setTheoryAnswers({ ...theoryAnswers, [qIndex]: optIndex });
                          }
                        }}
                        disabled={showTheoryResults}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${bgClass}`}
                      >
                        <span className="text-sm">{String.fromCharCode(65 + optIndex)}. {opt}</span>
                      </button>
                    );
                  })}
                </div>
                {showTheoryResults && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-3 bg-accent/10 rounded-lg"
                  >
                    <p className="text-sm text-accent">💡 {q.explanation}</p>
                  </motion.div>
                )}
              </div>
            ))}

            {!showTheoryResults && (
              <button
                onClick={handleTheorySubmit}
                disabled={Object.keys(theoryAnswers).length < problem.theoryQuestions.length}
                className="btn-primary text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                Kiểm tra đáp án
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <button
          onClick={onContinue}
          className="btn-primary text-white py-3 px-8 rounded-xl font-medium"
        >
          Tiếp tục luyện tập →
        </button>
      </div>
    </div>
  );
};
