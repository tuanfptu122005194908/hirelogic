import { motion } from 'framer-motion';
import { Clock, Trophy, Target, Code, Zap, Star, TrendingUp } from 'lucide-react';
import { GameProgress, HistoryEntry } from '@/types/game';

interface RecentActivitiesProps {
  progress: GameProgress;
}

export const RecentActivities = ({ progress }: RecentActivitiesProps) => {
  const recentHistory = (progress.history || [])
    .slice(-5)
    .reverse();

  const getActivityIcon = (score: number) => {
    if (score >= 9) return { icon: Trophy, color: 'from-yellow-500 to-orange-500', label: 'Xuất sắc' };
    if (score >= 7) return { icon: Star, color: 'from-blue-500 to-purple-500', label: 'Tốt' };
    if (score >= 5) return { icon: Target, color: 'from-green-500 to-emerald-500', label: 'Khá' };
    return { icon: Code, color: 'from-gray-500 to-gray-600', label: 'Cần cải thiện' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} ngày trước`;
    if (diffHours > 0) return `${diffHours} giờ trước`;
    return 'Vừa xong';
  };

  if (recentHistory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200"
      >
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-600 mb-2">Chưa có hoạt động nào</h3>
        <p className="text-gray-500">Bắt đầu luyện tập để xem hoạt động gần đây của bạn!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Hoạt Động Gần Đây</h2>
      </div>

      <div className="space-y-4">
        {recentHistory.map((entry, index) => {
          const activityInfo = getActivityIcon(entry.score);
          const Icon = activityInfo.icon;
          
          return (
            <motion.div
              key={`${entry.problemId}-${entry.date}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.1 * index,
                type: "spring"
              }}
              whileHover={{ x: 5 }}
              className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activityInfo.color} flex items-center justify-center shadow-md flex-shrink-0`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-800 truncate">
                      Bài #{entry.problemId}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${activityInfo.color} text-white`}>
                      {activityInfo.label}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {entry.mode === 'practice' ? 'Luyện tập' : 'Phỏng vấn'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">{entry.score}/10 điểm</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(entry.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Score indicator */}
                <motion.div
                  className="flex-shrink-0"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activityInfo.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg">{entry.score}</span>
                  </div>
                </motion.div>
              </div>

              {/* Progress bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${entry.score * 10}%` }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden"
              >
                <motion.div
                  className={`h-full bg-gradient-to-r ${activityInfo.color} relative`}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* View all button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 + recentHistory.length * 0.1 }}
        className="text-center mt-6"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl font-medium text-gray-700 transition-all duration-300"
        >
          Xem tất cả hoạt động
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
