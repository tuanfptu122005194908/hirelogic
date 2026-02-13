import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Users, TrendingUp } from 'lucide-react';

export const VisitCounter = () => {
  const [visitCount, setVisitCount] = useState(1000);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Lấy số lượt truy cập từ localStorage
    const storedCount = localStorage.getItem('hirelogic_visit_count');
    let currentCount = 1000;
    
    if (storedCount) {
      currentCount = parseInt(storedCount, 10);
    } else {
      // Lần đầu truy cập, set = 1000
      localStorage.setItem('hirelogic_visit_count', '1000');
    }
    
    // Tăng lên 1 cho mỗi lần truy cập mới
    const newCount = currentCount + 1;
    setVisitCount(newCount);
    localStorage.setItem('hirelogic_visit_count', newCount.toString());
    
    // Update footer counter
    const footerElement = document.getElementById('footer-visit-count');
    if (footerElement) {
      footerElement.textContent = newCount.toLocaleString('vi-VN');
    }
    
    // Trigger animation
    setTimeout(() => setIsAnimating(true), 100);
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 left-4 z-50"
    >
      <div className="bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-blue-600/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-2xl border border-white/20">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              scale: isAnimating ? [1, 1.2, 1] : 1,
              rotate: isAnimating ? [0, 10, -10, 0] : 0
            }}
            transition={{ 
              scale: { duration: 0.6 },
              rotate: { duration: 0.8 }
            }}
            className="relative"
          >
            <Eye className="w-5 h-5 text-white" />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-medium opacity-90">Lượt truy cập</span>
              <motion.div
                animate={{ scale: isAnimating ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                <TrendingUp className="w-3 h-3 text-green-300" />
              </motion.div>
            </div>
            <motion.span
              key={visitCount}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-white text-lg font-bold"
            >
              {formatNumber(visitCount)}
            </motion.span>
          </div>
        </div>
        
        {/* Animated particles */}
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-white/30 rounded-full animate-ping" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
      </div>
    </motion.div>
  );
};
