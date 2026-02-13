import { motion } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';

export const StudentProblems = () => {
  const problems = [
    "Khó tư duy thuật toán",
    "Không biết bắt đầu từ đâu", 
    "Học thuộc lời giải",
    "Thiếu động lực luyện tập"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#FDF2F6] to-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Problems List */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {problems.map((problem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="text-gray-700 font-medium">{problem}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 p-6 bg-gradient-to-r from-[#F4A6B8]/20 to-[#F4A6B8]/10 rounded-xl border border-[#F4A6B8]/30"
            >
              <ArrowRight className="w-6 h-6 text-[#F4A6B8] flex-shrink-0" />
              <p className="text-[#333] font-semibold text-lg">
                HireLogic được xây dựng để giải quyết trực tiếp những vấn đề này.
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column - Illustration */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-[#FFF5F8] to-[#FDF2F6] p-8 rounded-2xl shadow-xl">
              {/* Simple illustration using CSS */}
              <div className="space-y-6">
                {/* Student silhouette */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-[#F4A6B8]/30 rounded-full mx-auto mb-4"></div>
                    <div className="w-32 h-40 bg-[#F4A6B8]/20 rounded-lg mx-auto"></div>
                    
                    {/* Question marks around student */}
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-4 -left-8 text-4xl text-[#F4A6B8]/60"
                    >
                      ?
                    </motion.div>
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="absolute -top-2 -right-8 text-3xl text-[#F4A6B8]/50"
                    >
                      ?
                    </motion.div>
                    <motion.div
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                      className="absolute top-8 -right-12 text-2xl text-[#F4A6B8]/40"
                    >
                      ?
                    </motion.div>
                  </div>
                </div>

                {/* Code blocks with errors */}
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-red-600 text-sm font-mono">
                      <div className="w-20 h-2 bg-red-300 rounded mb-2"></div>
                      <div className="w-32 h-2 bg-red-200 rounded mb-2"></div>
                      <div className="w-16 h-2 bg-red-300 rounded"></div>
                    </div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="text-orange-600 text-sm font-mono">
                      <div className="w-24 h-2 bg-orange-300 rounded mb-2"></div>
                      <div className="w-28 h-2 bg-orange-200 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Frustration indicator */}
                <div className="flex justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-center"
                  >
                    <div className="text-6xl mb-2">😔</div>
                    <p className="text-gray-600 text-sm">Mắc kẹt trong thuật toán?</p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Floating decoration */}
            <motion.div
              animate={{ y: [-15, 15, -15] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-6 -right-6 w-20 h-20 bg-[#F4A6B8]/20 rounded-full backdrop-blur-sm"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
