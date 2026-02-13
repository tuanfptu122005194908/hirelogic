import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Monitor, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

const BROWSER_WARNING_KEY = 'tli_browser_warning_dismissed';
const BROWSER_ID_KEY = 'tli_browser_id';

export const BrowserWarning = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [browserId, setBrowserId] = useState<string | null>(null);

  useEffect(() => {
    // Generate or get browser ID
    let storedBrowserId = localStorage.getItem(BROWSER_ID_KEY);
    if (!storedBrowserId) {
      storedBrowserId = `browser_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(BROWSER_ID_KEY, storedBrowserId);
    }
    setBrowserId(storedBrowserId);

    // Check if warning was dismissed today
    const dismissedDate = localStorage.getItem(BROWSER_WARNING_KEY);
    const today = new Date().toISOString().split('T')[0];
    
    if (dismissedDate !== today) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(BROWSER_WARNING_KEY, today);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-50 p-3"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-orange-800 flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Thể Lệ Chơi Cơ Bản - HIRELOGIC
                  </h3>
                  <div className="mt-2 text-sm text-orange-700 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">🎯</span>
                      <div>
                        <strong>Mục tiêu:</strong> Hoàn thành 100 bài toán thuật toán trong 20 ngày để nhận thưởng.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">📅</span>
                      <div>
                        <strong>Lịch trình:</strong> 5 bài mỗi ngày (3 Easy + 1 Medium + 1 Hard).
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">⭐</span>
                      <div>
                        <strong>Điểm số:</strong> Mỗi bài cần đạt tối thiểu 6/10 điểm để được tính hoàn thành.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">🏆</span>
                      <div>
                        <strong>Phần thưởng:</strong> Nhận thưởng giá trị sau khi hoàn thành thử thách.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">🤖</span>
                      <div>
                        <strong>AI Chấm điểm:</strong> Hệ thống AI sẽ tự động chấm và đánh giá code của bạn.
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
                    <p className="text-xs text-orange-800 font-medium">
                      💡 <strong>Mẹo:</strong> Đọc kỹ đề bài, test với nhiều cases, và viết code clean để đạt điểm cao!
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="p-2 hover:bg-yellow-200 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-5 h-5 text-orange-700" />
                </button>
              </div>

              <div className="mt-3 flex justify-end">
                <motion.button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Tôi đã hiểu
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
