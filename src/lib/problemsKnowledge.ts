import { getAllProblems } from '@/data/problems';

// Generate comprehensive knowledge base from problems
export const generateProblemsKnowledge = (): string => {
  const problems = getAllProblems();
  
  let knowledge = `\n=== KIẾN THỨC CHUYÊN SÂU VỀ 100 BÀI TOÁN THUẬT TOÁN ===\n\n`;
  
  // Group by skill
  const problemsBySkill: Record<string, typeof problems> = {};
  problems.forEach(p => {
    if (!problemsBySkill[p.skill]) {
      problemsBySkill[p.skill] = [];
    }
    problemsBySkill[p.skill].push(p);
  });

  // Add skill-based knowledge
  knowledge += `CÁC CHỦ ĐỀ THUẬT TOÁN:\n`;
  Object.keys(problemsBySkill).forEach(skill => {
    knowledge += `- ${skill}: ${problemsBySkill[skill].length} bài\n`;
  });
  knowledge += `\n`;

  // Add problem index (compact format for reference)
  knowledge += `DANH SÁCH 100 BÀI TOÁN (ID - Title - Level - Difficulty - Skill):\n`;
  problems.forEach(problem => {
    knowledge += `${problem.id}. ${problem.title} | Lv${problem.level} | ${problem.difficulty} | ${problem.skill}\n`;
  });
  knowledge += `\n`;
  
  // Add detailed info for first 20 problems as examples (most common ones)
  knowledge += `CHI TIẾT MẪU (20 bài đầu tiên - các bài khác có format tương tự):\n\n`;
  
  problems.slice(0, 20).forEach(problem => {
    knowledge += `[BÀI ${problem.id}] ${problem.title}:\n`;
    knowledge += `- Level: ${problem.level}, Difficulty: ${problem.difficulty}, Skill: ${problem.skill}\n`;
    knowledge += `- Mô tả: ${problem.description}\n`;
    knowledge += `- Input: ${problem.input}\n`;
    knowledge += `- Output: ${problem.output}\n`;
    
    if (problem.examples && problem.examples.length > 0) {
      knowledge += `- Ví dụ: ${problem.examples.map(ex => `${ex.input} → ${ex.output}`).join('; ')}\n`;
    }
    
    if (problem.hints && problem.hints.length > 0) {
      knowledge += `- Gợi ý: ${problem.hints.join('; ')}\n`;
    }
    
    if (problem.theoryQuestions && problem.theoryQuestions.length > 0) {
      const tq = problem.theoryQuestions[0];
      knowledge += `- Lý thuyết: ${tq.question} → ${tq.options[tq.correct]} (${tq.explanation})\n`;
    }
    
    knowledge += `\n`;
  });
  
  knowledge += `\nLƯU Ý: Khi người dùng hỏi về bài toán cụ thể (theo ID hoặc title), bạn có thể tham khảo format trên và cung cấp thông tin tương tự cho bài đó.\n\n`;

  // Add algorithm patterns and techniques
  knowledge += `\n=== CÁC KỸ THUẬT VÀ PATTERN THƯỜNG DÙNG ===\n\n`;
  
  knowledge += `1. TWO POINTERS:\n`;
  knowledge += `- Dùng 2 con trỏ di chuyển từ 2 đầu hoặc cùng 1 đầu\n`;
  knowledge += `- Áp dụng: Reverse array, Palindrome, Two Sum, Container Water\n`;
  knowledge += `- Time: O(n), Space: O(1)\n\n`;
  
  knowledge += `2. SLIDING WINDOW:\n`;
  knowledge += `- Duy trì window có điều kiện, expand/contract\n`;
  knowledge += `- Áp dụng: Longest substring, Minimum window, Subarray sum\n`;
  knowledge += `- Time: O(n), Space: O(k) với k là window size\n\n`;
  
  knowledge += `3. HASH TABLE / MAP:\n`;
  knowledge += `- Dùng để lưu frequency, index, hoặc check existence\n`;
  knowledge += `- Áp dụng: Two Sum, Anagram, Frequency counting\n`;
  knowledge += `- Time: O(1) average lookup, Space: O(n)\n\n`;
  
  knowledge += `4. STACK:\n`;
  knowledge += `- LIFO (Last In First Out)\n`;
  knowledge += `- Áp dụng: Valid parentheses, Next greater element, Monotonic stack\n`;
  knowledge += `- Time: O(n), Space: O(n)\n\n`;
  
  knowledge += `5. QUEUE / BFS:\n`;
  knowledge += `- FIFO (First In First Out)\n`;
  knowledge += `- Áp dụng: Level order traversal, Shortest path, Graph traversal\n`;
  knowledge += `- Time: O(V + E), Space: O(V)\n\n`;
  
  knowledge += `6. BINARY SEARCH:\n`;
  knowledge += `- Chia đôi search space mỗi bước\n`;
  knowledge += `- Áp dụng: Sorted array search, Search insert position, Sqrt\n`;
  knowledge += `- Time: O(log n), Space: O(1)\n\n`;
  
  knowledge += `7. DYNAMIC PROGRAMMING:\n`;
  knowledge += `- Lưu kết quả subproblems để tránh tính lại\n`;
  knowledge += `- Pattern: Top-down (memoization) hoặc Bottom-up (tabulation)\n`;
  knowledge += `- Áp dụng: Fibonacci, Knapsack, LCS, Edit Distance, Coin Change\n`;
  knowledge += `- Time: O(n²) hoặc O(n*m), Space: O(n) hoặc O(n*m)\n\n`;
  
  knowledge += `8. BACKTRACKING:\n`;
  knowledge += `- Thử tất cả possibilities, backtrack khi không hợp lệ\n`;
  knowledge += `- Áp dụng: Permutations, Combinations, N-Queens, Sudoku\n`;
  knowledge += `- Time: O(2^n) hoặc O(n!), Space: O(n) cho recursion stack\n\n`;
  
  knowledge += `9. TREE TRAVERSAL:\n`;
  knowledge += `- DFS: Preorder, Inorder, Postorder\n`;
  knowledge += `- BFS: Level order\n`;
  knowledge += `- Áp dụng: Validate BST, LCA, Path sum, Serialize tree\n`;
  knowledge += `- Time: O(n), Space: O(h) với h là height\n\n`;
  
  knowledge += `10. GRAPH ALGORITHMS:\n`;
  knowledge += `- DFS: Dùng recursion hoặc stack\n`;
  knowledge += `- BFS: Dùng queue, tìm shortest path unweighted\n`;
  knowledge += `- Topological Sort: Dùng cho DAG (Directed Acyclic Graph)\n`;
  knowledge += `- Áp dụng: Number of Islands, Course Schedule, Clone Graph\n`;
  knowledge += `- Time: O(V + E), Space: O(V)\n\n`;
  
  knowledge += `11. GREEDY:\n`;
  knowledge += `- Chọn locally optimal choice tại mỗi bước\n`;
  knowledge += `- Áp dụng: Activity selection, Interval scheduling, Jump game\n`;
  knowledge += `- Time: O(n log n) nếu cần sort, Space: O(1)\n\n`;
  
  knowledge += `12. HEAP / PRIORITY QUEUE:\n`;
  knowledge += `- Min heap: root là min, Max heap: root là max\n`;
  knowledge += `- Áp dụng: Top K elements, Median, Merge K sorted lists\n`;
  knowledge += `- Time: O(n log k) cho top K, Space: O(k)\n\n`;

  // Add complexity analysis guide
  knowledge += `\n=== PHÂN TÍCH ĐỘ PHỨC TẠP ===\n\n`;
  knowledge += `Time Complexity:\n`;
  knowledge += `- O(1): Constant - truy cập array, hash lookup\n`;
  knowledge += `- O(log n): Binary search, heap operations\n`;
  knowledge += `- O(n): Linear scan, single loop\n`;
  knowledge += `- O(n log n): Sorting, divide and conquer\n`;
  knowledge += `- O(n²): Nested loops, matrix operations\n`;
  knowledge += `- O(2^n): Exponential - backtracking, subsets\n`;
  knowledge += `- O(n!): Factorial - permutations\n\n`;
  
  knowledge += `Space Complexity:\n`;
  knowledge += `- O(1): Constant space, chỉ dùng vài biến\n`;
  knowledge += `- O(n): Array, hash table, recursion stack\n`;
  knowledge += `- O(n²): 2D array, matrix\n\n`;

  // Add code patterns
  knowledge += `\n=== CODE PATTERNS THƯỜNG DÙNG ===\n\n`;
  
  knowledge += `1. Two Pointers Pattern:\n`;
  knowledge += `\`\`\`javascript\n`;
  knowledge += `let left = 0, right = arr.length - 1;\n`;
  knowledge += `while (left < right) {\n`;
  knowledge += `  // Process arr[left] and arr[right]\n`;
  knowledge += `  if (condition) left++;\n`;
  knowledge += `  else right--;\n`;
  knowledge += `}\n`;
  knowledge += `\`\`\`\n\n`;
  
  knowledge += `2. Sliding Window Pattern:\n`;
  knowledge += `\`\`\`javascript\n`;
  knowledge += `let left = 0, right = 0;\n`;
  knowledge += `while (right < arr.length) {\n`;
  knowledge += `  // Expand window\n`;
  knowledge += `  window.add(arr[right]);\n`;
  knowledge += `  right++;\n`;
  knowledge += `  \n`;
  knowledge += `  // Shrink window if needed\n`;
  knowledge += `  while (window.invalid()) {\n`;
  knowledge += `    window.remove(arr[left]);\n`;
  knowledge += `    left++;\n`;
  knowledge += `  }\n`;
  knowledge += `}\n`;
  knowledge += `\`\`\`\n\n`;
  
  knowledge += `3. Hash Map Pattern:\n`;
  knowledge += `\`\`\`javascript\n`;
  knowledge += `const map = new Map();\n`;
  knowledge += `for (let i = 0; i < arr.length; i++) {\n`;
  knowledge += `  if (map.has(target - arr[i])) {\n`;
  knowledge += `    return [map.get(target - arr[i]), i];\n`;
  knowledge += `  }\n`;
  knowledge += `  map.set(arr[i], i);\n`;
  knowledge += `}\n`;
  knowledge += `\`\`\`\n\n`;
  
  knowledge += `4. Dynamic Programming Pattern:\n`;
  knowledge += `\`\`\`javascript\n`;
  knowledge += `// Bottom-up approach\n`;
  knowledge += `const dp = new Array(n + 1).fill(0);\n`;
  knowledge += `dp[0] = baseCase;\n`;
  knowledge += `for (let i = 1; i <= n; i++) {\n`;
  knowledge += `  dp[i] = recurrenceRelation(dp[i-1], ...);\n`;
  knowledge += `}\n`;
  knowledge += `return dp[n];\n`;
  knowledge += `\`\`\`\n\n`;
  
  knowledge += `5. Backtracking Pattern:\n`;
  knowledge += `\`\`\`javascript\n`;
  knowledge += `function backtrack(path, choices) {\n`;
  knowledge += `  if (isComplete(path)) {\n`;
  knowledge += `    result.push([...path]);\n`;
  knowledge += `    return;\n`;
  knowledge += `  }\n`;
  knowledge += `  \n`;
  knowledge += `  for (let choice of choices) {\n`;
  knowledge += `    if (isValid(choice)) {\n`;
  knowledge += `      path.push(choice);\n`;
  knowledge += `      backtrack(path, choices);\n`;
  knowledge += `      path.pop(); // backtrack\n`;
  knowledge += `    }\n`;
  knowledge += `  }\n`;
  knowledge += `}\n`;
  knowledge += `\`\`\`\n\n`;

  return knowledge;
};
