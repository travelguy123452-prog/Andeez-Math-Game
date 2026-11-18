import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

interface TextSegment {
  type: 'text' | 'inline' | 'display';
  content: string;
}

function parseMathSegments(input: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: input.slice(lastIndex, match.index),
      });
    }

    if (match[1] !== undefined) {
      segments.push({ type: 'display', content: match[1] });
    } else if (match[2] !== undefined) {
      segments.push({ type: 'inline', content: match[2] });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    segments.push({
      type: 'text',
      content: input.slice(lastIndex),
    });
  }

  return segments;
}

function renderLatex(expr: string, displayMode: boolean): string {
  try {
    return katex.renderToString(expr.trim(), {
      displayMode,
      throwOnError: false,
      strict: false,
    });
  } catch {
    return expr;
  }
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  const segments = React.useMemo(() => parseMathSegments(text), [text]);

  return (
    <span className={className}>
      {segments.map((seg, idx) => {
        if (seg.type === 'text') {
          return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
        }
        const html = renderLatex(seg.content, seg.type === 'display');
        if (seg.type === 'display') {
          return (
            <span
              key={idx}
              className="block my-2 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        return <span key={idx} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </span>
  );
};
