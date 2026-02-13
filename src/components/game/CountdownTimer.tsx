import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  deadline?: string; // ISO string with timezone
  className?: string;
}

export const CountdownTimer = ({ deadline, className = '' }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = deadline 
        ? new Date(deadline) 
        : (() => {
            const eod = new Date(now);
            eod.setHours(23, 59, 59, 999);
            return eod;
          })();
      
      const diff = endOfDay.getTime() - now.getTime();
      
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      setIsExpired(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds });
      setIsUrgent(hours < 2); // Urgent when less than 2 hours left
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [deadline]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  if (isExpired) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 ${className}`}
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-destructive/10 border-destructive/30 text-destructive">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-semibold">Đã hết hạn</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 ${className}`}
    >
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
        isUrgent 
          ? 'bg-destructive/10 border-destructive/30 text-destructive' 
          : 'bg-primary/10 border-primary/30 text-primary'
      }`}>
        {isUrgent ? (
          <AlertTriangle className="w-4 h-4" />
        ) : (
          <Clock className="w-4 h-4" />
        )}
        <span className="text-sm font-mono font-semibold">
          {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
        </span>
      </div>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        còn lại
      </span>
    </motion.div>
  );
};
