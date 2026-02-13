import { motion } from 'framer-motion';
import { Code, Target, BookOpen, Trophy, Users, Settings, Zap, Clock, BarChart3, PlayCircle, RotateCcw } from 'lucide-react';

interface QuickActionsProps {
  onStartPractice: () => void;
  onSelectProblem: () => void;
  onViewProgress: () => void;
  onViewLeaderboard: () => void;
  onStartChallenge: () => void;
  hasApiKey: boolean;
  isAuthenticated: boolean;
  recentProblemId?: number;
}

export const QuickActions = ({ 
  onStartPractice, 
  onSelectProblem, 
  onViewProgress,
  onViewLeaderboard,
  onStartChallenge,
  hasApiKey,
  isAuthenticated,
  recentProblemId
}: QuickActionsProps) => {
  const actions = [
    {
      icon: PlayCircle,
      label: 'Luyện tập nhanh',
      description: 'Bài tập ngẫu nhiên',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      onClick: onStartPractice,
      disabled: !isAuthenticated || !hasApiKey,
      badge: isAuthenticated && hasApiKey ? '✓' : null
    },
    {
      icon: Target,
      label: 'Chọn bài tập',
      description: 'Danh sách đầy đủ',
      color: 'from-blue-500 to-purple-500',
      bgColor: 'from-blue-50 to-purple-50',
      onClick: onSelectProblem,
      disabled: !isAuthenticated
    },
    {
      icon: Trophy,
      label: 'Thử thách 20 ngày',
      description: 'Thưởng 200k',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50',
      onClick: onStartChallenge,
      disabled: !isAuthenticated || !hasApiKey,
      popular: true
    },
    {
      icon: BarChart3,
      label: 'Xem tiến độ',
      description: 'Thống kê chi tiết',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'from-purple-50 to-indigo-50',
      onClick: onViewProgress,
      disabled: !isAuthenticated
    },
    {
      icon: Users,
      label: 'Bảng xếp hạng',
      description: 'Top người chơi',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-50 to-rose-50',
      onClick: onViewLeaderboard,
      disabled: !isAuthenticated
    },
    {
      icon: RotateCcw,
      label: 'Làm lại gần nhất',
      description: 'Ôn tập kiến thức',
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'from-cyan-50 to-blue-50',
      onClick: () => {
        if (recentProblemId) {
          // Navigate to recent problem
          window.location.href = `#problem-${recentProblemId}`;
        } else {
          // Show message if no recent problem
          alert('Bạn chưa làm bài tập nào gần đây. Hãy bắt đầu với bài tập mới!');
        }
      },
      disabled: !isAuthenticated || !hasApiKey || !recentProblemId
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Hành Động Nhanh</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring"
              }}
              whileHover={{ 
                y: -3, 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={action.disabled ? undefined : action.onClick}
              disabled={action.disabled}
              className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${action.bgColor} border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 text-left ${
                action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'
              }`}
            >
              {/* Popular badge */}
              {action.popular && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10"
                >
                  🔥 HOT
                </motion.div>
              )}

              {/* Ready badge */}
              {action.badge && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                  className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-10"
                >
                  {action.badge}
                </motion.div>
              )}

              {/* Background decoration */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${action.color} rounded-full opacity-10 blur-2xl`} />
              
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-md ${
                    !action.disabled ? 'group-hover:shadow-lg' : ''
                  }`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-800 leading-tight">
                    {action.label}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {action.description}
                  </p>
                </div>

                {/* Disabled overlay */}
                {action.disabled && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔒</div>
                      <p className="text-xs text-gray-600 font-medium">
                        {!isAuthenticated ? 'Cần đăng nhập' : 'Cần API Key'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Shimmer effect on hover */}
              {!action.disabled && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
