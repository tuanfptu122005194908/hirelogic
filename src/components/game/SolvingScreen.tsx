import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor, { Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { Problem, LANGUAGES } from '@/types/game';
import { Code, Send, Clock, ChevronDown, FileText, Lightbulb, Lock, AlertTriangle, ChevronUp, Scroll } from 'lucide-react';
import { LoadingOverlay } from './LoadingOverlay';
import { LiveCodeRunner } from './LiveCodeRunner';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import { toast } from 'sonner';

// Code templates for each language
const CODE_TEMPLATES: Record<string, string> = {
  javascript: `// Viết code của bạn ở đây
function solve(input) {
  // TODO: Implement your solution
  
  return result;
}

// Ví dụ sử dụng:
// console.log(solve(input));
`,
  python: `# Viết code của bạn ở đây
def solve(input):
    # TODO: Implement your solution
    
    return result

# Ví dụ sử dụng:
# print(solve(input))
`,
  java: `// Viết code của bạn ở đây
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        // TODO: Implement your solution
        
    }
    
    public static Object solve(Object input) {
        // TODO: Implement your solution
        
        return null;
    }
}
`,
  c: `// Viết code của bạn ở đây
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // TODO: Implement your solution
    
    return 0;
}
`,
  cpp: `// Viết code của bạn ở đây
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // TODO: Implement your solution
    
    return 0;
}
`,
  typescript: `// Viết code của bạn ở đây
function solve(input: unknown): unknown {
  // TODO: Implement your solution
  
  return result;
}

// Ví dụ sử dụng:
// console.log(solve(input));
`,
};

const ADMIN_PASSWORD = 'twossg';

interface SolvingScreenProps {
  problem: Problem;
  mode: 'practice' | 'interview';
  onSubmit: (thinking: string, code: string, language: string, answers: string[]) => void;
  onBack: () => void;
  isLoading: boolean;
  isChallenge?: boolean; // Is this a challenge problem?
  dayNumber?: number; // Challenge day number
  onPersistViolation?: () => Promise<number>; // Persist violation to DB
  initialViolationCount?: number; // Initial violation count from DB
}

export const SolvingScreen = ({ 
  problem, 
  mode, 
  onSubmit, 
  onBack,
  isLoading,
  isChallenge = false,
  dayNumber,
  onPersistViolation,
  initialViolationCount = 0,
}: SolvingScreenProps) => {
  const [code, setCode] = useState(CODE_TEMPLATES['javascript']);
  const [language, setLanguage] = useState('javascript');
  const [timeLeft, setTimeLeft] = useState(mode === 'interview' ? 20 * 60 : null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isPasteUnlocked, setIsPasteUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [totalViolationsToday, setTotalViolationsToday] = useState(0);
  const [showExitWarningModal, setShowExitWarningModal] = useState(false);
  const [isProblemScrolled, setIsProblemScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showLiveRunner, setShowLiveRunner] = useState(true);

  const languageRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const isPasteUnlockedRef = useRef(false);
  const problemPanelRef = useRef<HTMLDivElement>(null);

  // Anti-cheat system for challenge mode
  const { logViolation, requestFullscreen } = useAntiCheat({
    enabled: isChallenge,
    problemId: problem.id,
    dayNumber: dayNumber,
    onPersistViolation,
    initialViolationCount,
    onViolation: (type, count, totalToday) => {
      setTotalViolationsToday(totalToday);
      // If reached 5 violations, force disqualification - allow exit
      if (totalToday >= 5) {
        // Exit fullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    },
  });

  // Request fullscreen when component mounts (after user interaction)
  useEffect(() => {
    if (isChallenge && requestFullscreen) {
      // Request fullscreen after a short delay to ensure user interaction is complete
      const timeout = setTimeout(() => {
        requestFullscreen();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isChallenge, requestFullscreen]);

  // Keep ref in sync with state
  useEffect(() => {
    isPasteUnlockedRef.current = isPasteUnlocked;
  }, [isPasteUnlocked]);

  // Timer for interview mode
  useEffect(() => {
    if (mode !== 'interview' || timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, timeLeft]);

  // Close language menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(e.target as Node)) {
        setShowLanguageMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Anti-cheat: Block paste globally and in Monaco editor
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isPasteUnlockedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        setShowPasswordModal(true);
        toast.error('⚠️ Không được phép dán code! Nhập mật khẩu admin để mở khóa.');
      }
    };

    document.addEventListener('paste', handlePaste, true);
    return () => document.removeEventListener('paste', handlePaste, true);
  }, []);

  // Handle Monaco Editor mount to block paste
  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    
    // Block paste command in Monaco
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      if (!isPasteUnlockedRef.current) {
        setShowPasswordModal(true);
        toast.error('⚠️ Không được phép dán code! Nhập mật khẩu admin để mở khóa.');
        return;
      }
      // If unlocked, execute default paste
      editor.trigger('keyboard', 'editor.action.clipboardPasteAction', null);
    });

    // Also block Shift+Insert
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Insert, () => {
      if (!isPasteUnlockedRef.current) {
        setShowPasswordModal(true);
        toast.error('⚠️ Không được phép dán code! Nhập mật khẩu admin để mở khóa.');
        return;
      }
      editor.trigger('keyboard', 'editor.action.clipboardPasteAction', null);
    });
  };

  // Update code template when language changes
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Only update template if code is still default template
    const currentTemplate = CODE_TEMPLATES[language];
    if (code === currentTemplate || code === '') {
      setCode(CODE_TEMPLATES[newLanguage]);
    }
    setShowLanguageMenu(false);
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsPasteUnlocked(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      toast.success('✅ Đã mở khóa chức năng dán code!');
    } else {
      toast.error('❌ Mật khẩu không đúng!');
      setPasswordInput('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle scroll for problem panel
  const handleProblemScroll = () => {
    if (problemPanelRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = problemPanelRef.current;
      const isScrolled = scrollTop > 50;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      
      setIsProblemScrolled(isScrolled);
      setShowScrollTop(isScrolled && !isNearBottom);
    }
  };

  const scrollToTop = () => {
    if (problemPanelRef.current) {
      problemPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element && problemPanelRef.current) {
      const container = problemPanelRef.current;
      const elementTop = element.offsetTop - container.offsetTop;
      container.scrollTo({ top: elementTop, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    onSubmit('', code, language, []);
  };
  const handleBackClick = () => {
    if (isChallenge) {
      // If already disqualified, allow exit
      if (totalViolationsToday >= 5) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        onBack();
        return;
      }
      // Show warning modal
      setShowExitWarningModal(true);
      // Log violation
      if (logViolation) {
        logViolation('EXIT_TO_MAIN');
      }
      toast.error('⚠️ Không được phép thoát về màn hình chính trong chế độ thử thách!', { duration: 3000 });
    } else {
      // Normal mode - allow exit
      onBack();
    }
  };

  // Block browser back button in challenge mode
  useEffect(() => {
    if (!isChallenge) return;

    // Push a state to prevent back navigation
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      // If disqualified, allow exit
      if (totalViolationsToday >= 5) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        onBack();
        return;
      }
      // Prevent back navigation
      window.history.pushState(null, '', window.location.href);
      // Show warning and log violation
      setShowExitWarningModal(true);
      if (logViolation) {
        logViolation('EXIT_TO_MAIN');
      }
      toast.error('⚠️ Không được phép thoát về màn hình chính trong chế độ thử thách!', { duration: 3000 });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isChallenge, logViolation]);

  // Block ESC key to close modal in challenge mode
  useEffect(() => {
    if (!isChallenge || !showExitWarningModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        toast.error('⚠️ Không thể đóng cảnh báo! Bạn phải ở lại làm bài.', { duration: 2000 });
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isChallenge, showExitWarningModal]);

  const selectedLang = LANGUAGES.find(l => l.id === language)!;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-mint/10 text-mint border-mint/20';
      case 'Medium': return 'bg-peach/10 text-peach border-peach/20';
      case 'Hard': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen flex flex-col sakura-bg w-full">
      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isLoading} />

      {/* Anti-cheat Warning Banner */}
      {isChallenge && totalViolationsToday > 0 && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`sticky top-0 z-20 px-4 py-3 ${
            totalViolationsToday >= 5
              ? 'bg-destructive/90 text-destructive-foreground'
              : totalViolationsToday >= 4
              ? 'bg-yellow-500/90 text-yellow-900'
              : 'bg-orange-500/90 text-orange-900'
          }`}
        >
          <div className="container mx-auto max-w-7xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              {totalViolationsToday >= 5 ? (
                <p className="font-semibold">
                  🚫 BẠN ĐÃ BỊ LOẠI! Vi phạm {totalViolationsToday} lần. Kết quả thử thách sẽ KHÔNG được công nhận!
                </p>
              ) : totalViolationsToday >= 4 ? (
                <p className="font-medium">
                  ⚠️ CẢNH BÁO: Bạn đã vi phạm {totalViolationsToday} lần. Vi phạm lần 5 sẽ khiến bạn BỊ LOẠI khỏi thử thách!
                </p>
              ) : (
                <p className="text-sm">
                  ℹ️ Bạn đã vi phạm {totalViolationsToday}/5 lần. Vui lòng tuân thủ quy tắc để kết quả được công nhận.
                </p>
              )}
            </div>
            {totalViolationsToday >= 5 && (
              <button
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                  }
                  onBack();
                }}
                className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
              >
                ← Quay về
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="glass-card border-b sticky top-0 z-10">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBackClick}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            ← Thoát
          </button>

          <h1 className="text-lg font-semibold text-foreground hidden md:block">
            {problem.title}
          </h1>

          <div className="flex items-center gap-4">
            {/* Timer */}
            {timeLeft !== null && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                timeLeft < 300 ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
              </div>
            )}

            {/* Language Selector */}
            <div className="relative" ref={languageRef}>
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <span>{selectedLang.icon}</span>
                <span className="text-sm font-medium">{selectedLang.name}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-40 bg-card rounded-lg shadow-card border overflow-hidden z-20"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => handleLanguageChange(lang.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors ${
                          lang.id === language ? 'bg-primary/10 text-primary' : ''
                        }`}
                      >
                        <span>{lang.icon}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal for Paste */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Chống gian lận</h3>
                  <p className="text-sm text-muted-foreground">Nhập mật khẩu admin để dán code</p>
                </div>
              </div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Mật khẩu..."
                className="w-full px-4 py-2 rounded-lg border bg-background text-foreground mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Warning Modal for Challenge Mode */}
      <AnimatePresence>
        {showExitWarningModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]"
            onClick={(e) => {
              if (totalViolationsToday >= 5) return; // Allow closing if disqualified
              e.stopPropagation();
              toast.error('⚠️ Không thể đóng! Bạn phải ở lại làm bài.', { duration: 2000 });
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-card rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border-2 ${
                totalViolationsToday >= 5 ? 'border-destructive/50' : 'border-orange-500/50'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {totalViolationsToday >= 5 ? (
                <>
                  {/* DISQUALIFIED - Allow exit */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-destructive">🚫 BẠN ĐÃ BỊ LOẠI</h3>
                      <p className="text-sm text-muted-foreground">Vi phạm {totalViolationsToday} lần - Đã bị loại khỏi thử thách</p>
                    </div>
                  </div>
                  <div className="mb-4 p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                    <p className="text-sm text-foreground font-medium mb-2">
                      🚫 Bạn đã vi phạm <strong>{totalViolationsToday} lần</strong>. Kết quả thử thách sẽ <strong>KHÔNG được công nhận</strong>.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vi phạm của bạn đã được ghi nhận và hiển thị công khai trên bảng xếp hạng.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowExitWarningModal(false);
                        // Exit fullscreen
                        if (document.fullscreenElement) {
                          document.exitFullscreen().catch(() => {});
                        }
                        onBack();
                      }}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors font-medium"
                    >
                      ← Quay về màn hình chính
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* NOT YET DISQUALIFIED - Block exit */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">🚫 Cảnh báo vi phạm</h3>
                      <p className="text-sm text-muted-foreground">Bạn đang cố thoát khỏi màn hình làm bài</p>
                    </div>
                  </div>
                  <div className="mb-4 p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                    <p className="text-sm text-foreground font-medium mb-2">
                      ⚠️ <strong>KHÔNG ĐƯỢC PHÉP THOÁT</strong> về màn hình chính trong chế độ thử thách!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hành động này đã được ghi nhận là vi phạm ({totalViolationsToday}/5). Vi phạm 5 lần sẽ <strong>BỊ LOẠI</strong> khỏi thử thách.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowExitWarningModal(false)}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                    >
                      ✓ Ở lại làm bài
                    </button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Bạn chỉ có thể tiếp tục làm bài hoặc nộp bài để hoàn thành
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Split Layout Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 2xl:gap-10 p-4 lg:p-6 xl:p-8 2xl:p-10 3xl:p-12 4xl:p-16 5xl:p-20 overflow-hidden w-full max-w-full">
        {/* Left Panel - Problem Description */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-[35%] xl:w-[32%] 2xl:w-[30%] 3xl:w-[28%] 4xl:w-[25%] 5xl:w-[22%] glass-card-strong rounded-2xl overflow-hidden flex flex-col lg:max-h-[calc(100vh-200px)]"
        >
          <div className="p-4 xl:p-5 2xl:p-6 3xl:p-7 4xl:p-8 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 text-primary" />
                <h3 className="font-semibold text-foreground text-sm xl:text-base 2xl:text-lg 3xl:text-xl">Đề bài</h3>
              </div>
              <span className={`px-2 py-1 xl:px-3 xl:py-1.5 2xl:px-4 2xl:py-2 text-xs xl:text-sm 2xl:text-base font-medium rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
            </div>
            
            {/* Quick Navigation */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => scrollToSection('problem-story')}
                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
              >
                Tình huống
              </button>
              <button
                onClick={() => scrollToSection('problem-description')}
                className="text-xs px-2 py-1 bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors"
              >
                Yêu cầu
              </button>
              <button
                onClick={() => scrollToSection('problem-examples')}
                className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
              >
                Ví dụ
              </button>
              {mode === 'practice' && problem.hints && problem.hints.length > 0 && (
                <button
                  onClick={() => scrollToSection('problem-hints')}
                  className="text-xs px-2 py-1 bg-mint/10 text-mint rounded hover:bg-mint/20 transition-colors"
                >
                  Gợi ý
                </button>
              )}
            </div>
          </div>
          
          <div 
            ref={problemPanelRef}
            onScroll={handleProblemScroll}
            className="flex-1 overflow-y-auto p-4 xl:p-5 2xl:p-6 3xl:p-7 4xl:p-8 space-y-4 2xl:space-y-5 relative"
          >
            {/* Problem Title - Mobile */}
            <h2 className="text-xl font-bold text-foreground md:hidden">{problem.title}</h2>
            
            {/* Problem Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                <p className="text-xs text-primary font-medium mb-1">Kỹ năng</p>
                <p className="text-sm font-semibold text-foreground">{problem.skill}</p>
              </div>
              <div className="bg-accent/5 rounded-lg p-3 border border-accent/20">
                <p className="text-xs text-accent font-medium mb-1">Level</p>
                <p className="text-sm font-semibold text-foreground">{problem.level}</p>
              </div>
            </div>

            {/* Story */}
            {problem.story && (
              <div id="problem-story" className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 border-l-4 border-primary">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2 text-sm">Tình huống</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {problem.story}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div id="problem-description" className="bg-card/50 rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <Code className="w-4 h-4 text-accent" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">Yêu cầu bài toán</h4>
              </div>
              <div className="pl-10">
                <p className="text-foreground leading-relaxed text-sm whitespace-pre-wrap">
                  {problem.description}
                </p>
              </div>
            </div>

            {/* Input/Output Format */}
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">IN</span>
                  </div>
                  <h4 className="font-medium text-foreground text-sm">Định dạng Input</h4>
                </div>
                <p className="text-sm text-muted-foreground font-mono bg-background/50 rounded-lg p-2 border">
                  {problem.input}
                </p>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">OUT</span>
                  </div>
                  <h4 className="font-medium text-foreground text-sm">Định dạng Output</h4>
                </div>
                <p className="text-sm text-muted-foreground font-mono bg-background/50 rounded-lg p-2 border">
                  {problem.output}
                </p>
              </div>
            </div>

            {/* Examples */}
            <div id="problem-examples" className="bg-card/50 rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">Ví dụ minh họa</h4>
              </div>
              <div className="space-y-3">
                {problem.examples.map((example, index) => (
                  <div key={index} className="bg-background rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                        Ví dụ {index + 1}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-blue-600 w-12 shrink-0">Input:</span>
                        <code className="text-sm text-accent font-mono bg-blue-50 px-2 py-1 rounded border border-blue-200 flex-1 break-all">
                          {example.input}
                        </code>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-green-600 w-12 shrink-0">Output:</span>
                        <code className="text-sm text-primary font-mono bg-green-50 px-2 py-1 rounded border border-green-200 flex-1 break-all">
                          {example.output}
                        </code>
                      </div>
                      {example.explanation && (
                        <div className="flex items-start gap-2 mt-2 pt-2 border-t border-border">
                          <span className="text-xs">💡</span>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {example.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hints for Practice Mode */}
            {mode === 'practice' && problem.hints && problem.hints.length > 0 && (
              <div id="problem-hints" className="bg-mint/5 rounded-xl p-4 border border-mint/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-mint/20 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-mint" />
                  </div>
                  <h4 className="font-semibold text-mint text-sm">Gợi ý</h4>
                </div>
                <div className="space-y-2">
                  {problem.hints.map((hint, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-mint font-medium text-sm shrink-0">{index + 1}.</span>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {hint}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints Section */}
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <h4 className="font-semibold text-orange-800 text-sm">Lưu ý quan trọng</h4>
              </div>
              <ul className="space-y-1 text-sm text-orange-700">
                <li>• Đọc kỹ địnhnh dạng input/output</li>
                <li>• Xem xét các trường hợp đặc biệt</li>
                <li>• Tối ưu hiệu năng cho dữ liệu lớn</li>
                {mode === 'interview' && <li>• Thời gian giới hạn: 20 phút</li>}
              </ul>
            </div>

            {/* Scroll to Top Button */}
            <AnimatePresence>
              {showScrollTop && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToTop}
                  className="fixed bottom-6 left-6 z-10 w-10 h-10 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>

          </div>
        </motion.div>

        {/* Right Panel - Code Editor */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-[65%] xl:w-[68%] 2xl:w-[70%] 3xl:w-[72%] 4xl:w-[75%] 5xl:w-[78%] glass-card-strong rounded-2xl overflow-hidden flex flex-col lg:max-h-[calc(100vh-200px)]"
        >
          <div className="p-4 xl:p-5 2xl:p-6 3xl:p-7 4xl:p-8 border-b border-border flex items-center gap-2">
            <Code className="w-5 h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 text-accent" />
            <h3 className="font-semibold text-foreground text-sm xl:text-base 2xl:text-lg 3xl:text-xl">Code Editor</h3>
            {isPasteUnlocked && (
              <span className="ml-auto text-xs xl:text-sm 2xl:text-base text-mint bg-mint/10 px-2 py-1 xl:px-3 xl:py-1.5 2xl:px-4 2xl:py-2 rounded-full">
                🔓 Đã mở khóa paste
              </span>
            )}
          </div>
          
          <div className="flex-1 min-h-[300px] md:min-h-[400px] lg:min-h-0">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorMount}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 22,
                padding: { top: 20, bottom: 20 },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>

          <div className="p-4 xl:p-5 2xl:p-6 3xl:p-7 4xl:p-8 border-t border-border flex justify-between items-center">
            <button
              onClick={handleBackClick}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              ← Quay lại
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !code.trim()}
              className="btn-primary text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang chấm...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Nộp bài
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Live Code Runner */}
      <LiveCodeRunner
        code={code}
        language={language}
        problem={problem}
        isVisible={showLiveRunner}
        onToggleVisibility={() => setShowLiveRunner(!showLiveRunner)}
      />
    </div>
  );
};
