import { AIResponse } from '@/types/game';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GradeRequest {
  problem: {
    title: string;
    description: string;
    story: string;
    examples: { input: string; output: string; explanation?: string }[];
  };
  userThinking: string;
  userCode: string;
  language: string;
  interviewAnswers: string[];
  interviewQuestions: string[];
  mode: 'practice' | 'interview';
}

export const gradeWithAI = async (
  apiKey: string,
  request: GradeRequest
): Promise<AIResponse> => {
  const systemPrompt = `Bạn là một Senior Software Engineer đang đánh giá code của ứng viên IT. 
Hãy đánh giá code một cách chuyên nghiệp, chi tiết và công bằng.

Bạn PHẢI trả về JSON với format chính xác sau (không có text khác):
{
  "scores": {
    "understanding": <0-2>,
    "approach": <0-2>,
    "codeLogic": <0-2>,
    "codeStyle": <0-1>,
    "edgeCases": <0-1>,
    "complexity": <0-1>,
    "creativity": <0-1>
  },
  "totalScore": <0-10>,
  "feedback": "<Nhận xét tổng quan 2-3 câu, tiếng Việt>",
  "strengths": ["<điểm mạnh 1>", "<điểm mạnh 2>"],
  "improvements": ["<cần cải thiện 1>", "<cần cải thiện 2>"],
  "algorithmExplanation": "<Giải thích thuật toán chi tiết, cách hoạt động, tiếng Việt, 3-5 câu>",
  "codeGuide": "<Hướng dẫn code CHUẨN FORMAT với markdown code blocks>",
  "additionalTestCases": [
    {"input": "<input>", "output": "<output>", "explanation": "<giải thích tiếng Việt>"}
  ]
}

Tiêu chí chấm điểm:
- understanding (0-2): Hiểu đúng yêu cầu bài toán
- approach (0-2): Phương pháp giải quyết hợp lý
- codeLogic (0-2): Logic code đúng, chạy được
- codeStyle (0-1): Code sạch, dễ đọc, đặt tên biến tốt
- edgeCases (0-1): Xử lý các trường hợp đặc biệt
- complexity (0-1): Độ phức tạp thuật toán tối ưu
- creativity (0-1): Cách giải sáng tạo, hiệu quả

QUY TẮC CODE GUIDE (RẤT QUAN TRỌNG):
1. Code PHẢI được format chuẩn với proper indentation (2 hoặc 4 spaces)
2. Mỗi statement phải xuống dòng riêng
3. Có khoảng trắng giữa các khối logic
4. Code PHẢI được wrap trong markdown code block với ngôn ngữ tương ứng: \`\`\`javascript hoặc \`\`\`python, etc.
5. Đặt tên biến/hàm có ý nghĩa, camelCase
6. Comment giải thích các bước quan trọng
7. Có thể có nhiều code block nếu cần giải thích từng phần

Ví dụ codeGuide đúng format:
"Giải thích ý tưởng...\\n\\n\`\`\`javascript\\nfunction twoSum(nums, target) {\\n  // Dùng hash map để lưu index\\n  const map = new Map();\\n  \\n  for (let i = 0; i < nums.length; i++) {\\n    const complement = target - nums[i];\\n    \\n    if (map.has(complement)) {\\n      return [map.get(complement), i];\\n    }\\n    \\n    map.set(nums[i], i);\\n  }\\n  \\n  return [];\\n}\\n\`\`\`\\n\\nĐộ phức tạp: O(n) thời gian, O(n) không gian."`;

  const userPrompt = `
## Đề bài
**${request.problem.title}**
${request.problem.story}

${request.problem.description}

Examples:
${request.problem.examples.map(e => `- Input: ${e.input} → Output: ${e.output}`).join('\n')}

## Code của ứng viên (${request.language}):
\`\`\`${request.language}
${request.userCode || '// Không có code'}
\`\`\`

## Yêu cầu
- Ngôn ngữ code hướng dẫn: ${request.language}
- Đánh giá công bằng, chi tiết
- Feedback bằng tiếng Việt, dễ hiểu
- Cung cấp code example theo ngôn ngữ ${request.language}
`;

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
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as AIResponse;
    
    // Validate and ensure all fields exist
    return {
      scores: {
        understanding: parsed.scores?.understanding ?? 0,
        approach: parsed.scores?.approach ?? 0,
        codeLogic: parsed.scores?.codeLogic ?? 0,
        explanation: parsed.scores?.explanation ?? 0,
        edgeCases: parsed.scores?.edgeCases ?? 0,
        complexity: parsed.scores?.complexity ?? 0,
        communication: parsed.scores?.communication ?? 0,
        creativity: parsed.scores?.creativity ?? 0,
        codeStyle: parsed.scores?.codeStyle ?? 0,
        overallThinking: parsed.scores?.overallThinking ?? 0,
      },
      totalScore: parsed.totalScore ?? 0,
      feedback: parsed.feedback ?? 'Không có feedback',
      strengths: parsed.strengths ?? [],
      improvements: parsed.improvements ?? [],
      algorithmExplanation: parsed.algorithmExplanation ?? '',
      codeGuide: parsed.codeGuide ?? '',
      additionalTestCases: parsed.additionalTestCases ?? [],
    };
  } catch (error) {
    console.error('AI Grading Error:', error);
    throw error;
  }
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
};
