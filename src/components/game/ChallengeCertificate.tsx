import { motion } from 'framer-motion';
import { Trophy, Award, Calendar, CheckCircle, Download, Share2, Star } from 'lucide-react';
import { ChallengeProgress, CHALLENGE_RULES } from '@/types/challenge';

interface ChallengeCertificateProps {
  progress: ChallengeProgress;
  userName?: string;
}

export const ChallengeCertificate = ({ progress, userName = "Học viên" }: ChallengeCertificateProps) => {
  const completionDate = progress.dailyChallenges[progress.dailyChallenges.length - 1]?.date 
    || new Date().toISOString().split('T')[0];
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Generate unique certificate ID based on progress
  const certificateId = `TLI-${progress.startDate?.replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return (
    <div id="challenge-certificate" className="p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-2xl mx-auto bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400"
      >
        {/* Decorative Border */}
        <div className="absolute inset-2 border-2 border-amber-300 rounded-2xl pointer-events-none" />
        <div className="absolute inset-4 border border-amber-200 rounded-xl pointer-events-none" />

        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-amber-400/30 to-transparent" />
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-400/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-400/30 to-transparent" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-amber-400/30 to-transparent" />

        <div className="relative p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg mb-4"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-amber-800 mb-2">
              CHỨNG NHẬN HOÀN THÀNH
            </h1>
            <div className="flex items-center justify-center gap-2 text-amber-600">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="text-sm font-medium">Think Like an Interviewer</span>
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">Chứng nhận rằng</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 py-2 border-b-2 border-amber-300 inline-block px-8">
              {userName}
            </h2>
            <p className="text-gray-600 mt-4 leading-relaxed max-w-md mx-auto">
              Đã hoàn thành xuất sắc <strong className="text-amber-700">Thử Thách 20 Ngày</strong> luyện thuật toán theo góc nhìn nhà tuyển dụng
            </p>
          </div>

          {/* Achievement Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-amber-100/50 rounded-xl">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-amber-700">{CHALLENGE_RULES.totalDays}</p>
              <p className="text-xs text-gray-600">Ngày liên tục</p>
            </div>
            <div className="text-center p-4 bg-amber-100/50 rounded-xl">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-amber-700">100</p>
              <p className="text-xs text-gray-600">Bài hoàn thành</p>
            </div>
            <div className="text-center p-4 bg-amber-100/50 rounded-xl">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <p className="text-lg font-bold text-amber-700">{formatCurrency(CHALLENGE_RULES.reward)}</p>
              <p className="text-xs text-gray-600">Phần thưởng</p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex justify-between items-center text-sm text-gray-600 mb-6 px-4">
            <div>
              <p className="font-medium">Ngày bắt đầu</p>
              <p className="text-amber-700">{progress.startDate ? formatDate(progress.startDate) : '-'}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full border-4 border-amber-400 flex items-center justify-center bg-white shadow-inner">
                <Award className="w-8 h-8 text-amber-500" />
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">Ngày hoàn thành</p>
              <p className="text-amber-700">{formatDate(completionDate)}</p>
            </div>
          </div>

          {/* Certificate ID & Signature */}
          <div className="border-t-2 border-amber-200 pt-6 mt-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-500 mb-1">Mã chứng chỉ</p>
                <p className="font-mono text-sm text-amber-700 font-bold">{certificateId}</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-12 mb-1 flex items-end justify-center">
                  <span className="text-2xl font-script text-amber-700 italic">TWO</span>
                </div>
                <div className="border-t border-gray-400 pt-1">
                  <p className="text-xs text-gray-600">Ban tổ chức</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Ngày cấp</p>
                <p className="text-sm text-gray-700">{formatDate(new Date().toISOString())}</p>
              </div>
            </div>
          </div>

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <Trophy className="w-64 h-64 text-amber-900" />
          </div>
        </div>

        {/* Footer Badge */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-3 px-6 text-center">
          <p className="text-white text-sm font-medium">
            🎉 Together We Overcome - Chúc mừng bạn đã vượt qua thử thách! 🎉
          </p>
        </div>
      </motion.div>

      {/* Instructions */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          📸 Chụp màn hình chứng chỉ này làm bằng chứng để nhận thưởng
        </p>
        <div className="flex justify-center gap-3">
          <motion.button
            onClick={() => {
              const element = document.getElementById('challenge-certificate');
              if (element) {
                // Scroll to certificate
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Show toast instruction
                alert('Nhấn Ctrl+Shift+S (hoặc Cmd+Shift+4 trên Mac) để chụp màn hình vùng chọn');
              }
            }}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            Hướng dẫn chụp
          </motion.button>
        </div>
      </div>
    </div>
  );
};
