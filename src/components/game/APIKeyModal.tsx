import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateApiKey } from '@/lib/aiService';
import { X, Key, ExternalLink, Loader2, CheckCircle, AlertCircle, Copy, Shield, Zap, Lock, Eye, EyeOff } from 'lucide-react';

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentKey?: string;
}

export const APIKeyModal = ({ isOpen, onClose, onSave, currentKey }: APIKeyModalProps) => {
  const [apiKey, setApiKey] = useState(currentKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const handleCopyExample = () => {
    const exampleKey = 'gsk_abcdefghijklmnopqrstuvwxyz123456';
    navigator.clipboard.writeText(exampleKey);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      setError('Vui lòng nhập API key');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const isValid = await validateApiKey(apiKey.trim());
      if (isValid) {
        setSuccess(true);
        setTimeout(() => {
          onSave(apiKey.trim());
          onClose();
        }, 1000);
      } else {
        setError('API key không hợp lệ. Vui lòng kiểm tra lại.');
      }
    } catch (err) {
      setError('Không thể xác thực API key. Vui lòng thử lại.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSkipValidation = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-4 left-4 right-4 
                       max-w-2xl mx-auto glass-card-strong rounded-2xl p-6 pointer-events-auto
                       overflow-y-auto max-h-[90vh] shadow-2xl border border-primary/20"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Key className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-1">Groq API Key</h2>
                <p className="text-sm text-muted-foreground">Bắt buộc để AI chấm điểm bài làm</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Miễn phí & An toàn</span>
                </div>
              </div>
            </div>

            {/* Detailed Instructions */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-5 mb-6 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-lg">Hướng dẫn lấy API Key (5 phút)</h3>
              </div>
              
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Truy cập Groq Console</h4>
                    <p className="text-sm text-muted-foreground mb-2">Mở trình duyệt và truy cập vào trang quản lý API của Groq</p>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Mở Groq Console
                    </a>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Đăng ký hoặc đăng nhập</h4>
                    <p className="text-sm text-muted-foreground">Sử dụng email hoặc tài khoản Google/GitHub để đăng nhập. Hoàn toàn miễn phí!</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Tạo API Key mới</h4>
                    <p className="text-sm text-muted-foreground mb-2">Trong dashboard, tìm mục "API Keys" → "Create Key" → Đặt tên key → "Create Key"</p>
                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">💡 Key sẽ có dạng:</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-background px-2 py-1 rounded border font-mono flex-1">gsk_abcdefghijklmnopqrstuvwxyz123456</code>
                        <button
                          onClick={handleCopyExample}
                          className="p-1.5 hover:bg-muted rounded transition-colors"
                          title="Copy example"
                        >
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                      {copiedText && (
                        <p className="text-xs text-mint mt-1">✅ Đã copy ví dụ!</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Copy và dán vào bên dưới</h4>
                    <p className="text-sm text-muted-foreground">Copy key vừa tạo và dán vào ô nhập liệu. Key chỉ hiển thị một lần!</p>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Lưu ý quan trọng:</p>
                    <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                      <li>• API Key chỉ hiển thị 1 lần sau khi tạo. Hãy lưu lại ngay!</li>
                      <li>• Không chia sẻ key với người khác để bảo vệ tài khoản</li>
                      <li>• Key được lưu an toàn trên trình duyệt của bạn</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  API Key của bạn
                </label>
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showApiKey ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setError(null);
                    setSuccess(false);
                  }}
                  placeholder="gsk_abcdefghijklmnopqrstuvwxyz123456"
                  className="w-full px-4 py-4 pr-12 bg-muted/50 rounded-xl border-2 border-border 
                           focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none
                           font-mono text-sm transition-all"
                />
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => setApiKey('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Key được mã hóa và lưu an toàn trên trình duyệt của bạn
              </p>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-destructive text-sm mb-4"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            {/* Success message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-mint text-sm mb-4"
              >
                <CheckCircle className="w-4 h-4" />
                API key hợp lệ! Đang lưu...
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSubmit}
                disabled={isValidating || !apiKey.trim()}
                className="w-full btn-primary text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 text-base shadow-lg"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xác thực API Key...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Xác thực & Lưu API Key
                  </>
                )}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleSkipValidation}
                  disabled={!apiKey.trim()}
                  className="flex-1 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 py-2"
                >
                  Bỏ qua xác thực
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Để sau
                </button>
              </div>
            </div>

            {/* Privacy & Security Note */}
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 text-sm mb-1">🔒 Bảo mật & Quyền riêng tư</h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• API Key được lưu cục bộ trên trình duyệt của bạn</li>
                    <li>• Chỉ được gửi đến server Groq để chấm điểm</li>
                    <li>• Không chia sẻ với bên thứ ba nào khác</li>
                    <li>• Bạn có thể xóa key bất cứ lúc nào</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
