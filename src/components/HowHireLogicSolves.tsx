import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, TrendingUp, Trophy, ArrowRight, Sparkles, Zap, Target } from 'lucide-react';

export const HowHireLogicSolves = () => {
  const steps = [
    {
      icon: BookOpen,
      title: "Luyện bài theo cấp độ",
      description: "Bắt đầu từ bài tập cơ bản, tiến dần đến các vấn đề phức tạp theo lộ trình được thiết kế chuyên biệt.",
      features: ["Bài tập từ dễ đến khó", "Lộ trình cá nhân hóa", "Cơ cấu kiến thức vững chắc"]
    },
    {
      icon: CheckCircle,
      title: "Chấm điểm & phản hồi AI",
      description: "Nhận điểm số chi tiết và góp ý từ AI về logic, cách trình bày và hướng tối ưu hóa.",
      features: ["AI chấm điểm 24/7", "Phản hồi chi tiết", "Gợi ý cải thiện"]
    },
    {
      icon: TrendingUp,
      title: "Theo dõi tiến độ",
      description: "Xem thống kê học tập, nhận badge thành tích và theo dõi sự cải thiện qua thời gian.",
      features: ["Thống kê trực quan", "Hệ thống badge", "Đồ thị tiến độ"]
    },
    {
      icon: Trophy,
      title: "Thử thách & leaderboard",
      description: "Tham gia thử thách 20 ngày, cạnh tranh với bạn bè và nhận phần thưởng thực tế.",
      features: ["Thử thách 20 ngày", "Phần thưởng hấp dẫn", "Bảng xếp hạng"]
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5F8] via-white to-[#FDF2F6]" />
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-[#F4A6B8]/20 rounded-full filter blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#F4A6B8]/15 rounded-full filter blur-3xl"
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F4A6B8]/10 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#F4A6B8]" />
            <span className="text-sm font-medium text-[#F4A6B8]">Quy trình chuyên nghiệp</span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold text-[#333] mb-6 leading-tight">
            HireLogic giải quyết
            <motion.span 
              className="block bg-gradient-to-r from-[#F4A6B8] to-[#F095A8] bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ 
                backgroundSize: '200% 200%',
              }}
            >
              như thế nào?
            </motion.span>
          </h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Quy trình 4 bước giúp bạn thành thạo thuật toán và sẵn sàng cho phỏng vấn kỹ thuật
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#F4A6B8]/20 to-[#F095A8]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
              />
              
              {/* Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#F4A6B8]/10"
              >
                {/* Number Badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                  viewport={{ once: true }}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-[#F4A6B8] to-[#F095A8] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                >
                  {index + 1}
                </motion.div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
                  viewport={{ once: true }}
                  className="w-16 h-16 bg-gradient-to-br from-[#F4A6B8]/20 to-[#F095A8]/20 rounded-2xl flex items-center justify-center mb-6"
                >
                  <step.icon className="w-8 h-8 text-[#F4A6B8]" />
                </motion.div>
                
                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-bold text-[#333] mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {step.description}
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-3">
                    {step.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.2 + 0.6 + featureIndex * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3"
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: featureIndex * 0.2 }}
                          className="w-2 h-2 bg-[#F4A6B8] rounded-full"
                        />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-[#F4A6B8] to-[#F095A8] text-white rounded-full shadow-2xl cursor-pointer"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Trophy className="w-6 h-6" />
            </motion.div>
            <span className="font-bold text-lg">Sẵn sàng bắt đầu hành trình thuật toán?</span>
            <ArrowRight className="w-5 h-5" />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            viewport={{ once: true }}
            className="mt-6 text-gray-600"
          >
            Tham gia ngay hôm nay để trải nghiệm quy trình học tập hiệu quả
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};
