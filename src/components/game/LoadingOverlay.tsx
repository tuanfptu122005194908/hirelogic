import { motion } from 'framer-motion';
import { Brain, Sparkles, Code2, CheckCircle } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay = ({ isVisible }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  const loadingSteps = [
    { icon: Code2, text: 'Đang phân tích code...', delay: 0 },
    { icon: Brain, text: 'AI đang đánh giá...', delay: 1.5 },
    { icon: Sparkles, text: 'Tạo feedback chi tiết...', delay: 3 },
    { icon: CheckCircle, text: 'Hoàn tất!', delay: 4.5 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl"
    >
      <div className="text-center p-8 max-w-md">
        {/* Main Loading Animation */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Middle ring */}
          <motion.div
            className="absolute inset-2 rounded-full border-4 border-transparent border-t-secondary border-r-secondary"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Inner ring */}
          <motion.div
            className="absolute inset-4 rounded-full border-4 border-transparent border-b-accent border-l-accent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Center icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-button flex items-center justify-center shadow-glow">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [0, Math.cos(i * 60 * Math.PI / 180) * 60, 0],
                y: [0, Math.sin(i * 60 * Math.PI / 180) * 60, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Loading Steps */}
        <div className="space-y-3">
          {loadingSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay, duration: 0.5 }}
              className="flex items-center gap-3 justify-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5] 
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: step.delay 
                }}
              >
                <step.icon className="w-5 h-5 text-primary" />
              </motion.div>
              <span className="text-foreground font-medium">{step.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Skeleton Cards Preview */}
        <div className="mt-8 space-y-3">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="h-4 rounded-full bg-gradient-to-r from-muted via-primary/10 to-muted"
              style={{ width: `${100 - i * 20}%`, marginLeft: 'auto', marginRight: 'auto' }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Progress hint */}
        <motion.p
          className="mt-6 text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Đang xử lý, vui lòng chờ...
        </motion.p>
      </div>
    </motion.div>
  );
};