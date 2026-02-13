import { Problem } from '@/types/game';
import { getAllProblems, getProblemById } from '@/data/problems';
import { generateProblemsKnowledge } from '@/lib/problemsKnowledge';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Generate problems knowledge (cached)
let problemsKnowledgeCache: string | null = null;
const getProblemsKnowledge = (): string => {
  if (!problemsKnowledgeCache) {
    problemsKnowledgeCache = generateProblemsKnowledge();
  }
  return problemsKnowledgeCache;
};

const WEBSITE_KNOWLEDGE = `
BẠN LÀ TRỢ LÝ ẢO CHO TRANG WEB LUYỆN THUẬT TOÁN "Think Interviewer"

THÔNG TIN VỀ TRANG WEB:

1. TỔNG QUAN:
- Trang web luyện thuật toán với 100+ bài toán từ Easy đến Hard
- Hệ thống chấm điểm tự động bằng AI (Groq API)
- Có 2 chế độ: Practice (luyện tập) và Interview (phỏng vấn)
- Hệ thống XP, Rank, và Badges để theo dõi tiến độ

2. HỆ THỐNG BÀI TOÁN:
- 100 bài toán được phân loại theo:
  * Level: 1-10 (từ cơ bản đến nâng cao)
  * Difficulty: Easy, Medium, Hard
  * Skills: Array, String, Hash Table, Stack, Linked List, Binary Search, Tree, Graph, Dynamic Programming, Backtracking, v.v.
- Mỗi bài có: title, story, description, examples, hints, interview questions, test cases, theory questions

3. HỆ THỐNG XP VÀ RANK:
- XP (Experience Points): Điểm kinh nghiệm tích lũy
- Rank: Intern → Junior → Middle → Senior → Lead → Architect → CTO
- Cách tính XP:
  * Score >= 9: 80 XP (Practice) hoặc 120 XP (Interview)
  * Score >= 7: 50 XP (Practice) hoặc 75 XP (Interview)
  * Score >= 5: 30 XP (Practice) hoặc 45 XP (Interview)
  * Score < 5: Score × 5 XP
- Level = floor(XP / 50) + 1

4. BADGES (Huy hiệu):
- First Blood: Hoàn thành bài đầu tiên
- Interview Ready: Đạt >= 9 điểm trong chế độ Interview
- Logic Thinker: Đạt >= 8 điểm 3 lần
- Quick Thinker: Hoàn thành Interview trong < 10 phút với score >= 7
- Streak Master: Làm liên tiếp 5 bài

5. THỬ THÁCH 20 NGÀY:
- Thử thách kéo dài 20 ngày
- Mỗi ngày cần hoàn thành:
  * 3 bài Easy
  * 1 bài Medium
  * 1 bài Hard
- Điều kiện:
  * Phải đạt >= 6 điểm mới được tính là hoàn thành
  * Phải hoàn thành trong ngày, không được bỏ lỡ
  * Nếu bỏ lỡ 1 ngày → thử thách thất bại
- Phần thưởng: 200,000 VND cho người hoàn thành
- Cần đăng nhập để tham gia

6. CHẤM ĐIỂM AI:
- Sử dụng Groq API (Llama 3.3 70B)
- Cần Groq API Key để chấm điểm
- Tiêu chí chấm:
  * Understanding (0-2): Hiểu đúng yêu cầu
  * Approach (0-2): Phương pháp giải quyết
  * Code Logic (0-2): Logic code đúng
  * Code Style (0-1): Code sạch, dễ đọc
  * Edge Cases (0-1): Xử lý trường hợp đặc biệt
  * Complexity (0-1): Độ phức tạp tối ưu
  * Creativity (0-1): Cách giải sáng tạo
- Tổng điểm: 0-10

7. TÍNH NĂNG:
- Practice Mode: Luyện tập tự do, chọn bài bất kỳ
- Interview Mode: Mô phỏng phỏng vấn thực tế
- Problem List: Xem danh sách tất cả bài toán
- Progress: Xem lịch sử làm bài, XP, badges
- Leaderboard: Bảng xếp hạng người dùng
- Challenge Dashboard: Theo dõi tiến độ thử thách 20 ngày

8. CÁCH SỬ DỤNG:
- Bước 1: Nhập Groq API Key (cần để chấm điểm)
- Bước 2: Chọn bài toán hoặc bắt đầu Practice/Interview
- Bước 3: Đọc đề bài, suy nghĩ, viết code
- Bước 4: Submit để được AI chấm điểm
- Bước 5: Xem feedback và cải thiện

9. NHÀ PHÁT HÀNH - NHÓM TWO:
- Tên nhóm: TWO
- Ý nghĩa: Together We Overcome (Cùng nhau vượt qua)
- Slogan: "Làm tới cùng không lùi bước"
- Các thành viên:
  * Nguyễn Lan Phương - Quê: Lào Cai - Sở thích: Thể thao, chơi game, thích ăn mỳ cay
  * Cao Thanh Tuấn - Quê: Vĩnh Phúc - Sở thích: Ăn uống - Vai trò: Leader của nhóm TWO
  * Đỗ Hoàng Duy - Quê: Vĩnh Phúc - Sở thích: Thể thao (đặc biệt bóng đá), thích ăn những món liên quan đến bò
  * Trịnh Văn Lực - Sở thích: Chơi game và thể thao
  * Vũ Viết Trọng Duy - Quê: Lào Cai - Sở thích: Nấu ăn và đánh cầu
  * Nguyễn Văn Tấn - Quê: Hưng Yên - Sở thích: Chơi bóng đá và bi-a
  * Tạ Dương Huy Hoàng - Quê: Hà Nội - Sở thích: Chơi game và nghe nhạc

10. LƯU Ý:
- API Key được lưu local, không gửi lên server
- Cần đăng nhập để tham gia Challenge và xem Leaderboard
- Challenge có giới hạn copy/paste (max 30% code)
- Có hệ thống phát hiện hành vi đáng ngờ (suspicious activity)
`;

// Helper to find problem by ID or title in user message
const findProblemInMessage = (message: string): { id: number; problem: Problem } | null => {
  // Try to find problem ID
  const idMatch = message.match(/\b(bài\s*)?(\d{1,3})\b/i);
  if (idMatch) {
    const id = parseInt(idMatch[2]);
    const problem = getProblemById(id);
    if (problem) return { id, problem };
  }
  
  // Try to find by title (check first 50 problems for performance)
  const problems = getAllProblems().slice(0, 50);
  for (const problem of problems) {
    if (message.toLowerCase().includes(problem.title.toLowerCase())) {
      return { id: problem.id, problem };
    }
  }
  
  return null;
};

export const chatWithAI = async (
  apiKey: string | null,
  messages: ChatMessage[],
  userMessage: string
): Promise<string> => {
  // Check if user is asking about a specific problem
  const foundProblem = findProblemInMessage(userMessage);
  let problemContext: {
    title: string;
    description: string;
    skill: string;
    difficulty: string;
    examples: { input: string; output: string; explanation?: string }[];
    hints: string[];
  } | null = null;
  
  if (foundProblem) {
    const p = foundProblem.problem;
    problemContext = {
      title: p.title,
      description: p.description,
      skill: p.skill,
      difficulty: p.difficulty,
      examples: p.examples,
      hints: p.hints,
    };
  }

  // Try to use Supabase Edge Function first (if available)
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const supabaseClient = supabase;
    
    // Prepare messages for API
    const apiMessages = [
      ...messages,
      { role: 'user' as const, content: userMessage },
    ];

    const { data, error } = await supabaseClient.functions.invoke('chat-algorithm', {
      body: {
        messages: apiMessages,
        problemContext,
      },
    });

    if (!error && data) {
      // Handle streaming response
      if (data instanceof ReadableStream || (data && typeof data.getReader === 'function')) {
        const reader = (data as ReadableStream).getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.choices?.[0]?.delta?.content) {
                  fullResponse += parsed.choices[0].delta.content;
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }

        return fullResponse || 'Xin lỗi, không nhận được phản hồi từ AI.';
      }

      // Handle non-streaming response
      if (typeof data === 'string') {
        return data;
      }

      if (data && typeof data === 'object' && 'error' in data) {
        throw new Error((data as { error: string }).error);
      }
    }

    if (error) {
      console.log('Edge function error:', error);
      throw error;
    }
  } catch (edgeFunctionError) {
    console.log('Edge function not available or error, falling back to Groq API:', edgeFunctionError);
    // Continue to fallback
  }

  // Fallback to Groq API if Edge Function fails
  if (!apiKey) {
    if (foundProblem) {
      const p = foundProblem.problem;
      return `Tôi thấy bạn đang hỏi về bài ${p.id}: "${p.title}". Để nhận được giải thích chi tiết và code examples, vui lòng nhập Groq API Key trong Settings. Tuy nhiên, đây là thông tin cơ bản:\n\n${p.description}\n\nInput: ${p.input}\nOutput: ${p.output}\n\nVí dụ: ${p.examples?.[0]?.input || ''} → ${p.examples?.[0]?.output || ''}`;
    }
    return handleBasicQuestions(userMessage);
  }

  const problemsKnowledge = getProblemsKnowledge();
  
  const systemPrompt = `${WEBSITE_KNOWLEDGE}

${problemsKnowledge}${foundProblem ? `\n\n=== THÔNG TIN BÀI TOÁN ===\n${foundProblem.problem.description}\n` : ''}

NHIỆM VỤ CỦA BẠN:
Bạn là trợ lý giảng dạy thuật toán chuyên nghiệp. Trả lời theo phong cách GIÁO TRÌNH CHÍNH THỨC, dễ hiểu cho sinh viên đại học.

QUY TẮC TRÌNH BÀY (RẤT QUAN TRỌNG):
1. CẤU TRÚC RÕ RÀNG:
   - Luôn có TIÊU ĐỀ CHÍNH (dùng ## hoặc ###)
   - Chia thành các MỤC NHỎ với tiêu đề phụ
   - Dùng gạch đầu dòng (- hoặc *) cho danh sách
   - Sắp xếp logic: Cơ bản → Nâng cao

2. FORMAT MARKDOWN:
   - Tiêu đề: ## Tiêu đề chính, ### Mục nhỏ
   - Danh sách: - Item 1, - Item 2
   - Code: dùng markdown code blocks với ngôn ngữ đúng
   - Bold: **text** cho từ khóa quan trọng

3. NỘI DUNG:
   - Giải thích từ cơ bản đến nâng cao
   - Có ví dụ minh họa cụ thể (nếu phù hợp)
   - Code examples đầy đủ, có comment
   - Phân tích độ phức tạp rõ ràng
   - So sánh các cách giải khi có nhiều approach

4. VĂN PHONG:
   - Giống tài liệu giảng dạy chính thức
   - Rõ ràng, súc tích, KHÔNG lan man
   - Dễ hiểu cho sinh viên đại học
   - Chuyên nghiệp nhưng thân thiện`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
  } catch (error) {
    console.error('Chat error:', error);
    return handleBasicQuestions(userMessage);
  }
};

const handleBasicQuestions = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  // Câu hỏi về trang web
  if (lowerMessage.includes('trang web') || lowerMessage.includes('website') || lowerMessage.includes('app')) {
    return 'Đây là trang web luyện thuật toán "Think Interviewer" với 100+ bài toán từ Easy đến Hard. Bạn có thể luyện tập, tham gia thử thách 20 ngày, và theo dõi tiến độ qua hệ thống XP và Badges. Để sử dụng đầy đủ tính năng, bạn cần nhập Groq API Key để chấm điểm tự động.';
  }

  // Câu hỏi về XP
  if (lowerMessage.includes('xp') || lowerMessage.includes('điểm') || lowerMessage.includes('experience')) {
    return 'XP (Experience Points) là điểm kinh nghiệm bạn tích lũy khi làm bài. Điểm cao hơn = nhiều XP hơn. Bạn cần XP để tăng Level và Rank. Rank từ Intern → Junior → Middle → Senior → Lead → Architect → CTO.';
  }

  // Câu hỏi về Challenge
  if (lowerMessage.includes('thử thách') || lowerMessage.includes('challenge') || lowerMessage.includes('20 ngày')) {
    return 'Thử thách 20 ngày yêu cầu bạn hoàn thành mỗi ngày: 3 bài Easy + 1 bài Medium + 1 bài Hard (tổng 5 bài). Phải đạt >= 6 điểm mới được tính. Hoàn thành sẽ nhận 200,000 VND. Cần đăng nhập để tham gia.';
  }

  // Câu hỏi về API Key
  if (lowerMessage.includes('api') || lowerMessage.includes('key') || lowerMessage.includes('groq')) {
    return 'Bạn cần Groq API Key để sử dụng tính năng chấm điểm tự động. Lấy key tại https://console.groq.com. Sau đó vào Settings của trang web để nhập key.';
  }

  // Câu hỏi về cách làm bài
  if (lowerMessage.includes('làm bài') || lowerMessage.includes('cách') || lowerMessage.includes('hướng dẫn')) {
    return 'Để làm bài: 1) Chọn bài toán, 2) Đọc đề và suy nghĩ, 3) Viết code, 4) Submit để AI chấm điểm, 5) Xem feedback và cải thiện. Bạn có thể chọn Practice (luyện tập) hoặc Interview (phỏng vấn).';
  }

  // Câu hỏi về badges
  if (lowerMessage.includes('badge') || lowerMessage.includes('huy hiệu')) {
    return 'Badges là huy hiệu bạn nhận được khi đạt thành tích: First Blood (bài đầu tiên), Interview Ready (>=9 điểm Interview), Logic Thinker (>=8 điểm 3 lần), Quick Thinker (Interview nhanh), Streak Master (5 bài liên tiếp).';
  }

  // Câu hỏi chào hỏi
  if (lowerMessage.includes('xin chào') || lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('chào')) {
    return 'Xin chào! Tôi là trợ lý ảo của trang web luyện thuật toán. Tôi có thể giúp bạn hiểu về các tính năng, cách sử dụng, hệ thống XP, Challenge 20 ngày, và nhiều hơn nữa. Bạn muốn biết gì?';
  }

  // Câu hỏi về bài toán
  if (lowerMessage.includes('bài toán') || lowerMessage.includes('problem') || lowerMessage.includes('đề bài')) {
    return 'Trang web có 100+ bài toán được phân loại theo Level (1-10), Difficulty (Easy/Medium/Hard), và Skills (Array, String, Tree, Graph, DP, v.v.). Mỗi bài có examples, hints, và interview questions để giúp bạn học.';
  }

  // Câu hỏi về nhóm TWO
  if (lowerMessage.includes('two') || lowerMessage.includes('nhóm') || lowerMessage.includes('nhà phát hành') || lowerMessage.includes('phát triển') || lowerMessage.includes('tác giả') || lowerMessage.includes('developer')) {
    return `## Thông tin về nhóm TWO

**Tên nhóm:** TWO  
**Ý nghĩa:** Together We Overcome (Cùng nhau vượt qua)  
**Slogan:** "Làm tới cùng không lùi bước"

### Các thành viên:
- **Nguyễn Lan Phương** - Quê: Lào Cai - Sở thích: Thể thao, chơi game, thích ăn mỳ cay
- **Cao Thanh Tuấn** - Quê: Vĩnh Phúc - Sở thích: Ăn uống - **Leader của nhóm TWO**
- **Đỗ Hoàng Duy** - Quê: Vĩnh Phúc - Sở thích: Thể thao (đặc biệt bóng đá), thích ăn những món liên quan đến bò
- **Trịnh Văn Lực** - Sở thích: Chơi game và thể thao
- **Vũ Viết Trọng Duy** - Quê: Lào Cai - Sở thích: Nấu ăn và đánh cầu
- **Nguyễn Văn Tấn** - Quê: Hưng Yên - Sở thích: Chơi bóng đá và bi-a
- **Tạ Dương Huy Hoàng** - Quê: Hà Nội - Sở thích: Chơi game và nghe nhạc

Nhóm TWO là nhà phát triển của trang web luyện thuật toán này.`;
  }

  // Mặc định
  return 'Xin chào! Tôi có thể giúp bạn về: cách sử dụng trang web, hệ thống XP và Rank, Thử thách 20 ngày, cách làm bài, Badges, thông tin về nhóm TWO, và nhiều hơn nữa. Bạn muốn hỏi gì?';
};
