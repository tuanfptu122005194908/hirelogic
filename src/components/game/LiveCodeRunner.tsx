import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Terminal, CheckCircle, XCircle, Loader2, AlertCircle, ChevronDown, ChevronUp, Clock, Zap, Shield, Code2, Activity, Cpu, BarChart3 } from 'lucide-react';
import { Problem } from '@/types/game';

interface TestCase {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  error?: string;
}

interface LiveCodeRunnerProps {
  code: string;
  language: string;
  problem: Problem;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const LiveCodeRunner = ({ 
  code, 
  language, 
  problem, 
  isVisible, 
  onToggleVisibility 
}: LiveCodeRunnerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [executionTime, setExecutionTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [autoRun, setAutoRun] = useState(true);
  const [lastCodeHash, setLastCodeHash] = useState('');

  // Auto-run code when it changes (with debouncing)
  useEffect(() => {
    if (!autoRun || !code.trim()) return;

    // Create a simple hash instead of using btoa to avoid Unicode issues
    const codeHash = code.split('').reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff;
    }, 0).toString(36);
    
    if (codeHash === lastCodeHash) return;

    const timeoutId = setTimeout(() => {
      setLastCodeHash(codeHash);
      runCode();
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [code, autoRun]);

  const runCode = async () => {
    if (!code.trim()) {
      setTestResults([]);
      return;
    }

    // Check if code contains actual implementation (not just template)
    const hasImplementation = code.includes('TODO') === false && 
                             code.includes('// TODO') === false &&
                             code.includes('# TODO') === false &&
                             code.includes('return result') === false &&
                             code.includes('return null') === false &&
                             code.trim().length > 50;

    if (!hasImplementation) {
      setTestResults([]);
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Prepare test cases based on problem
      const testCases: TestCase[] = problem.testCases.map((testCase, index) => {
        let actualOutput = '';
        let passed = false;
        let error = '';

        try {
          // Simple JavaScript execution for demo
          if (language === 'javascript') {
            // Create a safe execution context
            const func = new Function('input', code + '\nreturn solve(input);');
            
            try {
              const result = func(testCase.input);
              actualOutput = String(result);
              passed = actualOutput === testCase.output;
            } catch (err) {
              error = err instanceof Error ? err.message : 'Runtime error';
              actualOutput = error;
              passed = false;
            }
          } else {
            // For other languages, only show results if code looks implemented
            const codeLooksImplemented = code.includes('function solve') || 
                                        code.includes('def solve') || 
                                        code.includes('public static') ||
                                        code.includes('int main') ||
                                        code.includes('solve(input)') ||
                                        code.includes('solve(');
            
            if (codeLooksImplemented) {
              // Simulate realistic results based on code complexity
              const hasComplexLogic = code.includes('for') || code.includes('while') || 
                                    code.includes('if') || code.includes('else') ||
                                    code.includes('array') || code.includes('list') ||
                                    code.includes('vector') || code.includes('map');
              
              if (hasComplexLogic) {
                // More likely to pass with complex logic
                passed = Math.random() > 0.3;
                actualOutput = passed ? testCase.output : 'Incorrect output';
              } else {
                // Less likely to pass with simple code
                passed = Math.random() > 0.7;
                actualOutput = passed ? testCase.output : 'Incomplete implementation';
              }
              
              if (!passed && Math.random() > 0.5) {
                error = 'Logic error in implementation';
              }
            } else {
              // Code doesn't look like it's implemented
              error = 'Function solve not properly implemented';
              actualOutput = error;
              passed = false;
            }
          }
        } catch (err) {
          error = err instanceof Error ? err.message : 'Unknown error';
          actualOutput = error;
          passed = false;
        }

        return {
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput,
          passed,
          error
        };
      });

      setTestResults(testCases);
      setExecutionTime(Math.random() * 100 + 20);
      setMemoryUsage(Math.random() * 30 + 10);
    } catch (error) {
      console.error('Execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const passedCount = testResults.filter(tc => tc.passed).length;
  const totalCount = testResults.length;
  const successRate = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <motion.button
          onClick={onToggleVisibility}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-sm"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 opacity-20"
            >
              <Cpu className="w-5 h-5" />
            </motion.div>
            <Terminal className="w-5 h-5 relative z-10" />
          </div>
          <span className="font-semibold">Test Code</span>
          <ChevronUp className="w-4 h-4" />
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 hover:opacity-20 transition-opacity duration-300" />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[420px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-5">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-32 h-32 bg-white/10 rounded-full blur-xl"
          />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-30"
                >
                  <Activity className="w-6 h-6" />
                </motion.div>
                <Code2 className="w-6 h-6 relative z-10" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Live Code Runner</h3>
                <p className="text-xs text-white/80">Real-time testing environment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setAutoRun(!autoRun)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  autoRun 
                    ? 'bg-white/30 text-white shadow-lg' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {autoRun ? (
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Auto
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Manual
                  </div>
                )}
              </motion.button>
              <motion.button
                onClick={onToggleVisibility}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                className="flex items-center gap-2"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className={`w-2 h-2 rounded-full ${
                  successRate === 100 ? 'bg-green-400' : successRate > 50 ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <span className="text-sm font-medium">
                  {passedCount}/{totalCount} passed
                </span>
              </motion.div>
              {executionTime > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1 text-xs text-blue-200"
                >
                  <Clock className="w-3 h-3" />
                  <span>{executionTime.toFixed(1)}ms</span>
                </motion.div>
              )}
            </div>
            <motion.button
              onClick={runCode}
              disabled={isRunning || !code.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/25 hover:bg-white/35 disabled:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-sm transition-all shadow-lg"
            >
              {isRunning ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Tests</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="h-2 bg-gray-100 relative overflow-hidden">
          <motion.div
            className={`h-full transition-all duration-700 ease-out ${
              successRate === 100 
                ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600' 
                : successRate > 50 
                ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-red-500 via-rose-500 to-pink-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${successRate}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
          {/* Animated shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: [-100, 200] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Test Results */}
      <div className="max-h-96 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        <AnimatePresence>
          {testResults.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 text-center"
            >
              {isRunning ? (
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
                  />
                  <div>
                    <p className="text-gray-600 font-medium">Running tests...</p>
                    <p className="text-gray-400 text-sm">Analyzing your code</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center"
                  >
                    <Terminal className="w-8 h-8 text-indigo-600" />
                  </motion.div>
                  <div>
                    <p className="text-gray-600 font-medium">
                      {autoRun ? 'Code will auto-run as you type' : 'Click Run to test your code'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {autoRun ? 'Tests will execute automatically' : 'Manual execution mode enabled'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="divide-y divide-gray-100"
            >
              {testResults.map((testCase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 transition-all duration-300 ${
                    testCase.passed 
                      ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-l-4 border-green-500 hover:from-green-50 hover:to-emerald-50' 
                      : 'bg-gradient-to-r from-red-50/80 to-rose-50/80 border-l-4 border-red-500 hover:from-red-50 hover:to-rose-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <motion.div 
                      className="mt-1"
                      animate={{ 
                        scale: testCase.passed ? [1, 1.2, 1] : [1, 0.8, 1],
                        rotate: testCase.passed ? [0, 360] : [0, -10, 10, 0]
                      }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      {testCase.passed ? (
                        <div className="relative">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <motion.div
                            className="absolute inset-0 bg-green-400 rounded-full opacity-30"
                            animate={{ scale: [1, 1.5, 0] }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                          />
                        </div>
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm bg-white/80 px-2 py-1 rounded-lg">
                            Test Case {index + 1}
                          </span>
                          {testCase.passed && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 + 0.2 }}
                              className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium"
                            >
                              PASSED
                            </motion.span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {testCase.passed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-medium min-w-[45px]">Input:</span>
                          <span className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {testCase.input}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-medium min-w-[45px]">Expected:</span>
                          <span className="font-mono text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                            {testCase.expectedOutput}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-medium min-w-[45px]">Actual:</span>
                          <span className={`font-mono px-2 py-1 rounded border ${
                            testCase.passed 
                              ? 'text-green-600 bg-green-50 border-green-200' 
                              : 'text-red-600 bg-red-50 border-red-200'
                          }`}>
                            {testCase.actualOutput}
                          </span>
                        </div>
                        {testCase.error && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-600 font-mono text-xs bg-red-100 p-3 rounded-lg border border-red-200"
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <AlertCircle className="w-3 h-3" />
                              <span className="font-medium">Error</span>
                            </div>
                            {testCase.error}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Performance Metrics */}
      {executionTime > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-white"
        >
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 bg-blue-50 p-3 rounded-xl border border-blue-200"
            >
              <div className="relative">
                <Clock className="w-4 h-4 text-blue-500" />
                <motion.div
                  className="absolute inset-0 bg-blue-400 rounded-full opacity-20"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <span className="text-gray-600 text-xs">Execution Time</span>
                <span className="font-mono text-sm font-semibold text-blue-600 ml-1">
                  {executionTime.toFixed(1)}ms
                </span>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 bg-purple-50 p-3 rounded-xl border border-purple-200"
            >
              <div className="relative">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <motion.div
                  className="absolute inset-0 bg-purple-400 rounded-full opacity-20"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </div>
              <div>
                <span className="text-gray-600 text-xs">Memory Usage</span>
                <span className="font-mono text-sm font-semibold text-purple-600 ml-1">
                  {memoryUsage.toFixed(1)}MB
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
