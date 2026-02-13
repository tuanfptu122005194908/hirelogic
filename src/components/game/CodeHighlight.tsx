import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeHighlightProps {
  code: string;
  language?: string;
}

export const CodeHighlight = ({ code, language = 'javascript' }: CodeHighlightProps) => {
  return (
    <SyntaxHighlighter
      language={language}
      style={oneLight}
      customStyle={{
        margin: 0,
        borderRadius: '0.75rem',
        fontSize: '0.875rem',
        padding: '1rem',
      }}
      showLineNumbers
    >
      {code}
    </SyntaxHighlighter>
  );
};

// Helper to extract code blocks and render with highlighting
interface MarkdownCodeProps {
  content: string;
  defaultLanguage?: string;
}

export const MarkdownCode = ({ content, defaultLanguage = 'javascript' }: MarkdownCodeProps) => {
  // Parse content to find code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        // Check if this is a code block
        const codeMatch = part.match(/```(\w+)?\n?([\s\S]*?)```/);
        
        if (codeMatch) {
          const language = codeMatch[1] || defaultLanguage;
          const code = codeMatch[2].trim();
          return (
            <div key={index} className="rounded-xl overflow-hidden border border-border">
              <div className="bg-muted px-4 py-2 text-xs text-muted-foreground font-mono">
                {language}
              </div>
              <CodeHighlight code={code} language={language} />
            </div>
          );
        }
        
        // Regular text
        if (part.trim()) {
          return (
            <p key={index} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {part}
            </p>
          );
        }
        
        return null;
      })}
    </div>
  );
};
