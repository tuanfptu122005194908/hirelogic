import { CodeHighlight } from '@/components/game/CodeHighlight';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  // Parse markdown: headings, lists, code blocks, bold, italic
  const parts: Array<{ type: string; content: string; level?: number; language?: string }> = [];
  
  // First, extract code blocks
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let match;
  const codeBlocks: Array<{ start: number; end: number; language: string; code: string }> = [];
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    codeBlocks.push({
      start: match.index,
      end: match.index + match[0].length,
      language: match[1] || 'javascript',
      code: match[2].trim(),
    });
  }
  
  // Process text parts
  let currentIndex = 0;
  codeBlocks.forEach((block, idx) => {
    // Add text before code block
    if (block.start > currentIndex) {
      const textPart = content.substring(currentIndex, block.start);
      if (textPart.trim()) {
        parts.push({ type: 'text', content: textPart });
      }
    }
    // Add code block
    parts.push({ type: 'code', content: block.code, language: block.language });
    currentIndex = block.end;
  });
  
  // Add remaining text
  if (currentIndex < content.length) {
    const remaining = content.substring(currentIndex);
    if (remaining.trim()) {
      parts.push({ type: 'text', content: remaining });
    }
  }
  
  // If no code blocks, add entire content as text
  if (parts.length === 0) {
    parts.push({ type: 'text', content });
  }
  
  // Render text with markdown formatting
  const renderText = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let inList = false;
    let listKey = 0;
    
    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();
      
      // Check for headings
      if (trimmed.match(/^#{1,3}\s+/)) {
        // Close any open list
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${listKey++}`} className="list-none space-y-3 my-6 ml-6">
              {listItems.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed text-foreground/90 flex items-start gap-3">
                  <span className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-primary to-primary/60 rounded-full mt-2 shadow-sm"></span>
                  <span className="flex-1">{renderInlineMarkdown(item)}</span>
                </li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        
        const level = trimmed.match(/^(#{1,3})/)?.[1].length || 1;
        const headingText = trimmed.replace(/^#{1,3}\s+/, '');
        const HeadingTag = `h${Math.min(level, 3)}` as 'h1' | 'h2' | 'h3';
        elements.push(
          <HeadingTag
            key={`heading-${lineIdx}`}
            className={cn(
              'font-bold mt-8 mb-4 pb-3 border-b-2 relative',
              level === 1 && 'text-2xl text-primary border-primary/40 bg-gradient-to-r from-primary/5 to-transparent pl-4 -ml-4 rounded-l-lg',
              level === 2 && 'text-xl text-foreground border-border/60 pl-3 -ml-3',
              level === 3 && 'text-lg text-foreground/90 border-border/40 pl-2 -ml-2'
            )}
          >
            {level === 1 && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/60 rounded-full"></span>
            )}
            {renderInlineMarkdown(headingText)}
          </HeadingTag>
        );
        return;
      }
      
      // Check for list items
      if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        if (!inList) {
          inList = true;
        }
        const itemText = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
        listItems.push(itemText);
        return;
      }
      
      // Close list if we hit a non-list line
      if (inList && listItems.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="list-none space-y-3 my-6 ml-6">
            {listItems.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed text-foreground/90 flex items-start gap-3">
                <span className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-primary to-primary/60 rounded-full mt-2 shadow-sm"></span>
                <span className="flex-1">{renderInlineMarkdown(item)}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
      
      // Regular paragraph
      if (trimmed) {
        elements.push(
          <p key={`para-${lineIdx}`} className="my-4 leading-relaxed text-sm text-foreground/90 last:mb-0">
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      } else if (lineIdx < lines.length - 1) {
        // Empty line for spacing
        elements.push(<div key={`spacer-${lineIdx}`} className="h-2" />);
      }
    });
    
    // Close any remaining list
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="list-disc list-inside space-y-1 my-2 ml-4">
          {listItems.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed">{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
    }
    
    return elements;
  };
  
  // Render inline markdown (bold, italic, code)
  const renderInlineMarkdown = (text: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    let currentIndex = 0;
    
    // Match bold **text** or __text__
    const boldRegex = /\*\*(.*?)\*\*|__(.*?)__/g;
    let match;
    const matches: Array<{ start: number; end: number; text: string }> = [];
    
    while ((match = boldRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[1] || match[2],
      });
    }
    
    matches.forEach((boldMatch, idx) => {
      // Add text before bold
      if (boldMatch.start > currentIndex) {
        const beforeText = text.substring(currentIndex, boldMatch.start);
        if (beforeText) {
          parts.push(beforeText);
        }
      }
      // Add bold text
      parts.push(
        <strong key={`bold-${idx}`} className="font-bold text-foreground bg-gradient-to-r from-primary/10 to-primary/5 px-1 rounded border border-primary/20">
          {boldMatch.text}
        </strong>
      );
      currentIndex = boldMatch.end;
    });
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }
    
    if (parts.length === 0) {
      parts.push(text);
    }
    
    return parts;
  };
  
  return (
    <div className="space-y-2 prose prose-sm max-w-none font-medium leading-relaxed">
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          return (
            <div key={idx} className="my-6 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
              <CodeHighlight code={part.content} language={part.language as string} />
            </div>
          );
        }
        return <div key={idx} className="markdown-content">{renderText(part.content)}</div>;
      })}
    </div>
  );
};

