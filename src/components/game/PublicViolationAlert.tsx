import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Shield } from 'lucide-react';

interface Violation {
  userId: string;
  reason: string;
  time: string;
}

export const PublicViolationAlert = () => {
  const [recentViolations, setRecentViolations] = useState<Violation[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fetch recent violations (last 5 minutes)
    const fetchRecentViolations = () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const violationsData = JSON.parse(localStorage.getItem("violations") || "[]");
      const recentViolations = violationsData.filter((v: Violation) => 
        new Date(v.time) > fiveMinutesAgo
      );

      if (recentViolations.length > 0) {
        const violations: Violation[] = recentViolations.map((v: Violation) => ({
          userId: v.userId,
          reason: v.reason,
          time: v.time,
        }));

        setRecentViolations(violations);
        setIsVisible(true);
        
        // Auto hide after 10 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 10000);
      }
    };

    // Initial fetch
    fetchRecentViolations();

    // Poll every 5 seconds
    const interval = setInterval(fetchRecentViolations, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getViolationMessage = (reason: string) => {
    // The reason is already descriptive from the hook
    return reason;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 10) return 'vừa xong';
    if (diff < 60) return `${diff} giây trước`;
    return `${Math.floor(diff / 60)} phút trước`;
  };

  if (recentViolations.length === 0 || !isVisible) return null;

  const latestViolation = recentViolations[0];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white shadow-2xl"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="flex-shrink-0"
                >
                  <AlertTriangle className="w-6 h-6" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm md:text-base">
                    ⚠️ CẢNH BÁO VI PHẠM
                  </p>
                  <p className="text-xs md:text-sm opacity-90 truncate">
                    <strong>User {latestViolation.userId.slice(0, 8)}</strong> 
                    {' '}đã {getViolationMessage(latestViolation.reason)} 
                    {' '}• {formatTime(latestViolation.time)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                  {recentViolations.length} vi phạm gần đây
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Warning about 3 violations */}
            <div className="mt-2 pt-2 border-t border-white/30">
              <div className="flex items-center gap-2 text-xs">
                <Shield className="w-4 h-4" />
                <span className="font-semibold">
                  ⚠️ Lưu ý: Vi phạm 5 lần sẽ bị loại khỏi thử thách!
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
