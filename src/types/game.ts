// Game Types
export interface Problem {
  id: number;
  level: number;
  title: string;
  story: string;
  description: string;
  skill: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  input: string;
  output: string;
  examples: { input: string; output: string; explanation?: string }[];
  hints: string[];
  interviewQuestions: string[];
  testCases: { input: string; output: string }[];
  theoryQuestions: { question: string; options: string[]; correct: number; explanation: string }[];
}

export interface GameProgress {
  level: number;
  xp: number;
  rank: string;
  badges: string[];
  history: HistoryEntry[];
  apiKey?: string;
}

export interface HistoryEntry {
  problemId: number;
  score: number;
  date: string;
  mode: 'practice' | 'interview';
  feedback?: string;
}

export interface AIResponse {
  scores: {
    understanding: number;
    approach: number;
    codeLogic: number;
    explanation: number;
    edgeCases: number;
    complexity: number;
    communication: number;
    creativity: number;
    codeStyle: number;
    overallThinking: number;
  };
  totalScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  algorithmExplanation: string;
  codeGuide: string;
  additionalTestCases: { input: string; output: string; explanation: string }[];
}

export interface GameState {
  screen: 'start' | 'problem' | 'solving' | 'result' | 'progress' | 'problemList';
  mode: 'practice' | 'interview' | null;
  currentProblem: Problem | null;
  userThinking: string;
  userCode: string;
  selectedLanguage: string;
  interviewAnswers: string[];
  aiResponse: AIResponse | null;
  isLoading: boolean;
  timeLeft: number;
}

export const RANKS = [
  { name: 'Intern', minXP: 0 },
  { name: 'Junior', minXP: 100 },
  { name: 'Fresher', minXP: 300 },
  { name: 'Mid-Level', minXP: 600 },
  { name: 'Senior', minXP: 1000 },
  { name: 'Interview Ready', minXP: 1500 },
  { name: 'Tech Lead', minXP: 2500 },
];

export const BADGES = {
  'Logic Thinker': { icon: '🧠', description: 'Scored 8+ on logic 3 times' },
  'Optimization Mind': { icon: '⚡', description: 'Analyzed complexity correctly 5 times' },
  'Interview Ready': { icon: '🎤', description: 'Scored 9+ in Interview Mode' },
  'First Blood': { icon: '🩸', description: 'Completed your first problem' },
  'Streak Master': { icon: '🔥', description: '5 problems in a row' },
  'Edge Case Hunter': { icon: '🎯', description: 'Identified all edge cases 3 times' },
  'Code Artist': { icon: '🎨', description: 'Perfect code style score 3 times' },
  'Quick Thinker': { icon: '⏱️', description: 'Solved Interview mode under 10 minutes' },
};

export interface Violation {
  time: string;
  userId: string;
}

export const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'c', name: 'C', icon: '🔤' },
  { id: 'cpp', name: 'C++', icon: '⚙️' },
  { id: 'typescript', name: 'TypeScript', icon: '🔷' },
];
