import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Terminal, CheckCircle, XCircle, Loader2, Copy, Download, Upload, Settings, Monitor, Code, Zap, Clock, Award, Target } from 'lucide-react';

interface TestCase {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
}

interface CodeEditorProps {
  problem: {
    title: string;
    description: string;
    examples: { input: string; output: string; explanation?: string }[];
    testCases: { input: string; output: string }[];
  };
}

export const CodeEditor = ({ problem }: CodeEditorProps) => {
  const [code, setCode] = useState(`// ${problem.title}
// Time Complexity: O(n)
// Space Complexity: O(1)

function solution(input) {
  // Your code here
  return input;
}

// Test cases
console.log(solution("test")); // Expected: "test"
console.log(solution("hello")); // Expected: "hello"
`);

  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [showConsole, setShowConsole] = useState(true);
  const [executionTime, setExecutionTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);

  const languages = [
    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'cpp', name: 'C++', icon: '⚙️' },
    { id: 'typescript', name: 'TypeScript', icon: '🔷' },
  ];

  const runCode = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate test results
    const results = problem.testCases.map((testCase, index) => {
      const passed = Math.random() > 0.3; // 70% pass rate for demo
      return {
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: passed ? testCase.output : `Error: Test case ${index + 1} failed`,
        passed
      };
    });
    
    setTestResults(results);
    setExecutionTime(Math.random() * 100 + 50);
    setMemoryUsage(Math.random() * 50 + 20);
    setIsRunning(false);
  };

  const resetCode = () => {
    setCode(`// ${problem.title}
// Time Complexity: O(n)
// Space Complexity: O(1)

function solution(input) {
  // Your code here
  return input;
}

// Test cases
console.log(solution("test")); // Expected: "test"
console.log(solution("hello")); // Expected: "hello"
`);
    setTestResults([]);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                {problem.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Easy</span>
                <span>•</span>
                <Target className="w-4 h-4" />
                <span>50% Acceptance</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2">
                <Monitor className="w-4 h-4 text-gray-400" />
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-white text-sm outline-none cursor-pointer"
                >
                  {languages.map(lang => (
                    <option key={lang.id} value={lang.id}>
                      {lang.icon} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <motion.button
                onClick={runCode}
                disabled={isRunning}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={resetCode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </motion.button>

              <motion.button
                onClick={copyCode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-all"
              >
                <Copy className="w-4 h-4" />
                Copy
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
            >
              <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Problem Description
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed mb-6">
                  {problem.description}
                </p>
                
                {/* Examples */}
                <div className="space-y-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    Examples:
                  </h3>
                  {problem.examples.map((example, index) => (
                    <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                      <div className="space-y-3">
                        <div>
                          <span className="text-green-400 font-mono text-sm">Input:</span>
                          <pre className="text-gray-300 font-mono text-sm mt-1">{example.input}</pre>
                        </div>
                        <div>
                          <span className="text-blue-400 font-mono text-sm">Output:</span>
                          <pre className="text-gray-300 font-mono text-sm mt-1">{example.output}</pre>
                        </div>
                        {example.explanation && (
                          <div>
                            <span className="text-yellow-400 font-mono text-sm">Explanation:</span>
                            <p className="text-gray-300 text-sm mt-1">{example.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
              >
                <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-green-400" />
                  Test Results
                </h2>
                
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className={`rounded-lg p-4 border ${
                      result.passed 
                        ? 'bg-green-900/20 border-green-700' 
                        : 'bg-red-900/20 border-red-700'
                    }`}>
                      <div className="flex items-start gap-3">
                        {result.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-mono text-sm text-gray-300 mb-2">
                            Test Case {index + 1}
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-gray-400">Input: </span>
                              <span className="text-gray-300 font-mono">{result.input}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-400">Expected: </span>
                              <span className="text-green-400 font-mono">{result.expectedOutput}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-400">Actual: </span>
                              <span className={result.passed ? 'text-green-400' : 'text-red-400'} font-mono>
                                {result.actualOutput}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Performance Stats */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-400">Execution Time:</span>
                      <span className="text-sm font-mono text-white">{executionTime.toFixed(2)}ms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-400">Memory Usage:</span>
                      <span className="text-sm font-mono text-white">{memoryUsage.toFixed(1)}MB</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Code Editor */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
            >
              <div className="bg-gray-900/50 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-sm text-gray-400 font-mono">solution.{language === 'javascript' ? 'js' : language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => setShowConsole(!showConsole)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Terminal className="w-4 h-4 text-gray-400" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                  </motion.button>
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-96 bg-gray-900/50 text-gray-100 font-mono text-sm p-4 resize-none outline-none border-0"
                  style={{ 
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    lineHeight: '1.6'
                  }}
                  placeholder="// Write your code here..."
                  spellCheck={false}
                />
                
                {/* Line numbers */}
                <div className="absolute left-0 top-0 w-12 h-96 bg-gray-900/50 border-r border-gray-700 p-4 text-gray-500 font-mono text-sm text-right">
                  {code.split('\n').map((_, index) => (
                    <div key={index}>{index + 1}</div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Console Output */}
            <AnimatePresence>
              {showConsole && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
                >
                  <div className="bg-gray-900/50 border-b border-gray-700 px-4 py-3 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-400 font-mono">Console Output</span>
                  </div>
                  <div className="p-4 font-mono text-sm text-gray-300 min-h-[100px]">
                    {testResults.length > 0 ? (
                      <div className="space-y-1">
                        {testResults.map((result, index) => (
                          <div key={index} className={result.passed ? 'text-green-400' : 'text-red-400'}>
                            Test Case {index + 1}: {result.passed ? 'PASSED' : 'FAILED'}
                          </div>
                        ))}
                        <div className="text-gray-400 mt-2">
                          Execution completed in {executionTime.toFixed(2)}ms
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        Click "Run" to execute your code and see the output here...
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
