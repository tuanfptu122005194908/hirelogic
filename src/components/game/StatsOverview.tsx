import { motion } from 'framer-motion';
import { Trophy, Target, Clock, Flame, TrendingUp, Award, Zap, Code } from 'lucide-react';
import { GameProgress } from '@/types/game';

interface StatsOverviewProps {
  progress: GameProgress;
}

export const StatsOverview = ({ progress }: StatsOverviewProps) => {
  const totalProblems = progress.history?.length || 0;
  const averageScore = totalProblems > 0 
    ? (progress.history.reduce((sum, h) => sum + h.score, 0) / totalProblems).toFixed(1)
    : '0.0';
  const bestScore = totalProblems > 0 
    ? Math.max(...progress.history.map(h => h.score))
    : 0;
  const currentStreak = Math.floor((progress.xp || 0) / 50); // Approximate streak based on XP
  const totalXP = progress.xp || 0;

  const stats = [
    {
      icon: Trophy,
      label: 'Tổng bài đã làm',
      value: totalProblems,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50'
    },
    {
      icon: Target,
      label: 'Điểm trung bình',
      value: averageScore,
      color: 'from-blue-500 to-purple-500',
      bgColor: 'from-blue-50 to-purple-50'
    },
    {
      icon: Award,
      label: 'Điểm cao nhất',
      value: bestScore,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50'
    },
    {
      icon: Flame,
      label: 'Chuỗi ngày',
      value: `${currentStreak} ngày`,
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-50 to-pink-50'
    },
    {
      icon: Zap,
      label: 'Tổng XP',
      value: totalXP,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'from-purple-50 to-indigo-50'
    },
    {
      icon: Clock,
      label: 'Thời gian học',
      value: `${Math.floor(totalProblems * 45 / 60)}h ${totalProblems * 45 % 60}m`,
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'from-cyan-50 to-blue-50'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Thống Kê Hiệu Suất</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring"
              }}
              whileHover={{ 
                y: -5, 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${stat.bgColor} border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
            >
              {/* Background decoration */}
              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} rounded-full opacity-10 blur-2xl`} />
              
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-md`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </motion.div>
                
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-800 leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>

              {/* Shimmer effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: '100%' }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-3 overflow-hidden"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 relative"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((totalXP / 1000) * 100, 100)}%` }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </motion.div>
      
      <p className="text-center text-sm text-gray-600 mt-2 font-medium">
        Cần 1000 XP để đạt cấp độ tiếp theo
      </p>
    </motion.div>
  );
};
