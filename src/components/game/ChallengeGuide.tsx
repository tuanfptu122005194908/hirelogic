import { motion } from 'framer-motion';
import { 
  Trophy, Calendar, Target, Shield, Gift, CheckCircle, 
  AlertTriangle, Clock, Code2, Brain, Zap, ArrowRight,
  Star, Flame, Award
} from 'lucide-react';
import { CHALLENGE_RULES } from '@/types/challenge';

interface ChallengeGuideProps {
  onStartChallenge: () => void;
  onClose: () => void;
}

export const ChallengeGuide = ({ onStartChallenge, onClose }: ChallengeGuideProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-background via-background to-primary/5 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-primary/20"
      >
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-t-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20" />
          <div className="relative p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg"
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="gradient-text">Thử Thách 20 Ngày</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Hoàn thành để nhận thưởng{' '}
              <span className="text-primary font-bold text-2xl">{formatCurrency(CHALLENGE_RULES.reward)}</span>
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Rules Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-bold">Thể Lệ Chơi</h2>
            </div>

            <div className="grid gap-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card-strong rounded-2xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">20 Ngày Liên Tục</h3>
                    <p className="text-muted-foreground">
                      Bạn phải hoàn thành thử thách trong 20 ngày liên tục. 
                      Nghỉ 1 ngày = <span className="text-destructive font-medium">mất tiến độ</span>.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card-strong rounded-2xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-mint/20 flex items-center justify-center shrink-0">
                    <Code2 className="w-6 h-6 text-mint" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">5 Bài/Ngày</h3>
                    <p className="text-muted-foreground mb-3">Mỗi ngày bạn cần hoàn thành:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-green-500/20 text-green-700 rounded-full text-sm font-medium">
                        3 bài Easy
                      </span>
                      <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-700 rounded-full text-sm font-medium">
                        1 bài Medium
                      </span>
                      <span className="px-3 py-1.5 bg-red-500/20 text-red-700 rounded-full text-sm font-medium">
                        1 bài Hard
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card-strong rounded-2xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-peach/20 flex items-center justify-center shrink-0">
                    <Star className="w-6 h-6 text-peach" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Điểm Tối Thiểu: {CHALLENGE_RULES.minScoreToPass}/10</h3>
                    <p className="text-muted-foreground">
                      Mỗi bài phải đạt ít nhất {CHALLENGE_RULES.minScoreToPass}/10 điểm từ AI để được tính hoàn thành.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Anti-Cheat Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <h2 className="text-xl font-bold">Chống Gian Lận</h2>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <p className="text-foreground font-medium">
                    Hệ thống sẽ giám sát hoạt động của bạn khi code:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-destructive" />
                      <span>Theo dõi hành vi copy/paste (tối đa {CHALLENGE_RULES.maxPastePercentage}% code)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-destructive" />
                      <span>Ghi lại tốc độ gõ code để phát hiện bất thường</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-destructive" />
                      <span>Lưu lại timeline hoạt động của bạn</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-destructive" />
                      <span>Phát hiện copy code từ AI (ChatGPT, Copilot...)</span>
                    </li>
                  </ul>
                  <p className="text-destructive font-medium text-sm pt-2">
                    ⚠️ Vi phạm gian lận sẽ bị hủy kết quả và không được nhận thưởng!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reward Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold">Phần Thưởng</h2>
            </div>

            <motion.div 
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/20 via-primary/10 to-accent/20 p-6 border border-yellow-500/30"
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" />
              <div className="relative flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-yellow-600 mb-1">
                    {formatCurrency(CHALLENGE_RULES.reward)}
                  </p>
                  <p className="text-muted-foreground">
                    Chuyển khoản sau khi hoàn thành & xác minh
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-3xl font-bold text-primary">20</p>
              <p className="text-sm text-muted-foreground">Ngày</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-3xl font-bold text-accent">100</p>
              <p className="text-sm text-muted-foreground">Tổng bài</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-3xl font-bold text-mint">5</p>
              <p className="text-sm text-muted-foreground">Bài/ngày</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button
              onClick={onStartChallenge}
              className="flex-1 btn-primary text-white font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Flame className="w-6 h-6" />
              Bắt Đầu Thử Thách
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={onClose}
              className="btn-secondary py-4 px-8 rounded-2xl font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Để Sau
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
