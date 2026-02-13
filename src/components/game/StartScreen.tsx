import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChallengeProgress } from '@/types/challenge';
import { GameProgress } from '@/types/game';
import { Sparkles, Trophy, Key, ExternalLink, Loader2, CheckCircle, AlertCircle, BookOpen, Code2, Users, Brain, Target, Flame, Gift, Calendar, Shield, LogIn, LogOut, User, Crown, XCircle, RefreshCw, Lock, X, Zap, Eye, EyeOff, Star, Rocket, TrendingUp, Award, Zap as ZapIcon, Play, Terminal } from 'lucide-react';
import { validateApiKey } from '@/lib/aiService';
import { ChallengeGuide } from './ChallengeGuide';
import { ChallengeDashboard } from './ChallengeDashboard';
import { StatsOverview } from './StatsOverview';
import { QuickActions } from './QuickActions';
import { RecentActivities } from './RecentActivities';
import { CodeEditor } from './CodeEditor';
import heroBanner from '@/assets/hero-banner.png';
import { SakuraPetals } from '@/components/SakuraPetals';

interface UserProfile {
  id: string;
  name: string;
  student_id: string;
}

interface StartScreenProps {
  challengeProgress: ChallengeProgress;
  progress: GameProgress;
  onStart: () => void;
  
  onOpenApiKey: () => void;
  onSaveApiKey: (apiKey: string) => void;
  onSelectProblem: () => void;
  onStartChallenge: () => void;
  onResetChallenge: (password: string) => void;
  onStartChallengeProblem: (difficulty: 'Easy' | 'Medium' | 'Hard') => void;
  onShowLeaderboard: () => void;
  onShowViolationsBoard?: () => void;
  onNavigateToAuth: () => void;
  onSignOut: () => void;
  hasApiKey: boolean;
  currentApiKey?: string;
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  onViewProgress?: () => void;
}

export const StartScreen = ({ 
  challengeProgress,
  progress,
  onStart, 
  onOpenApiKey,
  onSaveApiKey,
  onSelectProblem,
  onStartChallenge,
  onResetChallenge,
  onStartChallengeProblem,
  onShowLeaderboard,
  onShowViolationsBoard,
  onNavigateToAuth,
  onSignOut,
  hasApiKey,
  currentApiKey,
  isAuthenticated,
  userProfile,
  onViewProgress
}: StartScreenProps) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showChallengeGuide, setShowChallengeGuide] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Vui lòng nhập API key');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const isValid = await validateApiKey(apiKey.trim());
      if (isValid) {
        setSuccess(true);
        setTimeout(() => {
          onSaveApiKey(apiKey.trim());
          setSuccess(false);
        }, 1000);
      } else {
        setError('API key không hợp lệ. Vui lòng kiểm tra lại.');
      }
    } catch (err) {
      setError('Không thể xác thực API key. Vui lòng thử lại.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSkipValidation = () => {
    if (apiKey.trim()) {
      onSaveApiKey(apiKey.trim());
    }
  };

  const handleStartChallengeClick = () => {
    setShowChallengeGuide(false);
    onStartChallenge();
  };

  const handleResetSubmit = () => {
    onResetChallenge(resetPassword);
    setResetPassword('');
    setShowResetModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 relative overflow-hidden">
      {/* Sakura Falling Petals */}
      <SakuraPetals count={35} />
      
      {/* Sakura Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        {/* Floating Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-48 h-48 bg-rose-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-300/30 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-40 right-1/3 w-36 h-36 bg-rose-300/30 rounded-full blur-3xl"
          animate={{
            x: [0, -60, 0],
            y: [0, 40, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Floating Petals */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-pink-400 rounded-full opacity-50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 40 - 20, 0],
              rotate: [0, 360, 0],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Navigation Bar */}
      <nav className="absolute top-4 left-0 right-0 z-10 flex justify-center px-4">
        <div className="flex items-center gap-6 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full border border-primary/20 shadow-lg">
          <a 
            href="#home" 
            className="text-gray-700 hover:text-primary font-medium transition-colors"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Trang chủ
          </a>
          <a 
            href="#about-project" 
            className="text-gray-700 hover:text-primary font-medium transition-colors"
          >
            Giới thiệu dự án
          </a>
          <a 
            href="#contact" 
            className="text-gray-700 hover:text-primary font-medium transition-colors"
          >
            Liên hệ
          </a>
        </div>
      </nav>

      {/* Auth Header */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        {isAuthenticated && userProfile ? (
          <>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full border border-primary/20">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{userProfile.name}</span>
              <span className="text-xs text-muted-foreground">({userProfile.student_id})</span>
            </div>
            <motion.button
              onClick={onSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/80 hover:bg-muted text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </motion.button>
          </>
        ) : (
          <motion.button
            onClick={onNavigateToAuth}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white font-medium shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogIn className="w-4 h-4" />
            Đăng nhập
          </motion.button>
        )}
      </div>

      {/* Hero Section with Enhanced Design */}
      <div className="relative w-full h-96 md:h-[500px] xl:h-[600px] overflow-hidden">
        <motion.img 
          src={heroBanner} 
          alt="HIRELOGIC" 
          className="w-full h-full object-cover object-top opacity-100"
          initial={{ scale: 1.2, filter: "brightness(0.8)" }}
          animate={{ scale: 1, filter: "brightness(1)" }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/70" />
        
        {/* Enhanced Floating Elements */}
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 blur-2xl"
          animate={{ 
            y: [-20, 20, -20], 
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3] 
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-32 right-20 w-32 h-32 rounded-full bg-gradient-to-r from-orange-400 to-red-400 blur-3xl"
          animate={{ 
            y: [20, -20, 20], 
            rotate: [360, 180, 0],
            opacity: [0.4, 0.6, 0.4] 
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/3 w-24 h-24 rounded-full bg-gradient-to-r from-red-400 to-yellow-400 blur-2xl"
          animate={{ 
            y: [-15, 15, -15], 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.7, 0.5] 
          }}
          transition={{ duration: 7, repeat: Infinity, delay: 2 }}
        />

        {/* Enhanced Title Overlay */}
        <div className="absolute inset-0 flex items-end justify-center pb-12 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            className="text-center px-4 max-w-4xl"
          >
            <motion.div 
              className="flex items-center justify-center gap-4 mb-6"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 flex items-center justify-center shadow-2xl">
                  <Brain className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-br from-yellow-600 to-red-600 rounded-3xl blur-xl opacity-40"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl xl:text-7xl font-black tracking-tight mb-4">
              <span className="text-gray-800 drop-shadow-lg font-extrabold">HIRELOGIC</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 font-bold mb-6 drop-shadow">
              Luyện thuật toán theo góc nhìn nhà tuyển dụng
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-bold">by <span className="text-orange-600 font-extrabold">TWO</span></span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                <span className="font-bold">Together We Overcome</span>
              </div>
            </div>
            
            {/* Stats Pills */}
            <motion.div 
              className="flex flex-wrap justify-center gap-3 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200 flex items-center gap-2 shadow-md">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-800 font-bold">100 bài tập</span>
              </div>
              <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200 flex items-center gap-2 shadow-md">
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-800 font-bold">AI Chấm điểm</span>
              </div>
              <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200 flex items-center gap-2 shadow-md">
                <Star className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-800 font-bold">Thử thách 20 ngày</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Auth Header */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        {isAuthenticated && userProfile ? (
          <>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full border border-primary/20">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{userProfile.name}</span>
              <span className="text-xs text-muted-foreground">({userProfile.student_id})</span>
            </div>
            <motion.button
              onClick={onSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/80 hover:bg-muted text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </motion.button>
          </>
        ) : (
          <motion.button
            onClick={onNavigateToAuth}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white font-medium shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogIn className="w-4 h-4" />
            Đăng nhập
          </motion.button>
        )}
      </div>

      {/* About Project Section - Professional Redesign */}
      <section id="about-project" className="relative z-10 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold text-lg mb-6 shadow-2xl"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              Về Dự Án HireLogic
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 mb-8 leading-tight"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 -skew-x-12"
                animate={{
                  opacity: [0, 0.3, 0],
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: "easeInOut"
                }}
              />
              HireLogic Platform
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-xl md:text-2xl text-gray-700 max-w-5xl mx-auto leading-relaxed font-medium"
            >
              Nền tảng luyện tập thuật toán và tư duy lập trình theo góc nhìn của nhà tuyển dụng,
              được thiết kế chuyên nghiệp như LeetCode và HackerRank
            </motion.p>
          </motion.div>

          {/* Live Code Demo Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-400 font-mono ml-3">array-sum.js</span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => {
                      const outputDiv = document.getElementById('demo-output');
                      if (outputDiv) {
                        // Hiển thị loading state
                        outputDiv.innerHTML = `
                          <div class="flex items-center gap-2 text-yellow-400 mb-4">
                            <div class="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Executing code...</span>
                          </div>
                        `;
                        
                        // Simulate execution delay với animation
                        setTimeout(() => {
                          // Thực thi code thực tế
                          const testCases = [
                            { input: [1, 2, 3, 4, 5], expected: 15 },
                            { input: [10, -2, 7, 0], expected: 15 },
                            { input: [100], expected: 100 }
                          ];
                          
                          let resultsHTML = '';
                          testCases.forEach((testCase, index) => {
                            const actual = testCase.input.reduce((sum, num) => sum + num, 0);
                            const passed = actual === testCase.expected;
                            
                            resultsHTML += `
                              <div class="mb-3 p-3 rounded-lg border ${passed ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}">
                                <div class="flex items-center gap-2 mb-2">
                                  ${passed ? 
                                    '<div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>' : 
                                    '<div class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"><svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg></div>'
                                  }
                                  <span class="text-sm font-mono text-gray-300">Test Case ${index + 1}</span>
                                </div>
                                <div class="text-xs space-y-1">
                                  <div><span class="text-gray-400">Input:</span> <span class="text-blue-400 font-mono">[${testCase.input.join(', ')}]</span></div>
                                  <div><span class="text-gray-400">Expected:</span> <span class="text-green-400 font-mono">${testCase.expected}</span></div>
                                  <div><span class="text-gray-400">Actual:</span> <span class="${passed ? 'text-green-400' : 'text-red-400'} font-mono">${actual}</span></div>
                                </div>
                              </div>
                            `;
                          });
                          
                          // Hiển thị kết quả với animation
                          outputDiv.innerHTML = `
                            <div class="space-y-3">
                              ${resultsHTML}
                              <div class="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700">
                                <div class="flex items-center gap-2 text-blue-400">
                                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                  <span class="font-medium">Execution completed successfully!</span>
                                </div>
                                <div class="text-xs text-gray-400 mt-1">
                                  Time: ${Math.random() * 50 + 10}ms | Memory: ${(Math.random() * 10 + 5).toFixed(1)}MB
                                </div>
                              </div>
                            </div>
                          `;
                        }, 1500); // 1.5s delay for effect
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Run Code
                  </motion.button>
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-6 font-mono text-sm">
                <div className="text-gray-400 mb-4">// Bài tập: Tính tổng các phần tử trong mảng</div>
                <div className="text-green-400 mb-2">function sumArray(arr) {'{'}</div>
                <div className="text-blue-400 ml-4 mb-2">// Khởi tạo biến tổng</div>
                <div className="text-yellow-400 ml-4 mb-2">let sum = 0;</div>
                <div className="text-blue-400 ml-4 mb-2">// Duyệt qua từng phần tử</div>
                <div className="text-yellow-400 ml-4 mb-2">for (let i = 0; i {'<'} arr.length; i++) {'{'}</div>
                <div className="text-white ml-8 mb-2">sum += arr[i];</div>
                <div className="text-yellow-400 ml-4 mb-2">{'}'}</div>
                <div className="text-blue-400 ml-4 mb-2">// Trả về kết quả</div>
                <div className="text-white ml-4 mb-2">return sum;</div>
                <div className="text-green-400 mb-4">{'}'}</div>
                <div className="text-gray-400 mb-2">// Test với nhiều test cases</div>
                <div className="text-purple-400 mb-2">console.log(sumArray([1, 2, 3, 4, 5])); // Expected: 15</div>
                <div className="text-purple-400 mb-2">console.log(sumArray([10, -2, 7, 0])); // Expected: 15</div>
                <div className="text-purple-400 mb-2">console.log(sumArray([100])); // Expected: 100</div>
                
                {/* Output Display */}
                <div id="demo-output" className="mt-4 pt-4 border-t border-gray-700">
                  <div className="text-gray-500 flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    <span>Click "Run Code" to see the magic happen...</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature Cards - Professional Design */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <motion.div 
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg"
                >
                  <Brain className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-black text-gray-800 mb-4 text-center">🧠 Tư Duy Thuật Toán</h3>
                <p className="text-gray-600 text-center leading-relaxed font-medium">
                  Rèn luyện khả năng phân tích bài toán, lựa chọn thuật toán tối ưu và trình bày giải pháp logic
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-blue-600 font-medium">
                  <Zap className="w-4 h-4" />
                  <span>Advanced Algorithms</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <motion.div 
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg"
                >
                  <Target className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-black text-gray-800 mb-4 text-center">🎯 Lộ Trình Chuyên Sâu</h3>
                <p className="text-gray-600 text-center leading-relaxed font-medium">
                  Hệ thống bài tập từ cơ bản đến nâng cao, theo lộ trình rõ ràng và có tính liên tục
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-green-600 font-medium">
                  <Award className="w-4 h-4" />
                  <span>Structured Learning</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <motion.div 
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg"
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-black text-gray-800 mb-4 text-center">🤖 AI Chấm Điểm</h3>
                <p className="text-gray-600 text-center leading-relaxed font-medium">
                  Hệ thống AI thông minh chấm điểm, phản hồi chi tiết và game hóa quá trình học tập
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-purple-600 font-medium">
                  <Terminal className="w-4 h-4" />
                  <span>Smart Evaluation</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 shadow-2xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-black text-white mb-2">100</div>
                <div className="text-blue-100 font-medium">Bài Tập</div>
              </div>
              <div>
                <div className="text-4xl font-black text-white mb-2">10k+</div>
                <div className="text-blue-100 font-medium">Người Dùng</div>
              </div>
              <div>
                <div className="text-4xl font-black text-white mb-2">95%</div>
                <div className="text-blue-100 font-medium">Tỷ Lệ Hoàn Thành</div>
              </div>
              <div>
                <div className="text-4xl font-black text-white mb-2">24/7</div>
                <div className="text-blue-100 font-medium">Hỗ Trợ AI</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl xl:max-w-7xl 2xl:max-w-8xl bg-white">
        {/* Challenge Failed/Banned State */}
        {(challengeProgress.failed || challengeProgress.banned) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <motion.div 
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-sm border border-red-500/30 p-6 shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/20 rounded-full blur-3xl" />
              
              <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-xl"
                  >
                    <XCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="w-6 h-6 text-red-400" />
                      <h3 className="font-bold text-2xl text-white">
                        {challengeProgress.banned 
                          ? '🚫 Tài Khoản Bị Cấm Vĩnh Viễn' 
                          : 'Thử Thách Đã Kết Thúc'}
                      </h3>
                    </div>
                    <p className="text-white/80">
                      {challengeProgress.failedReason || 'Bạn đã không hoàn thành thử thách.'}
                    </p>
                    {challengeProgress.banned ? (
                      <p className="text-white/60 text-sm mt-1">
                        Tài khoản này không thể tham gia thử thách nữa. Tài khoản khác vẫn hoạt động bình thường.
                      </p>
                    ) : (
                      <p className="text-white/60 text-sm mt-1">
                        Tiến độ: Ngày {challengeProgress.completedDays}/20 • Thử thách đã kết thúc vĩnh viễn, không thể thử lại.
                      </p>
                    )}
                  </div>
                </div>
                {/* NO retry button - challenge failure is permanent */}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Challenge CTA - Show if no active challenge, not failed, not banned */}
        {!challengeProgress.isActive && !challengeProgress.failed && !challengeProgress.banned && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <motion.div 
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-yellow-500/10 border border-primary/20 p-6 cursor-pointer"
              whileHover={{ scale: 1.01 }}
              onClick={() => setShowChallengeGuide(true)}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              
              <div className="relative flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shrink-0"
                  >
                    <Gift className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <h3 className="font-bold text-lg">Thử Thách 20 Ngày - Thưởng 200k</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Hoàn thành 5 bài/ngày trong 20 ngày liên tục để nhận thưởng 200,000 VND
                    </p>
                  </div>
                </div>
                <motion.button
                  className="btn-primary text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChallengeGuide(true);
                  }}
                >
                  <Target className="w-5 h-5" />
                  Tham Gia Ngay
                </motion.button>
              </div>

              {/* Quick Rules */}
              <div className="relative mt-4 flex flex-wrap gap-3 text-xs">
                <span className="px-3 py-1.5 bg-white/50 rounded-full flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  20 ngày liên tục
                </span>
                <span className="px-3 py-1.5 bg-white/50 rounded-full flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-accent" />
                  5 bài/ngày (3 dễ, 1 TB, 1 khó)
                </span>
                <span className="px-3 py-1.5 bg-white/50 rounded-full flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-destructive" />
                  Chống gian lận AI
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Challenge Dashboard - Show if challenge is active */}
        {challengeProgress.isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full mb-6"
          >
            <ChallengeDashboard
              progress={challengeProgress}
              currentDayChallenge={challengeProgress.dailyChallenges[challengeProgress.currentDay - 1] || null}
              onStartProblem={onStartChallengeProblem}
              onViewGuide={() => setShowChallengeGuide(true)}
            />
          </motion.div>
        )}

        {/* API Key Section - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`w-full relative overflow-hidden rounded-2xl p-6 mb-6 border-2 ${
            hasApiKey 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
              : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300 shadow-lg'
          }`}
        >
          {/* Alert Banner for missing API key */}
          {!hasApiKey && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10"
            >
              ⚠️ BẮT BUỘC
            </motion.div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <motion.div 
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                hasApiKey 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-br from-orange-500 to-red-600 animate-pulse'
              }`}
              animate={hasApiKey ? { rotate: [0, 10, -10, 0] } : { scale: [1, 1.1, 1] }}
              transition={{ duration: hasApiKey ? 5 : 2, repeat: Infinity }}
            >
              <Key className="w-8 h-8 text-white" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-xl mb-1">
                {hasApiKey ? '✅ API Key Đã Sẵn Sàng' : '🔑 Groq API Key - Bắt Buộc'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {hasApiKey 
                  ? 'AI đã sẵn sàng chấm điểm bài làm của bạn' 
                  : 'Bạn cần nhập API Key để AI có thể chấm điểm bài làm'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                <span className={`text-xs font-medium ${hasApiKey ? 'text-green-600' : 'text-red-600'}`}>
                  {hasApiKey ? 'Đã kết nối' : 'Chưa kết nối'}
                </span>
              </div>
            </div>
            {hasApiKey && (
              <motion.div 
                className="flex items-center gap-1.5 px-3 py-2 bg-green-100 rounded-full border border-green-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Hoạt động</span>
              </motion.div>
            )}
          </div>

          {!hasApiKey && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800 mb-1">🚫 Không thể làm bài nếu chưa có API Key</p>
                  <p className="text-xs text-yellow-700">API Key là bắt buộc để AI có thể chấm điểm bài làm của bạn. Hoàn toàn miễn phí!</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  {hasApiKey ? 'API Key hiện tại:' : 'Nhập API Key của bạn:'}
                </label>
                {!hasApiKey && (
                  <button
                    type="button"
                    onClick={onOpenApiKey}
                    className="text-xs text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Hướng dẫn chi tiết
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setError(null);
                    setSuccess(false);
                  }}
                  placeholder={hasApiKey ? "API Key đã được lưu" : "gsk_abcdefghijklmnopqrstuvwxyz123456"}
                  disabled={hasApiKey}
                  className={`w-full px-4 py-4 pr-12 rounded-xl border-2 font-mono text-sm transition-all ${
                    hasApiKey 
                      ? 'bg-green-50 border-green-200 text-green-700 cursor-not-allowed' 
                      : 'bg-white border-orange-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none'
                  }`}
                />
                {!hasApiKey && apiKey && (
                  <button
                    type="button"
                    onClick={() => setApiKey('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {!hasApiKey && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Key được mã hóa và lưu an toàn trên trình duyệt của bạn
                </p>
              )}
            </div>

            {!hasApiKey && (
              <>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg border border-red-200"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg border border-green-200"
                  >
                    <CheckCircle className="w-4 h-4" />
                    API key hợp lệ! Đang lưu...
                  </motion.div>
                )}

                <div className="flex gap-2">
                  <motion.button
                    onClick={handleSaveApiKey}
                    disabled={isValidating || !apiKey.trim()}
                    className="flex-1 btn-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang xác thực...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Lưu API Key
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={onOpenApiKey}
                    className="btn-secondary py-3 px-4 rounded-xl font-medium text-sm flex items-center gap-2 shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Hướng dẫn
                  </motion.button>
                </div>
              </>
            )}

            {hasApiKey && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">API Key đã sẵn sàng!</span>
                </div>
                <button
                  onClick={onOpenApiKey}
                  className="text-xs text-green-600 hover:text-green-700 transition-colors font-medium"
                >
                  Cập nhật key
                </button>
              </div>
            )}
          </div>

          {/* Quick Guide */}
          {!hasApiKey && (
            <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">🚀 Lấy API Key nhanh chóng:</p>
                  <ol className="text-xs text-red-700 space-y-1">
                    <li>1. <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-800">Mở Groq Console</a></li>
                    <li>2. Đăng ký tài khoản miễn phí</li>
                    <li>3. Tạo API Key mới</li>
                    <li>4. Copy và dán vào ô trên</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Enhanced Stats Overview - Only show if authenticated and has progress */}
        {isAuthenticated && hasApiKey && (
          <div id="stats-overview">
            <StatsOverview progress={progress} />
          </div>
        )}

        {/* Quick Actions */}
        <QuickActions
          onStartPractice={onStart}
          onSelectProblem={onSelectProblem}
          onViewProgress={onViewProgress || (() => {
            // Show progress overview if no handler provided
            const statsOverview = document.getElementById('stats-overview');
            if (statsOverview) {
              statsOverview.scrollIntoView({ behavior: 'smooth' });
            }
          })}
          onViewLeaderboard={onShowLeaderboard}
          onStartChallenge={onStartChallenge}
          hasApiKey={hasApiKey}
          isAuthenticated={isAuthenticated}
          recentProblemId={progress.history?.[progress.history.length - 1]?.problemId}
        />

        {/* Recent Activities */}
        {isAuthenticated && hasApiKey && (
          <RecentActivities progress={progress} />
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-2 gap-3 mb-5"
        >
          <motion.button
            onClick={onStart}
            disabled={!hasApiKey}
            className={`w-full relative overflow-hidden font-black py-5 rounded-2xl text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${
              hasApiKey 
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-2xl' 
                : 'bg-gray-200 text-gray-500'
            }`}
            whileHover={{ scale: hasApiKey ? 1.05 : 1 }}
            whileTap={{ scale: hasApiKey ? 0.95 : 1 }}
          >
            {hasApiKey && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut"
                }}
              />
            )}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            <span className="relative z-10">{hasApiKey ? 'Luyện Tập Ngẫu Nhiên' : 'Nhập API Key trước'}</span>
            {hasApiKey && (
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.button>

          <motion.button
            onClick={onSelectProblem}
            disabled={!hasApiKey}
            className={`w-full relative overflow-hidden font-black py-5 rounded-2xl text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${
              hasApiKey 
                ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white shadow-2xl' 
                : 'bg-gray-200 text-gray-500'
            }`}
            whileHover={{ scale: hasApiKey ? 1.05 : 1 }}
            whileTap={{ scale: hasApiKey ? 0.95 : 1 }}
          >
            {hasApiKey && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                  ease: "easeInOut"
                }}
              />
            )}
            <motion.div
              animate={{
                rotate: [0, -360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                delay: 0.5
              }}
            >
              <BookOpen className="w-6 h-6" />
            </motion.div>
            <span className="relative z-10">Chọn Bài Tập</span>
            {hasApiKey && (
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.button>
        </motion.div>

        {/* Leaderboard & Violations Board Buttons */}
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={onShowLeaderboard}
            className="w-full relative overflow-hidden font-black py-4 rounded-2xl text-lg bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 text-white shadow-2xl flex items-center justify-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 2.5,
                ease: "easeInOut"
              }}
            />
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.3, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                delay: 1.5
              }}
            >
              <Crown className="w-6 h-6" />
            </motion.div>
            <span className="relative z-10">Bảng Xếp Hạng</span>
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl blur-xl opacity-50"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: "easeInOut"
              }}
            />
          </motion.button>

          {onShowViolationsBoard && (
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              onClick={onShowViolationsBoard}
              className="w-full relative overflow-hidden font-black py-4 rounded-2xl text-lg bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white shadow-2xl flex items-center justify-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.3, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 2
                }}
              >
                <Shield className="w-6 h-6" />
              </motion.div>
              <span className="relative z-10">Bảng Vi Phạm</span>
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-50"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut"
                }}
              />
            </motion.button>
          )}
        </div>

        {/* Footer */}
        <motion.footer
          id="contact"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full mt-20 bg-gradient-to-br from-rose-100 via-pink-100 to-rose-50 border-t border-rose-200"
        >
          {/* Main Footer Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Company Info */}
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-lg">HL</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-800">HIRELOGIC</h3>
                    <p className="text-sm text-rose-600 font-bold">Together We Overcome</p>
                  </div>
                </motion.div>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600 text-base font-semibold leading-relaxed"
                >
                  Nền tảng luyện tập thuật toán và tư duy lập trình theo góc nhìn của nhà tuyển dụng. 
                  Giúp sinh viên IT sẵn sàng cho phỏng vấn kỹ thuật.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3"
                >
                  <a
                    href="https://www.facebook.com/profile.php?id=61586631195931"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-600/20 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a
                    href="https://github.com/tuanfptu122005194908"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </motion.div>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <motion.h4 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-black text-gray-800"
                >
                  Nhanh nhanh
                </motion.h4>
                <motion.ul 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <li><a href="#about-project" className="text-gray-600 hover:text-rose-600 transition-colors text-base font-semibold">Giới thiệu dự án</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-rose-600 transition-colors text-base font-semibold">Thử thách 20 ngày</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-rose-600 transition-colors text-base font-semibold">Bảng xếp hạng</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-rose-600 transition-colors text-base font-semibold">Hướng dẫn sử dụng</a></li>
                </motion.ul>
              </div>

              {/* Resources */}
              <div className="space-y-4">
                <motion.h4 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-black text-gray-800"
                >
                  Tài nguyên
                </motion.h4>
                <motion.ul 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <li><a href="#" className="text-gray-600 hover:text-rose-600 transition-colors text-base font-semibold">Cấu trúc dữ liệu</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-rose-600 transition-colors text-base font-semibold">Thuật toán cơ bản</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-rose-600 transition-colors text-base font-semibold">Luyện phỏng vấn</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-rose-600 transition-colors text-base font-semibold">Blog kỹ thuật</a></li>
                </motion.ul>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <motion.h4 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl font-black text-gray-800"
                >
                  Liên hệ
                </motion.h4>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 text-base font-semibold text-gray-600">
                    <div className="w-8 h-8 bg-rose-200 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span>support@hirelogic.tech</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-base font-semibold text-gray-600">
                    <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <span>Luôn hỗ trợ 24/7</span>
                  </div>
                  
                  <motion.a
                    href="https://www.facebook.com/profile.php?id=61586631195931"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook Fanpage
                  </motion.a>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-rose-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-base font-bold text-gray-600"
                >
                  © 2026 HireLogic. Được phát triển với 💖 bởi <span className="text-rose-600 font-black">TWO</span> - Together We Overcome
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-6 text-base font-semibold text-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-rose-500" />
                    <span id="footer-visit-count" className="font-mono font-black text-rose-600">10,000+</span>
                    <span>lượt truy cập</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span>System Online</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>

      {/* Challenge Guide Modal */}
      <AnimatePresence>
        {showChallengeGuide && (
          <ChallengeGuide
            onStartChallenge={handleStartChallengeClick}
            onClose={() => setShowChallengeGuide(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
