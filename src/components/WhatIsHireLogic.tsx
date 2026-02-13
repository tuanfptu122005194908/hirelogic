import { motion } from 'framer-motion';
import { Brain, Puzzle, Bot } from 'lucide-react';

export const WhatIsHireLogic = () => {
  const features = [
    {
      icon: Brain,
      title: "Tư duy như nhà tuyển dụng",
      description: "Phân tích bài toán, chọn giải pháp phù hợp thay vì học thuộc lời giải."
    },
    {
      icon: Puzzle,
      title: "Lộ trình rõ ràng",
      description: "Bài tập từ cơ bản đến nâng cao, không bị học lan man."
    },
    {
      icon: Bot,
      title: "Phản hồi bằng AI",
      description: "Góp ý logic, cách trình bày và hướng tối ưu."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-[#333] mb-4">
            HireLogic giúp bạn học thuật toán đúng cách
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#FFF5F8] to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-[#F4A6B8]/20"
            >
              <div className="w-16 h-16 bg-[#F4A6B8] rounded-full flex items-center justify-center mb-6 mx-auto">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-[#333] mb-4 text-center">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 text-center leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
