import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GameState, GameProgress, Problem } from '@/types/game';
import { loadProgress, saveProgress, addHistoryEntry, getXPForScore, checkNewBadges } from '@/lib/gameStore';
import { getChallengeStats, CHALLENGE_RULES } from '@/lib/challengeStore';
import { gradeWithAI } from '@/lib/aiService';
import { getRandomProblem } from '@/data/problems';
import { StartScreen } from '@/components/game/StartScreen';
import { ProblemScreen } from '@/components/game/ProblemScreen';
import { SolvingScreen } from '@/components/game/SolvingScreen';
import { ResultScreen } from '@/components/game/ResultScreen';
import { ProblemListScreen } from '@/components/game/ProblemListScreen';
import { APIKeyModal } from '@/components/game/APIKeyModal';
import { BrowserWarning } from '@/components/game/BrowserWarning';
import { ChallengeCertificate } from '@/components/game/ChallengeCertificate';
import { ChallengeProblemSelector } from '@/components/game/ChallengeProblemSelector';
import Leaderboard from '@/components/game/Leaderboard';
import { PublicViolationAlert } from '@/components/game/PublicViolationAlert';
import { ViolationsBoard } from '@/components/game/ViolationsBoard';
import { useAuth } from '@/hooks/useAuth';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useGameState } from '@/contexts/GameStateContext';
import { globalViolationCounter } from '@/hooks/useAntiCheat';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { 
    progress: challengeProgress, 
    startChallenge: startChallengeAsync, 
    markProblemCompleted: markProblemCompletedAsync,
    resetChallenge: resetChallengeAsync,
    addViolation: addViolationAsync,
    loading: challengeLoading 
  } = useChallengeProgress();
  const { setGameState: setGlobalGameState } = useGameState();
  const [progress, setProgress] = useState<GameProgress>(loadProgress());
  const [gameState, setGameState] = useState<GameState>({
    screen: 'start',
    mode: 'practice',
    currentProblem: null,
    userThinking: '',
    userCode: '',
    selectedLanguage: 'javascript',
    interviewAnswers: [],
    aiResponse: null,
    isLoading: false,
    timeLeft: 0,
  });

  // Sync gameState to global context
  useEffect(() => {
    setGlobalGameState(gameState);
  }, [gameState, setGlobalGameState]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [lastXPGained, setLastXPGained] = useState(0);
  const [lastNewBadges, setLastNewBadges] = useState<string[]>([]);
  const [currentChallengeDifficulty, setCurrentChallengeDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | null>(null);
  const [showProblemSelector, setShowProblemSelector] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showViolationsBoard, setShowViolationsBoard] = useState(false);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Load game progress on mount
  useEffect(() => {
    const saved = loadProgress();
    setProgress(saved);
  }, []);

  // Check if user is disqualified (>= 5 violations total)
  // Now reads from challengeProgress which persists in DB
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsDisqualified(false);
      return;
    }

    const violationCount = challengeProgress.violationCount || 0;
    const isBanned = challengeProgress.banned || violationCount >= 5;
    
    // Sync in-memory counter
    globalViolationCounter.initFromDB(user.id, violationCount);
    
    const wasDisqualified = isDisqualified;
    setIsDisqualified(isBanned);

    // When user becomes disqualified, show toast
    if (isBanned && !wasDisqualified && challengeProgress.isActive) {
      toast.error(
        `🚫 TÀI KHOẢN NÀY ĐÃ BỊ CẤM VĨNH VIỄN! Vi phạm ${violationCount}/5 lần.`,
        { duration: 10000 }
      );
    }
  }, [isAuthenticated, user?.id, challengeProgress.violationCount, challengeProgress.banned]);

  const handleStart = () => {
    // Check authentication
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để làm bài tập');
      navigate('/auth');
      return;
    }

    // Check API key
    if (!progress.apiKey) {
      toast.error('Vui lòng nhập Groq API Key để làm bài tập');
      setShowApiKeyModal(true);
      return;
    }

    const problem = getRandomProblem(progress.level + 2);
    setCurrentChallengeDifficulty(null);
    setGameState(prev => ({
      ...prev,
      screen: 'problem',
      mode: 'practice',
      currentProblem: problem,
    }));
  };

  const handleStartChallenge = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để tham gia thử thách');
      navigate('/auth');
      return;
    }

    // Block if banned or previously failed
    if (challengeProgress.banned) {
      toast.error('🚫 Tài khoản này đã bị cấm vĩnh viễn. Không thể tham gia thử thách.');
      return;
    }
    if (challengeProgress.failed) {
      toast.error('❌ Thử thách đã kết thúc vĩnh viễn cho tài khoản này. Không thể thử lại.');
      return;
    }

    if (!progress.apiKey) {
      toast.error('Vui lòng nhập Groq API Key để tham gia thử thách');
      setShowApiKeyModal(true);
      return;
    }

    await startChallengeAsync();
    toast.success('🔥 Bắt đầu Thử Thách 20 Ngày!');
  };

  const handleResetChallenge = async (password: string) => {
    if (password !== 'SE2005') {
      toast.error('Mật khẩu không đúng!');
      return;
    }
    await resetChallengeAsync();
    toast.info('Thử thách đã được reset. Bạn có thể bắt đầu lại!');
  };

  const handleResetViolations = async () => {
    if (passwordInput !== 'SE2005') {
      toast.error('❌ Mật khẩu không đúng!', {
        description: 'Vui lòng kiểm tra lại mật khẩu hoặc liên hệ quản trị viên.',
        duration: 4000,
      });
      return;
    }

    setIsResetting(true);

    // Reset global violation counter (in-memory)
    globalViolationCounter.reset();

    // Reset in DB via challenge progress - clear banned and violation count
    await resetChallengeAsync();

    // Reset disqualified state
    setIsDisqualified(false);
    setPasswordInput('');
    setShowPasswordDialog(false);
    setIsResetting(false);

    toast.success('🎉 Truy cập đặc biệt thành công!', {
      description: 'Vi phạm đã được reset. Bạn có thể tiếp tục tham gia thử thách.',
      duration: 5000,
    });
  };

  const handleStartChallengeProblem = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    // Check authentication
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để làm bài thử thách');
      navigate('/auth');
      return;
    }

    // Check API key
    if (!progress.apiKey) {
      toast.error('Vui lòng nhập Groq API Key để làm bài thử thách');
      setShowApiKeyModal(true);
      return;
    }

    setCurrentChallengeDifficulty(difficulty);
    setShowProblemSelector(true);
  };

  const handleSelectChallengeProblem = (problem: Problem) => {
    setShowProblemSelector(false);
    setGameState(prev => ({
      ...prev,
      screen: 'problem',
      mode: 'practice',
      currentProblem: problem,
      isChallengeProblem: true, // Mark as challenge problem
    }));
  };

  const handleStartSolving = () => {
    // Check authentication
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để làm bài');
      navigate('/auth');
      return;
    }

    // Check API key
    if (!progress.apiKey) {
      toast.error('Vui lòng nhập Groq API Key để làm bài');
      setShowApiKeyModal(true);
      return;
    }

    setGameState(prev => ({
      ...prev,
      screen: 'solving',
      userThinking: '',
      userCode: '',
      interviewAnswers: [],
    }));
  };

  const handleSubmit = async (thinking: string, code: string, language: string, answers: string[]) => {
    if (!gameState.currentProblem || !gameState.mode) return;

    if (!progress.apiKey) {
      toast.error('Vui lòng nhập Groq API key để chấm điểm');
      setShowApiKeyModal(true);
      return;
    }

    setGameState(prev => ({ ...prev, isLoading: true }));

    try {
      const aiResponse = await gradeWithAI(progress.apiKey, {
        problem: gameState.currentProblem,
        userThinking: thinking,
        userCode: code,
        language,
        interviewAnswers: answers,
        interviewQuestions: gameState.currentProblem.interviewQuestions,
        mode: gameState.mode,
      });

      // Calculate rewards
      const xpGained = getXPForScore(aiResponse.totalScore, gameState.mode);
      const newBadges = checkNewBadges(progress, aiResponse.totalScore, gameState.mode);

      // Update progress
      const updatedProgress = addHistoryEntry(
        progress,
        gameState.currentProblem.id,
        aiResponse.totalScore,
        gameState.mode,
        aiResponse.feedback
      );

      setProgress(updatedProgress);
      setLastXPGained(xpGained);
      setLastNewBadges(newBadges);

      // Update challenge progress if in challenge mode
      if (currentChallengeDifficulty && challengeProgress.isActive && isAuthenticated) {
        const updatedChallengeProgress = await markProblemCompletedAsync(
          gameState.currentProblem.id,
          currentChallengeDifficulty,
          aiResponse.totalScore
        );
        
        // Check if challenge failed after validation
        if (updatedChallengeProgress.failed) {
          toast.error(`❌ ${updatedChallengeProgress.failedReason || 'Thử thách đã kết thúc.'}`);
          // Update challenge progress state
          setCurrentChallengeDifficulty(null);
        } else {
          // Save result to database
          if (user) {
            try {
              await supabase.from('challenge_results').insert({
                user_id: user.id,
                problem_id: gameState.currentProblem.id,
                problem_title: gameState.currentProblem.title,
                difficulty: currentChallengeDifficulty,
                score: aiResponse.totalScore,
                day_number: updatedChallengeProgress.currentDay,
              } as any);
            } catch (dbError) {
              console.error('Error saving to leaderboard:', dbError);
            }
          }
          
          // Show progress toast
          const diffKey = currentChallengeDifficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
          const currentDay = updatedChallengeProgress.dailyChallenges[updatedChallengeProgress.currentDay - 1];
          if (currentDay) {
            const completed = currentDay.completedProblems[diffKey].length;
            const required = CHALLENGE_RULES.dailyRequirements[diffKey];
            if (aiResponse.totalScore >= 6) {
              toast.success(`✅ Hoàn thành ${completed}/${required} bài ${currentChallengeDifficulty}!`);
              
              // Check if daily challenge is complete
              if (currentDay.completed) {
                toast.success(`🎉 Hoàn thành Ngày ${updatedChallengeProgress.currentDay}! Tiếp tục phát huy!`);
              }
            }
          }
          
          // Check if challenge is complete
          if (!updatedChallengeProgress.isActive && updatedChallengeProgress.completedDays >= CHALLENGE_RULES.totalDays) {
            toast.success('🏆 Chúc mừng! Bạn đã hoàn thành Thử Thách 20 Ngày!');
          }
        }
      }

      setGameState(prev => ({
        ...prev,
        screen: 'result',
        aiResponse,
        isLoading: false,
        userThinking: thinking,
        userCode: code,
        selectedLanguage: language,
        interviewAnswers: answers,
      }));

      if (newBadges.length > 0) {
        toast.success(`🏆 Badge mới: ${newBadges.join(', ')}`);
      }
    } catch (error) {
      console.error('Grading error:', error);
      toast.error('Lỗi khi chấm điểm. Vui lòng kiểm tra API key và thử lại.');
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleContinue = () => {
    setGameState({
      screen: 'start',
      mode: 'practice',
      currentProblem: null,
      userThinking: '',
      userCode: '',
      selectedLanguage: 'javascript',
      interviewAnswers: [],
      aiResponse: null,
      isLoading: false,
      timeLeft: 0,
    });
  };

  const handleSaveApiKey = (apiKey: string) => {
    const updatedProgress = { ...progress, apiKey };
    setProgress(updatedProgress);
    saveProgress(updatedProgress);
    toast.success('API key đã được lưu!');
  };

  const handleBack = () => {
    const screenMap: Record<string, GameState['screen']> = {
      problem: 'start',
      solving: 'problem',
      result: 'start',
      progress: 'start',
      problemList: 'start',
    };
    setGameState(prev => ({
      ...prev,
      screen: screenMap[prev.screen] || 'start',
    }));
  };

  const handleSelectProblemFromList = (problem: Problem) => {
    setGameState(prev => ({
      ...prev,
      screen: 'problem',
      mode: 'practice',
      currentProblem: problem,
    }));
  };

  const challengeStats = getChallengeStats(challengeProgress);

  return (
    <div className="min-h-screen">
      {/* Public Violation Alert - shows violations publicly */}
      <PublicViolationAlert />
      
      {/* Browser Warning - shows once per day */}
      <BrowserWarning />

      {/* Show Certificate if challenge is complete */}
      {challengeStats.isComplete && gameState.screen === 'start' && (
        <div className="fixed inset-0 bg-black/80 z-40 overflow-y-auto py-8">
          <div className="container max-w-3xl mx-auto px-4">
            <ChallengeCertificate progress={challengeProgress} />
            <div className="text-center mt-4">
              <button
                onClick={() => {/* Certificate can be dismissed by scrolling down */}}
                className="text-white/70 hover:text-white text-sm"
              >
                Kéo xuống để xem trang chủ
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState.screen === 'start' && !showLeaderboard && (
        <StartScreen
          challengeProgress={challengeProgress}
          onStart={handleStart}
          onOpenApiKey={() => setShowApiKeyModal(true)}
          onSaveApiKey={handleSaveApiKey}
          onSelectProblem={() => setGameState(prev => ({ ...prev, screen: 'problemList' }))}
          onStartChallenge={handleStartChallenge}
          onResetChallenge={handleResetChallenge}
          onStartChallengeProblem={handleStartChallengeProblem}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onShowViolationsBoard={() => setShowViolationsBoard(true)}
          onNavigateToAuth={() => navigate('/auth')}
          onSignOut={signOut}
          hasApiKey={!!progress.apiKey}
          currentApiKey={progress.apiKey}
          isAuthenticated={isAuthenticated}
          userProfile={profile}
          progress={progress}
        />
      )}

      {showLeaderboard && (
        <Leaderboard onBack={() => setShowLeaderboard(false)} />
      )}

      {showViolationsBoard && (
        <ViolationsBoard onBack={() => setShowViolationsBoard(false)} />
      )}

      {gameState.screen === 'problem' && gameState.currentProblem && gameState.mode && (
        <ProblemScreen
          problem={gameState.currentProblem}
          mode={gameState.mode}
          onStart={handleStartSolving}
          onBack={handleBack}
        />
      )}

      {gameState.screen === 'solving' && gameState.currentProblem && gameState.mode && (
        <>
          {/* Disqualified Modal */}
          {isDisqualified && currentChallengeDifficulty !== null && (
            <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-card rounded-2xl p-8 max-w-md w-full border-2 border-destructive shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-destructive" />
                  </div>
                  <h2 className="text-2xl font-bold text-destructive mb-2">
                    🚫 BẠN ĐÃ BỊ LOẠI
                  </h2>
                   <p className="text-muted-foreground">
                    Tài khoản này đã vi phạm 5 lần và bị cấm vĩnh viễn khỏi thử thách. Tài khoản khác vẫn hoạt động bình thường. Bạn vẫn có thể luyện tập.
                  </p>
                </div>
                <div className="bg-destructive/10 rounded-lg p-4 mb-6">
                  <p className="text-sm text-foreground mb-3">
                    <strong>Lý do:</strong> Vi phạm quy tắc chống gian lận (thoát fullscreen, chuyển tab, mất focus)
                  </p>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-md p-3 border border-amber-200/50 dark:border-amber-800/50">
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                      💡 Bạn có thể nhập mật khẩu đặc biệt để tiếp tục tham gia thử thách
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => setShowPasswordDialog(true)}
                    className="w-full h-12 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="font-semibold">🔑 Nhập mật khẩu để tham gia lại</span>
                    </div>
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDisqualified(false);
                        handleBack();
                      }}
                      className="flex-1"
                    >
                      Quay lại
                    </Button>
                    <Button
                      onClick={() => setShowViolationsBoard(true)}
                      variant="secondary"
                      className="flex-1"
                    >
                      Xem bảng vi phạm
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Password Dialog for Resetting Violations */}
          <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
            <DialogContent className="sm:max-w-[480px] border-2 border-primary/20 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
              <DialogHeader className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    🔐 Truy cập đặc biệt
                  </DialogTitle>
                  <DialogDescription className="text-base mt-2 text-muted-foreground">
                    Nhập mật khẩu quản trị viên để reset vi phạm và tiếp tục thử thách
                  </DialogDescription>
                </motion.div>
              </DialogHeader>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="space-y-6 py-6"
              >
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Mật khẩu quản trị viên
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="pr-12 h-12 text-lg border-2 border-input focus:border-primary/50 transition-colors"
                      placeholder="Nhập mật khẩu..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleResetViolations();
                        }
                      }}
                      autoFocus
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Mật khẩu được cung cấp bởi quản trị viên hệ thống
                  </p>
                </div>

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Lưu ý quan trọng
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Việc reset vi phạm chỉ dành cho trường hợp đặc biệt. 
                        Vui lòng sử dụng tính năng này có trách nhiệm.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <DialogFooter className="flex gap-3 pt-6 border-t border-border/50">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordDialog(false);
                      setPasswordInput('');
                    }}
                    className="w-full h-11 border-2 hover:bg-muted/50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Hủy bỏ
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                  className="flex-1"
                >
                  <Button
                    onClick={handleResetViolations}
                    disabled={!passwordInput.trim() || isResetting}
                    className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResetting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Xác nhận
                      </>
                    )}
                  </Button>
                </motion.div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <SolvingScreen
            problem={gameState.currentProblem}
            mode={gameState.mode}
            onSubmit={handleSubmit}
            onBack={handleBack}
            isLoading={gameState.isLoading}
            isChallenge={currentChallengeDifficulty !== null && challengeProgress.isActive && !isDisqualified}
            dayNumber={challengeProgress.currentDay}
            onPersistViolation={addViolationAsync}
            initialViolationCount={challengeProgress.violationCount || 0}
          />
        </>
      )}

      {gameState.screen === 'result' && gameState.currentProblem && gameState.aiResponse && (
        <ResultScreen
          problem={gameState.currentProblem}
          aiResponse={gameState.aiResponse}
          xpGained={lastXPGained}
          newBadges={lastNewBadges}
          onContinue={handleContinue}
        />
      )}




      {gameState.screen === 'problemList' && (
        <ProblemListScreen
          onSelectProblem={handleSelectProblemFromList}
          onBack={handleBack}
          completedProblemIds={(progress.history || []).map(h => h.problemId)}
        />
      )}

      <APIKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleSaveApiKey}
        currentKey={progress.apiKey}
      />

      {showProblemSelector && currentChallengeDifficulty && (
        <ChallengeProblemSelector
          difficulty={currentChallengeDifficulty}
          completedProblemIds={
            challengeProgress.dailyChallenges[challengeProgress.currentDay - 1]?.completedProblems[
              currentChallengeDifficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
            ] || []
          }
          allCompletedProblemIds={
            challengeProgress.dailyChallenges.flatMap(day => [
              ...day.completedProblems.easy,
              ...day.completedProblems.medium,
              ...day.completedProblems.hard,
            ])
          }
          onSelectProblem={handleSelectChallengeProblem}
          onClose={() => setShowProblemSelector(false)}
        />
      )}
    </div>
  );
};

export default Index;