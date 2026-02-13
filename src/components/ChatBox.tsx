import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Loader2, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatWithAI } from '@/lib/chatService';
import { loadProgress } from '@/lib/gameStore';
import { CodeHighlight } from '@/components/game/CodeHighlight';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useGameState } from '@/contexts/GameStateContext';
import { useLocation } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBoxProps {
  className?: string;
}

export const ChatBox = ({ className }: ChatBoxProps) => {
  const { gameState } = useGameState();
  const location = useLocation();
  
  // Chỉ hiển thị chatbot trên trang chủ (Index)
  const isOnIndexPage = location.pathname === '/';
  
  // Chỉ hiển thị chatbot khi:
  // - Đang ở trang Index
  // - Chưa tham gia làm bài (screen === 'start' hoặc null)
  // - Sau khi làm xong 1 bài (screen === 'result')
  // - Xem progress (screen === 'progress')
  // - Xem danh sách bài (screen === 'problemList')
  // Ẩn khi đang làm bài để tránh gian lận:
  // - screen === 'problem' (đang xem đề bài, có thể bắt đầu làm)
  // - screen === 'solving' (đang làm bài)
  const shouldShowChat = isOnIndexPage && (
    !gameState || 
    gameState.screen === 'start' || 
    gameState.screen === 'result' || 
    gameState.screen === 'progress' || 
    gameState.screen === 'problemList'
  );
  
  // Nếu đang ở problem hoặc solving screen, đóng chat nếu đang mở
  useEffect(() => {
    if (gameState && (gameState.screen === 'problem' || gameState.screen === 'solving')) {
      setIsOpen(false);
    }
  }, [gameState]);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const initialMessage: Message = {
    id: '1',
    text: '## Chào mừng đến với Trợ Lý Thuật Toán!\n\nTôi có thể giúp bạn:\n\n### 1. Giải thích bài toán\n- Hỏi về bất kỳ bài toán nào (ví dụ: "Giải thích bài 1" hoặc "Two Sum")\n- Tôi sẽ giải thích chi tiết từ cơ bản đến nâng cao\n\n### 2. Hướng dẫn code\n- Code examples đầy đủ với comment\n- Nhiều cách giải và so sánh\n\n### 3. Phân tích thuật toán\n- Độ phức tạp (Time/Space Complexity)\n- Edge cases và cách xử lý\n\n### 4. Kiến thức tổng quát\n- Các kỹ thuật: Two Pointers, Sliding Window, DP, Backtracking...\n- Code patterns và best practices\n\n**Bạn muốn hỏi về bài toán nào?**',
    sender: 'bot',
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const question = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Đang suy nghĩ...',
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Get API key from progress
      const progress = loadProgress();
      const apiKey = progress.apiKey || null;

      // Get conversation history (last 10 messages for context)
      const conversationHistory = messages
        .slice(-10)
        .map((msg) => ({
          role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: msg.text,
        }));

      // Call AI chat service
      const response = await chatWithAI(apiKey, conversationHistory, question);

      // Remove loading message and add response
      setMessages((prev) => {
        const withoutLoading = prev.filter((msg) => msg.id !== loadingMessage.id);
        return [
          ...withoutLoading,
          {
            id: Date.now().toString(),
            text: response || 'Xin lỗi, không nhận được phản hồi từ AI.',
            sender: 'bot',
            timestamp: new Date(),
          },
        ];
      });
    } catch (error) {
      console.error('Chat error:', error);
      // Remove loading message and add error message
      setMessages((prev) => {
        const withoutLoading = prev.filter((msg) => msg.id !== loadingMessage.id);
        return [
          ...withoutLoading,
          {
            id: Date.now().toString(),
            text: error instanceof Error ? `Lỗi: ${error.message}` : 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
            sender: 'bot',
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
      setMessages([initialMessage]);
    }
  };

  // Use MarkdownRenderer for better formatting
  const renderMessageContent = (text: string) => {
    return <MarkdownRenderer content={text} />;
  };

  // Nếu không được phép hiển thị, đóng chat và return null
  if (!shouldShowChat) {
    return null;
  }

  return (
    <div className={cn('fixed bottom-6 right-6 z-[100]', className)}>
      {isOpen ? (
        <Card
          className={cn(
            'flex flex-col shadow-2xl transition-all duration-500 border-2 relative overflow-hidden',
            'bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50',
            'border-blue-300/40 backdrop-blur-xl',
            'ring-2 ring-blue-400/20 hover:ring-blue-400/40',
            'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-blue-500/10 before:to-transparent before:animate-pulse before:pointer-events-none',
            isExpanded
              ? 'fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none border-0 z-[9999]'
              : 'w-[520px] h-[650px] max-h-[75vh]'
          )}
          style={{
            boxShadow: '0 25px 70px rgba(59, 130, 246, 0.3), 0 0 50px rgba(147, 51, 234, 0.2), 0 0 0 4px rgba(59, 130, 246, 0.1)',
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-blue-200/30 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="text-2xl relative"
              >
                🤖
                {/* Enhanced Online Indicator */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full border-2 border-white shadow-lg"
                >
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1], scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-full h-full bg-gradient-to-r from-green-300 to-green-500 rounded-full"
                  />
                </motion.div>
              </motion.div>
              <div>
                <div className="text-sm flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                    HIRELOGIC AI
                  </span>
                  <motion.span
                    animate={{ opacity: [1, 0.7, 1], scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 border border-green-500/30 backdrop-blur-sm"
                  >
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                    Online
                  </motion.span>
                </div>
                <div className="text-xs text-gray-600 font-medium">Hỏi về thuật toán!</div>
              </div>
            </CardTitle>
            <div className="flex gap-1">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  className="h-7 w-7 hover:bg-red-100 hover:text-red-600 text-gray-600 hover:text-red-600 transition-all duration-200"
                  title="Xóa lịch sử chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-7 w-7 hover:bg-blue-100 hover:text-blue-600 text-gray-600 hover:text-blue-600 transition-all duration-200"
                  title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
                >
                  {isExpanded ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-7 w-7 hover:bg-blue-100 hover:text-blue-600 text-gray-600 hover:text-blue-600 transition-all duration-200"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-gradient-to-b from-white/90 to-blue-50/90">
            <ScrollArea className="flex-1 px-3 py-3">
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={cn(
                      'flex',
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm border',
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-400/30 shadow-blue-500/25'
                          : 'bg-white text-gray-800 border-gray-200 shadow-gray-300/20'
                      )}
                    >
                      <div className="text-sm space-y-2 leading-relaxed">
                        {renderMessageContent(message.text)}
                      </div>
                      <p
                        className={cn(
                          'text-xs mt-2 font-medium',
                          message.sender === 'user'
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        )}
                      >
                        {message.timestamp.toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="border-t border-gray-200 p-3 bg-gradient-to-r from-white/95 via-blue-50/95 to-white/95 backdrop-blur-xl">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Hỏi về thuật toán..."
                    className="flex-1 h-10 text-sm border-2 border-gray-300 focus:border-blue-500 transition-all duration-300 bg-white text-gray-800 placeholder-gray-500 backdrop-blur-sm rounded-lg"
                  />
                  {/* Animated Input Border */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    disabled={!inputValue.trim() || isLoading}
                    className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-4 w-4 text-white" />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Send className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className={cn(
              'rounded-full h-20 w-20 shadow-2xl relative overflow-hidden',
              'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600',
              'hover:from-purple-500 hover:via-pink-500 hover:to-purple-500',
              'border-4 border-white/90',
              'transition-all duration-500'
            )}
            style={{
              boxShadow: '0 15px 50px rgba(147, 51, 234, 0.8), 0 0 40px rgba(147, 51, 234, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.3)',
            }}
          >
            {/* Button Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 hover:opacity-40 transition-opacity duration-500"></div>
            
            {/* Icon */}
            <motion.div
              animate={{ 
                y: [0, -3, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MessageCircle className="h-9 w-9 text-white drop-shadow-lg" />
            </motion.div>
            
            {/* Notification Badges */}
            <motion.div
              className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full border-2 border-white shadow-lg"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-full h-full bg-gradient-to-r from-red-400 to-orange-400 rounded-full"
              />
            </motion.div>
            
            {/* Enhanced Pulse Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/60"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Additional Glow Effect */}
            <motion.div
              className="absolute -inset-2 rounded-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 blur-lg"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </Button>
        </motion.div>
      )}
    </div>
  );
};
