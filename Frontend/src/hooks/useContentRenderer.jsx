import { useRef, useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import { extractYouTubeId, parseMarkdownTable } from '../utils/contentFormatting';

/**
 * Hook for rendering formatted content with syntax highlighting, tables, and embeds
 */
export const useContentRenderer = () => {
  // CodeBlock component for copy UX per block
  const CodeBlock = ({ code, lang = 'text' }) => {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef(null);
    const codeRef = useRef(null);

    useEffect(() => {
      if (codeRef.current) {
        Prism.highlightElement(codeRef.current);
      }
      return () => clearTimeout(timeoutRef.current);
    }, [code, lang]);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code.trimEnd());
        setCopied(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), 1800);
      } catch (err) {
        console.error('Copy failed', err);
      }
    };

    const langDisplay = lang ? lang.toUpperCase() : 'TEXT';

    return (
      <div className="relative my-3 rounded-lg overflow-hidden border border-gray-800 shadow-md bg-gray-900">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-950 border-b border-gray-800">
          <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">{langDisplay}</span>
          <button
            type="button"
            onClick={handleCopy}
            className={`px-3 py-1.5 text-[11px] font-semibold rounded border transition-all transform active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-gray-100'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-sm bg-gray-900">
          <code ref={codeRef} className={`language-${lang.toLowerCase()} text-gray-100`}>
            {code.trimEnd()}
          </code>
        </pre>
      </div>
    );
  };

  // Render markdown table as HTML
  const renderTable = (tableStr) => {
    const table = parseMarkdownTable(tableStr);
    if (!table) return <p className="text-sm text-gray-600">{tableStr}</p>;
    
    return (
      <div className="overflow-x-auto my-4 rounded-lg border border-gray-300">
        <table className="w-full text-sm border-collapse bg-white">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              {table.headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold text-gray-700 border-r last:border-r-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50 border-b border-gray-200'}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 text-gray-700 border-r last:border-r-0 border-gray-200">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render YouTube embed
  const renderYouTubeEmbed = (url, key) => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return null;
    return (
      <div key={key} className="my-4 rounded-lg overflow-hidden border border-gray-300">
        <iframe
          width="100%"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full"
        />
      </div>
    );
  };

  // Render inline bold text
  const renderInlineBold = (str) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`bold-${i}`}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Render text with markdown and plain URLs
  const renderTextWithLinks = (str) => {
    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const withMarkdownLinks = [];
    let lastIdx = 0;
    let mdMatch;
    
    while ((mdMatch = markdownLinkRegex.exec(str)) !== null) {
      const [fullMatch, linkText, url] = mdMatch;
      const before = str.slice(lastIdx, mdMatch.index);
      if (before) {
        withMarkdownLinks.push({ type: 'text', content: before });
      }
      withMarkdownLinks.push({ type: 'mdlink', text: linkText, url });
      lastIdx = mdMatch.index + fullMatch.length;
    }
    const remaining = str.slice(lastIdx);
    if (remaining) {
      withMarkdownLinks.push({ type: 'text', content: remaining });
    }
    
    if (withMarkdownLinks.length === 0) {
      withMarkdownLinks.push({ type: 'text', content: str });
    }
    
    const result = [];
    withMarkdownLinks.forEach((item, itemIdx) => {
      if (item.type === 'mdlink') {
        result.push(
          <a
            key={`mdlink-${itemIdx}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            {item.text}
          </a>
        );
      } else {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = item.content.split(urlRegex);
        parts.forEach((part, i) => {
          if (urlRegex.test(part)) {
            result.push(
              <a
                key={`link-${itemIdx}-${i}`}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                {part}
              </a>
            );
          } else {
            result.push(<span key={`text-${itemIdx}-${i}`}>{renderInlineBold(part)}</span>);
          }
        });
      }
    });
    
    return result;
  };

  // Render lines with various formatting
  const renderLines = (block, blockIndex, { headingClass = 'text-indigo-700', bulletColor = 'text-indigo-600' } = {}) => {
    const lines = block.split('\n');
    return lines.map((line, idx) => {
      const key = `${blockIndex}-${idx}`;
      const trimmed = line.trim();
      if (!trimmed) return <div key={key} className="h-2" />;

      if (/^-{3,}$/.test(trimmed)) {
        return <hr key={key} className="my-4 border-t-2 border-gray-300" />;
      }

      const boldHeaderMatch = trimmed.match(/^\*\*([^*:]+):?\*\*:?\s*(.*)$/);
      if (boldHeaderMatch) {
        const headerText = boldHeaderMatch[1].trim();
        const restText = boldHeaderMatch[2].trim();
        
        let icon = '';
        if (/consensus/i.test(headerText)) icon = '✓ ';
        else if (/conflict/i.test(headerText)) icon = '⚡ ';
        else if (/check/i.test(headerText)) icon = '🔍 ';
        
        return (
          <div key={key} className="mt-3 mb-1">
            <h4 className={`font-bold ${headingClass} text-sm inline`}>
              {icon}{headerText}
            </h4>
            {restText && <span className="text-sm text-gray-800 ml-1">{restText}</span>}
          </div>
        );
      }

      const subheaderMatch = trimmed.match(/^\*([^*]+)\*$/);
      if (subheaderMatch) {
        return (
          <h4 key={key} className={`font-bold ${headingClass} text-sm mt-3 mb-1`}>
            {subheaderMatch[1]}
          </h4>
        );
      }

      if (/^#{1,3}\s/.test(trimmed) || /^[A-Z][A-Za-z\s\-‑]+:$/.test(trimmed) || /^[A-Z][A-Za-z\s\-‑]+\s*\([^)]+\)$/.test(trimmed)) {
        const headerText = trimmed.replace(/^#+\s*/, '').replace(/:$/, '');
        
        if (/^(Equipment|Tips|Notes\s*&\s*Tips)$/i.test(headerText)) {
          return (
            <div key={key} className="mt-4 mb-2 px-3 py-2 bg-blue-50 border-l-4 border-blue-400 rounded">
              <h3 className={`font-bold text-blue-700 text-sm uppercase tracking-wide`}>
                {headerText === 'Equipment' ? '🔧 ' : '💡 '}{headerText}
              </h3>
            </div>
          );
        }
        
        return (
          <h3 key={key} className={`font-bold ${headingClass} text-sm mt-4 mb-2 uppercase tracking-wide`}>
            {headerText}
          </h3>
        );
      }

      const numberedBoldMatch = trimmed.match(/^(\d+)\.?\s*\*\*([^*]+)\*\*:?:?\s*(.*)$/);
      if (numberedBoldMatch) {
        return (
          <div key={key} className="ml-4 my-1 text-sm text-gray-800 flex">
            <span className={`font-bold ${headingClass} mr-2 min-w-[1.5rem]`}>{numberedBoldMatch[1]}.</span>
            <span>
              <strong className="text-gray-900">{numberedBoldMatch[2]}</strong>
              {numberedBoldMatch[3] ? `: ${numberedBoldMatch[3]}` : ''}
            </span>
          </div>
        );
      }

      const numberedLabelMatch = trimmed.match(/^(\d+)\.\s*([A-Za-z][A-Za-z\s\-‑]+):\s*(.+)$/);
      if (numberedLabelMatch) {
        return (
          <div key={key} className="ml-4 my-1 text-sm text-gray-800 flex">
            <span className={`font-bold ${headingClass} mr-2 min-w-[1.5rem]`}>{numberedLabelMatch[1]}.</span>
            <span>
              <strong className="text-gray-900">{numberedLabelMatch[2]}</strong>: {numberedLabelMatch[3]}
            </span>
          </div>
        );
      }

      const numberedMatch = trimmed.match(/^(\d+)\.\s*(.+)$/);
      if (numberedMatch) {
        return (
          <div key={key} className="ml-4 my-1 text-sm text-gray-800 flex">
            <span className={`font-bold ${headingClass} mr-2 min-w-[1.5rem]`}>{numberedMatch[1]}.</span>
            <span>{renderInlineBold(numberedMatch[2])}</span>
          </div>
        );
      }

      const bulletMatch = trimmed.match(/^[\-•\*]\s+(.+)$/);
      if (bulletMatch) {
        return (
          <div key={key} className="ml-4 my-1 text-sm text-gray-800 flex gap-2">
            <span className={`${bulletColor} font-bold`}>•</span>
            <span>{renderTextWithLinks(bulletMatch[1])}</span>
          </div>
        );
      }

      return (
        <p key={key} className="text-sm leading-relaxed text-gray-800 mb-2">
          {renderTextWithLinks(trimmed)}
        </p>
      );
    });
  };

  // Render formatted content with tables, code, and YouTube
  const renderFormattedContent = (text, options = {}) => {
    if (!text) return null;

    const { headingClass = 'text-indigo-700', bulletColor = 'text-indigo-600' } = options;
    const tablePattern = /(\n\|[^\n]+\|[^\n]*(?:\n\|[-\s|:]+\|[^\n]*)+(?:\n\|[^\n]+\|[^\n]*)*)/g;
    const parts = text.split(tablePattern);
    
    return (
      <div>
        {parts.map((part, partIdx) => {
          if (tablePattern.test(part)) {
            return <div key={partIdx}>{renderTable(part)}</div>;
          }
          
          return <div key={partIdx}>{renderRegularContent(part, { headingClass, bulletColor })}</div>;
        })}
      </div>
    );
  };

  // Render regular content (non-table)
  const renderRegularContent = (text, { headingClass = 'text-indigo-700', bulletColor = 'text-indigo-600' } = {}) => {
    if (!text || text.trim().length === 0) return null;

    const segments = [];
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11}))/g;
    let lastIndex = 0;
    let match;

    const tempSegments = [];
    while ((match = codeRegex.exec(text)) !== null) {
      const [fullMatch, lang, code] = match;
      const before = text.slice(lastIndex, match.index);
      if (before.trim()) {
        tempSegments.push({ type: 'text', content: before });
      }
      tempSegments.push({ type: 'code', content: code, lang: lang || 'text' });
      lastIndex = match.index + fullMatch.length;
    }
    const after = text.slice(lastIndex);
    if (after.trim()) {
      tempSegments.push({ type: 'text', content: after });
    }

    const ytUrlsGlobal = new Set();
    tempSegments.forEach((segment) => {
      if (segment.type === 'text') {
        let segmentText = segment.content;
        let ytMatch;
        youtubeRegex.lastIndex = 0;
        while ((ytMatch = youtubeRegex.exec(segmentText)) !== null) {
          ytUrlsGlobal.add(ytMatch[0]);
        }
        segments.push({ type: 'text', content: segmentText });
      } else {
        segments.push(segment);
      }
    });
    
    ytUrlsGlobal.forEach((url) => {
      segments.push({ type: 'youtube', url });
    });

    return segments.map((segment, idx) => {
      if (segment.type === 'code') {
        return <CodeBlock key={`code-${idx}`} code={segment.content} lang={segment.lang} />;
      }
      if (segment.type === 'youtube') {
        return renderYouTubeEmbed(segment.url, `youtube-${idx}`);
      }
      return <div key={`text-${idx}`}>{renderLines(segment.content, idx, { headingClass, bulletColor })}</div>;
    });
  };

  return {
    CodeBlock,
    renderTable,
    renderYouTubeEmbed,
    renderFormattedContent,
    renderRegularContent,
  };
};
