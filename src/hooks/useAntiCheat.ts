import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type CheatViolationType = 'EXIT_FULLSCREEN' | 'TAB_SWITCH' | 'WINDOW_BLUR' | 'EXIT_TO_MAIN';

interface UseAntiCheatOptions {
  enabled: boolean;
  problemId?: number;
  dayNumber?: number;
  onViolation?: (type: CheatViolationType, count: number, totalToday: number) => void;
  // Callback to persist violation to DB via useChallengeProgress
  onPersistViolation?: () => Promise<number>;
  // Initial violation count loaded from DB
  initialViolationCount?: number;
}

// In-memory violation counter (synced with DB on load)
export const globalViolationCounter = {
  total: 0,
  byType: new Map<CheatViolationType, number>(),
  _initialized: false,
  _userId: '' as string,
  
  initFromDB(userId: string, count: number) {
    this._userId = userId;
    this.total = count;
    this._initialized = true;
  },
  
  increment(type: CheatViolationType): number {
    this.total += 1;
    const current = this.byType.get(type) || 0;
    this.byType.set(type, current + 1);
    return this.total;
  },
  
  getTotal(): number {
    return this.total;
  },

  isLoading(): boolean {
    return false;
  },

  reset() {
    this.total = 0;
    this.byType.clear();
    this._initialized = false;
    this._userId = '';
  },
};

export const useAntiCheat = ({
  enabled,
  problemId,
  dayNumber,
  onViolation,
  onPersistViolation,
  initialViolationCount = 0,
}: UseAntiCheatOptions) => {
  const { user } = useAuth();
  const isFullscreenRef = useRef(false);
  const hasRequestedFullscreenRef = useRef(false);
  const isLoggingRef = useRef(false);
  const [violationCount, setViolationCount] = useState(initialViolationCount);

  // Sync initial violation count from DB
  useEffect(() => {
    if (user && enabled) {
      globalViolationCounter.initFromDB(user.id, initialViolationCount);
      setViolationCount(initialViolationCount);
    }
  }, [user, enabled, initialViolationCount]);

  // ÉP VÀO FULLSCREEN KHI BẮT ĐẦU
  useEffect(() => {
    if (!enabled || !user) return;

    const enterFullscreen = async () => {
      try {
        const isInFullscreen = () => {
          return !!(
            document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).mozFullScreenElement ||
            (document as any).msFullscreenElement
          );
        };

        if (isInFullscreen()) {
          isFullscreenRef.current = true;
          hasRequestedFullscreenRef.current = true;
          return;
        }

        const el = document.documentElement as any;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
          await el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen();
        } else {
          console.warn('Fullscreen API not supported');
        }
        isFullscreenRef.current = true;
        hasRequestedFullscreenRef.current = true;
      } catch (error: unknown) {
        const err = error as Error;
        if (err.name === 'NotAllowedError' || err.message?.includes('gesture')) {
          console.warn('Fullscreen requires user gesture.');
        } else {
          console.error('Failed to request fullscreen:', error);
        }
        hasRequestedFullscreenRef.current = true;
      }
    };

    const requestOnInteraction = () => {
      enterFullscreen();
      document.removeEventListener('click', requestOnInteraction);
      document.removeEventListener('touchstart', requestOnInteraction);
      document.removeEventListener('keydown', requestOnInteraction);
    };

    document.addEventListener('click', requestOnInteraction, { once: true });
    document.addEventListener('touchstart', requestOnInteraction, { once: true });
    document.addEventListener('keydown', requestOnInteraction, { once: true });

    const timeout = setTimeout(() => {
      enterFullscreen();
    }, 500);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('click', requestOnInteraction);
      document.removeEventListener('touchstart', requestOnInteraction);
      document.removeEventListener('keydown', requestOnInteraction);
    };
  }, [enabled, user]);

  // Log cheat violation - increment in-memory, persist to DB
  const logCheat = useCallback(
    async (violationType: CheatViolationType) => {
      if (!user) {
        console.warn('Cannot log violation: user not authenticated');
        return;
      }

      // Prevent rapid double-logging (debounce 500ms)
      if (isLoggingRef.current) return;
      isLoggingRef.current = true;
      setTimeout(() => { isLoggingRef.current = false; }, 500);

      // Increment local counter
      const totalNow = globalViolationCounter.increment(violationType);
      const count = globalViolationCounter.byType.get(violationType) || 1;
      setViolationCount(totalNow);

      console.log(`🚨 Violation #${totalNow}: ${violationType} (type count: ${count})`);

      // Call callback
      if (onViolation) {
        onViolation(violationType, count, totalNow);
      }

      // Show warning based on total violations
      if (totalNow >= 5) {
        toast.error(
          `🚫 TÀI KHOẢN CỦA BẠN ĐÃ BỊ CẤM VĨNH VIỄN! Vi phạm ${totalNow}/5 lần. Tài khoản này không thể tham gia thử thách nữa!`,
          { duration: 10000 }
        );
      } else if (totalNow >= 4) {
        toast.warning(
          `⚠️ CẢNH BÁO NGHIÊM TRỌNG: Vi phạm ${totalNow}/5 lần! Chỉ còn 1 cơ hội trước khi TÀI KHOẢN BỊ CẤM VĨNH VIỄN!`,
          { duration: 8000 }
        );
      } else if (totalNow >= 3) {
        toast.warning(
          `⚠️ CẢNH BÁO: Vi phạm ${totalNow}/5 lần! Còn ${5 - totalNow} cơ hội.`,
          { duration: 6000 }
        );
      } else {
        toast.error(
          `🔴 VI PHẠM: ${getViolationMessage(violationType)} (${totalNow}/5 lần)`,
          { duration: 4000 }
        );
      }

      // Persist to DB via useChallengeProgress (reliable, uses user_progress table)
      if (onPersistViolation) {
        try {
          await onPersistViolation();
        } catch (error) {
          console.warn('Error persisting violation:', error);
        }
      }
    },
    [user, problemId, dayNumber, onViolation, onPersistViolation]
  );

  // BẮT SỰ KIỆN THOÁT FULLSCREEN
  useEffect(() => {
    if (!enabled) return;

    const isInFullscreen = () => {
      return !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
    };

    const handleFullscreenChange = () => {
      const currentlyInFullscreen = isInFullscreen();
      
      if (!currentlyInFullscreen) {
        if (hasRequestedFullscreenRef.current) {
          console.log('🚨 EXIT_FULLSCREEN detected');
          logCheat('EXIT_FULLSCREEN');
        }
        isFullscreenRef.current = false;
      } else {
        isFullscreenRef.current = true;
        hasRequestedFullscreenRef.current = true;
      }
    };

    if (isInFullscreen()) {
      isFullscreenRef.current = true;
      hasRequestedFullscreenRef.current = true;
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [enabled, logCheat]);

  // CHẶN ESC
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.fullscreenElement) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [enabled]);

  // Track visibility changes (tab switch)
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logCheat('TAB_SWITCH');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, logCheat]);

  // Track window blur
  useEffect(() => {
    if (!enabled) return;

    const handleBlur = () => {
      logCheat('WINDOW_BLUR');
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [enabled, logCheat]);

  // Cleanup: exit fullscreen when disabled
  useEffect(() => {
    if (!enabled && isFullscreenRef.current && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      isFullscreenRef.current = false;
    }
  }, [enabled]);

  const logViolation = useCallback(
    (violationType: CheatViolationType) => {
      if (enabled) {
        logCheat(violationType);
      }
    },
    [enabled, logCheat]
  );

  const requestFullscreen = useCallback(async () => {
    if (!enabled) return false;

    try {
      const isInFullscreen = () => {
        return !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        );
      };

      if (isInFullscreen()) {
        isFullscreenRef.current = true;
        hasRequestedFullscreenRef.current = true;
        return true;
      }

      const el = document.documentElement as any;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        await el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      } else {
        return false;
      }
      isFullscreenRef.current = true;
      hasRequestedFullscreenRef.current = true;
      return true;
    } catch (error: unknown) {
      console.error('Failed to request fullscreen:', error);
      hasRequestedFullscreenRef.current = true;
      return false;
    }
  }, [enabled]);

  return {
    isFullscreen: isFullscreenRef.current,
    violationCount,
    logViolation,
    requestFullscreen,
  };
};

function getViolationMessage(type: CheatViolationType): string {
  switch (type) {
    case 'EXIT_FULLSCREEN':
      return 'Thoát chế độ toàn màn hình';
    case 'TAB_SWITCH':
      return 'Chuyển tab hoặc thu nhỏ cửa sổ';
    case 'WINDOW_BLUR':
      return 'Mất focus khỏi cửa sổ';
    case 'EXIT_TO_MAIN':
      return 'Thoát về màn hình chính';
    default:
      return 'Vi phạm quy tắc';
  }
}
