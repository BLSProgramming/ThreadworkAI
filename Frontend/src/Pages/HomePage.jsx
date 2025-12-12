import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import { HiLightningBolt } from '../assets/Icons';
import Collapsible from '../Components/Collapsible';
import { streamChat } from '../utils/streamChat';

function HomePage() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedModels, setSelectedModels] = useState({
    deepseek: true,
    llama: true,
    glm: true,
    qwen: true,
    essential: false,
    moonshot: false,
  });
  const [modelSearch, setModelSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const messagesEndRef = useRef(null);
  const pendingChatRef = useRef(null);
  const isLoadingChatRef = useRef(false);
  const currentAbortRef = useRef(null);

  const modelOptions = useMemo(() => [
    { key: 'deepseek', label: 'DeepSeek', tags: ['Reasoning', 'Coding', 'Math', 'Long Context'] },
    { key: 'llama', label: 'Llama', tags: ['Fast', 'General', 'Lightweight'] },
    { key: 'glm', label: 'GLM-4.6', tags: ['Multilingual', 'Reasoning', 'Coding'] },
    { key: 'qwen', label: 'Qwen', tags: ['Coding', 'Reasoning', 'Tools'] },
    { key: 'essential', label: 'Essential', tags: ['Creative', 'Writing', 'General'] },
    { key: 'moonshot', label: 'Moonshot', tags: ['Long Reasoning', 'Planning', 'Multilingual'] },
  ], []);

  const allTags = useMemo(() => {
    const set = new Set();
    modelOptions.forEach((m) => (m.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [modelOptions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Inline CodeBlock component for copy UX per block with syntax highlighting
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

  // Parse reasoning into subsections: Consensus, Conflicts, Evidence & Checks
  const parseReasoningSubsections = (text) => {
    const subsections = [];
    
    // Extract Consensus
    const consensusMatch = text.match(/1\)\s*Consensus([\s\S]*?)(?=2\)|$)/i);
    if (consensusMatch) {
      subsections.push({
        title: 'Consensus',
        content: consensusMatch[1].trim(),
        icon: '✓',
      });
    }
    
    // Extract Conflicts
    const conflictsMatch = text.match(/2\)\s*Conflicts([\s\S]*?)(?=3\)|$)/i);
    if (conflictsMatch) {
      subsections.push({
        title: 'Conflicts',
        content: conflictsMatch[1].trim(),
        icon: '⚡',
      });
    }
    
    // Extract Evidence & Checks
    const evidenceMatch = text.match(/3\)\s*Evidence\s*&\s*Checks([\s\S]*?)(?=4\)|$|VERDICT)/i);
    if (evidenceMatch) {
      subsections.push({
        title: 'Evidence & Checks',
        content: evidenceMatch[1].trim(),
        icon: '🔍',
      });
    }
    
    return subsections.length > 0 ? subsections : null;
  };

  // Render reasoning with collapsible subsections
  const renderReasoningWithSubsections = (text, styleConfig) => {
    const subsections = parseReasoningSubsections(text);
    if (!subsections) {
      return renderFormattedContent(text, styleConfig);
    }
    
    return (
      <div className="space-y-3">
        {subsections.map((subsection, idx) => (
          <div key={idx} className="bg-white border border-purple-300 rounded-lg overflow-hidden">
            <Collapsible
              defaultOpen={false}
              titleClassName="px-4 py-3 text-xs font-bold text-purple-700 uppercase tracking-wider"
              title={
                <span className="flex items-center gap-2">
                  {subsection.icon} {subsection.title}
                </span>
              }
              showCollapseButton={true}
              collapseButtonClassName="bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg"
            >
              <div className="px-4 pb-4 pt-2 space-y-3 bg-purple-50">
                {renderFormattedContent(subsection.content, styleConfig)}
              </div>
            </Collapsible>
          </div>
        ))}
      </div>
    );
  };

  // Parse synthesis output into structured sections
  const parseSynthesis = (text) => {
    if (!text) return null;
    
    // Check if this looks like synthesis output with REASONING/VERDICT
    const hasReasoningSection = /^REASONING/im.test(text);
    const hasVerdictSection = /^VERDICT/im.test(text);
    
    if (!hasReasoningSection && !hasVerdictSection) {
      return null; // Not a synthesis output
    }
    
    // Split into sections
    const reasoningMatch = text.match(/REASONING\s*\n([\s\S]*?)(?=VERDICT|$)/i);
    const verdictMatch = text.match(/VERDICT\s*\n([\s\S]*?)$/i);
    
    return {
      reasoning: reasoningMatch ? reasoningMatch[1].trim() : '',
      verdict: verdictMatch ? verdictMatch[1].trim() : '',
    };
  };

  // Render synthesis with distinct section styling as separate collapsible cards
  const renderSynthesis = (text) => {
    const sections = parseSynthesis(text);
    if (!sections) {
      return renderFormattedContent(text);
    }
    
    return (
      <div className="space-y-4">
        {sections.reasoning && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg shadow-sm overflow-hidden">
            <Collapsible
              defaultOpen={false}
              titleClassName="px-4 py-3 text-xs font-bold text-purple-700 uppercase tracking-wider"
              title={
                <span className="flex items-center gap-2">
                  🧠 Reasoning & Analysis
                </span>
              }
              showCollapseButton={true}
              collapseButtonClassName="bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg"
            >
              <div className="px-4 pb-4 pt-2 space-y-4 text-gray-700">
                {renderReasoningWithSubsections(sections.reasoning, {
                  headingClass: 'text-purple-700',
                  bulletColor: 'text-purple-600',
                })}
              </div>
            </Collapsible>
          </div>
        )}
        
        {sections.verdict && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-emerald-200 bg-emerald-100">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                ✓ Final Answer
              </span>
            </div>
            <div className="px-4 py-4 space-y-4 text-gray-800">
              {renderFormattedContent(sections.verdict, {
                headingClass: 'text-emerald-700',
                bulletColor: 'text-emerald-600',
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Parse markdown tables into structured data
  const parseMarkdownTable = (tableStr) => {
    const lines = tableStr.trim().split('\n').map(l => l.trim());
    if (lines.length < 3) return null;
    
    // Extract header
    const headerLine = lines[0];
    const separator = lines[1];
    const dataLines = lines.slice(2);
    
    // Check if valid table (separator should contain dashes and pipes)
    if (!separator.includes('-') || !separator.includes('|')) return null;
    
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
    const rows = dataLines.map(line => 
      line.split('|').map(cell => cell.trim()).filter(cell => cell)
    ).filter(row => row.length === headers.length);
    
    return { headers, rows };
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

  // Render text with headings, lists, inline bold, links, YouTube embeds, tables, and fenced code blocks
  const renderFormattedContent = (text, { headingClass = 'text-indigo-700', bulletColor = 'text-indigo-600' } = {}) => {
    if (!text) return null;

    // Split text by tables first (markdown table pattern)
    const tablePattern = /(\n\|[^\n]+\|[^\n]*(?:\n\|[-\s|:]+\|[^\n]*)+(?:\n\|[^\n]+\|[^\n]*)*)/g;
    const parts = text.split(tablePattern);
    
    return (
      <div>
        {parts.map((part, partIdx) => {
          // Check if this part is a table
          if (tablePattern.test(part)) {
            return <div key={partIdx}>{renderTable(part)}</div>;
          }
          
          // Otherwise, process as regular formatted content
          return (
            <div key={partIdx}>
              {renderRegularContent(part, { headingClass, bulletColor })}
            </div>
          );
        })}
      </div>
    );
  };

  // Render regular (non-table) formatted content
  const renderRegularContent = (text, { headingClass = 'text-indigo-700', bulletColor = 'text-indigo-600' } = {}) => {
    if (!text || text.trim().length === 0) return null;

    const extractYouTubeId = (url) => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/,
        /youtube\.com\/embed\/([\w-]{11})/,
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
      return null;
    };

    const renderInlineBold = (str) => {
      const parts = str.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`bold-${i}`}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    const renderTextWithLinks = (str) => {
      // First handle markdown links [text](url)
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
      
      // If no markdown links found, treat entire string as text
      if (withMarkdownLinks.length === 0) {
        withMarkdownLinks.push({ type: 'text', content: str });
      }
      
      // Now handle plain URLs in text segments
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
          // Handle plain URLs in text
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

    const renderLines = (block, blockIndex) => {
      const lines = block.split('\n');
      return lines.map((line, idx) => {
        const key = `${blockIndex}-${idx}`;
        const trimmed = line.trim();
        if (!trimmed) return <div key={key} className="h-2" />;

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

    const renderCodeBlock = (code, lang = 'text', key) => <CodeBlock key={key} code={code} lang={lang} />;

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

    const segments = [];
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11}))/g;
    let lastIndex = 0;
    let match;

    // First pass: extract code blocks
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

    // Second pass: extract YouTube links from text segments but keep them in text too
    const ytUrlsGlobal = new Set();
    tempSegments.forEach((segment) => {
      if (segment.type === 'text') {
        let segmentText = segment.content;
        let ytMatch;
        youtubeRegex.lastIndex = 0;
        while ((ytMatch = youtubeRegex.exec(segmentText)) !== null) {
          ytUrlsGlobal.add(ytMatch[0]);
        }
        // Keep the text segment intact (with URLs as clickable links)
        segments.push({ type: 'text', content: segmentText });
      } else {
        segments.push(segment);
      }
    });
    
    // Add all YouTube embeds at the end to avoid duplicates
    ytUrlsGlobal.forEach((url) => {
      segments.push({ type: 'youtube', url });
    });

    return segments.map((segment, idx) => {
      if (segment.type === 'code') {
        return renderCodeBlock(segment.content, segment.lang, `code-${idx}`);
      }
      if (segment.type === 'youtube') {
        return renderYouTubeEmbed(segment.url, `youtube-${idx}`);
      }
      return <div key={`text-${idx}`}>{renderLines(segment.content, idx)}</div>;
    });
  };

  const persistChats = (updater) => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    const updated = updater(chats);
    localStorage.setItem('chats', JSON.stringify(updated));
    window.dispatchEvent(new Event('chats-updated'));
    return updated;
  };

  // Helper function to format chat data for PostgreSQL storage
  const formatChatForDatabase = (chatId, title, messages) => {
    return {
      chat_id: chatId,
      title: title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: messages.map(msg => {
        if (msg.sender === 'user') {
          return {
            message_id: msg.id.toString(),
            sender: 'user',
            user_prompt: msg.text,
            created_at: new Date().toISOString()
          };
        } else {
          // Convert allResponses object to array and map to model1-4
          const responses = msg.allResponses ? Object.values(msg.allResponses) : [];
          const modelNames = msg.allResponses ? Object.keys(msg.allResponses) : [];
          
          return {
            message_id: msg.id.toString(),
            sender: 'bot',
            user_prompt: null,
            synthesized_response: msg.text,
            model1_name: modelNames[0] || null,
            model1_response: responses[0] || null,
            model2_name: modelNames[1] || null,
            model2_response: responses[1] || null,
            model3_name: modelNames[2] || null,
            model3_response: responses[2] || null,
            model4_name: modelNames[3] || null,
            model4_response: responses[3] || null,
            created_at: new Date().toISOString()
          };
        }
      })
    };
  };

  // Function to save chat to database (ready for backend integration)
  const saveChatToDatabase = async (chatId) => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    const chat = chats.find(c => c.id === chatId);
    
    if (!chat) return;

    const dbPayload = formatChatForDatabase(chat.id, chat.title, chat.messages);
    
    // Store formatted data in localStorage for now (ready for API call)
    const dbChats = JSON.parse(localStorage.getItem('dbChats') || '[]');
    const existingIndex = dbChats.findIndex(c => c.chat_id === chatId);
    
    if (existingIndex !== -1) {
      dbChats[existingIndex] = dbPayload;
    } else {
      dbChats.push(dbPayload);
    }
    
    localStorage.setItem('dbChats', JSON.stringify(dbChats));
    
    // When backend is ready, uncomment this:
    /*
    try {
      await fetch('/api/chats/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload)
      });
    } catch (error) {
      console.error('Failed to save chat to database:', error);
    }
    */
  };

  useEffect(() => {
    isLoadingChatRef.current = true;
    if (chatId) {
      const chats = JSON.parse(localStorage.getItem('chats') || '[]');
      const currentChat = chats.find((chat) => chat.id === chatId);
      if (currentChat && currentChat.messages) {
        setMessages(currentChat.messages);
      } else {
        setMessages([]);
      }
      pendingChatRef.current = null;
    } else {
      setMessages([]);
    }
    setTimeout(() => {
      isLoadingChatRef.current = false;
    }, 100);
  }, [chatId]);

  // Auto-scroll and syntax highlighting on message updates
  useEffect(() => {
    const scrollTimer = setTimeout(() => scrollToBottom(), 50);
    const highlightTimer = setTimeout(() => Prism.highlightAll(), 0);
    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(highlightTimer);
    };
  }, [messages]);

  useEffect(() => {
    if (chatId && messages.length > 0 && !isLoadingChatRef.current) {
      persistChats((chats) => {
        const chatIndex = chats.findIndex((chat) => chat.id === chatId);
        if (chatIndex !== -1) {
          chats[chatIndex].messages = messages;
        }
        return chats;
      });
      
      // Save formatted chat data for database
      saveChatToDatabase(chatId);
    }
  }, [messages, chatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const activeModels = modelOptions
      .filter((opt) => selectedModels[opt.key])
      .map((opt) => opt.key);

    if (!activeModels.length) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    const nextMessages = [...messages, userMessage];
    const savedInput = input;

    let currentChatId = chatId;
    if (!chatId) {
      const newChatId = `chat-${Date.now()}`;
      currentChatId = newChatId;
      pendingChatRef.current = { id: newChatId, userMessage: nextMessages };

      const chats = JSON.parse(localStorage.getItem('chats') || '[]');
      const newChat = {
        id: newChatId,
        title: input.substring(0, 30) || 'New Chat',
        createdAt: new Date().toISOString(),
        messages: nextMessages,
      };
      chats.unshift(newChat);
      localStorage.setItem('chats', JSON.stringify(chats));
      setTimeout(() => {
        window.dispatchEvent(new Event('chats-updated'));
      }, 0);
      navigate(`/chat/${newChatId}`);
    } else {
      setMessages(nextMessages);
      persistChats((chats) => {
        const chatIndex = chats.findIndex((chat) => chat.id === currentChatId);
        if (chatIndex !== -1) {
          const chat = chats[chatIndex];
          chat.messages = nextMessages;
          if (!chat.title || chat.title === 'New Chat') {
            chat.title = userMessage.text.substring(0, 30) || 'New Chat';
          }
        }
        return chats;
      });
    }

    setInput('');
    setIsLoading(true);
    // Setup abort controller for this stream
    if (currentAbortRef.current) {
      try { currentAbortRef.current.abort(); } catch {}
    }
    const abortController = new AbortController();
    currentAbortRef.current = abortController;

    // Timings
    const startTs = performance.now();
    let firstModelMs = null;
    let synthesisMs = null;

    // Collect all responses as they stream in
    const allResponses = {};
    let synthesisResponse = null;

    try {
      await streamChat(
        savedInput,
        activeModels,
        // onModelResponse - handle each model response as it arrives
        (modelData) => {
          const { model, response } = modelData;
          allResponses[model.toLowerCase()] = response;

          if (firstModelMs === null) {
            firstModelMs = performance.now() - startTs;
          }

          // Update messages with streaming responses
          setMessages((currentMessages) => {
            const existingBotMessage = currentMessages.find(
              (m) => m.sender === 'bot' && m.id === userMessage.id + 1
            );

            if (existingBotMessage) {
              // Update existing bot message with new responses
              return currentMessages.map((m) =>
                m.id === existingBotMessage.id
                  ? {
                      ...m,
                      allResponses: { ...m.allResponses, ...allResponses },
                    }
                  : m
              );
            } else {
              // Create new bot message
              const newBotMessage = {
                id: userMessage.id + 1,
                text: synthesisResponse || `Received response from ${model}...`,
                sender: 'bot',
                model: 'Threadwork AI',
                allResponses: allResponses,
              };
              return [...currentMessages, newBotMessage];
            }
          });
        },
        // onSynthesis - handle synthesis response when it arrives
        (synthesisData) => {
          const { response } = synthesisData;
          synthesisResponse = response;
          synthesisMs = performance.now() - startTs;

          setMessages((currentMessages) => {
            return currentMessages.map((m) =>
              m.sender === 'bot' && m.id === userMessage.id + 1
                ? {
                    ...m,
                    text: response,
                    allResponses: allResponses,
                  }
                : m
            );
          });
        },
        // onDone - stream complete
        () => {
          setIsLoading(false);
          setMessages((currentMessages) => {
            const merged = currentMessages;
            persistChats((chats) => {
              const chatIndex = chats.findIndex((chat) => chat.id === currentChatId);
              if (chatIndex !== -1) {
                chats[chatIndex].messages = merged;
              }
              return chats;
            });
            saveChatToDatabase(currentChatId);
            return merged;
          });
          // Attach timings to the latest bot message
          setMessages((current) => current.map((m) => {
            if (m.sender === 'bot' && m.id === userMessage.id + 1) {
              return { ...m, timings: {
                firstModelMs: firstModelMs,
                synthesisMs: synthesisMs,
                totalMs: performance.now() - startTs,
              }};
            }
            return m;
          }));
        },
        // onError - handle error
        (error) => {
          console.error('Stream error:', error);
          setIsLoading(false);
          const botMessage = { id: Date.now() + 1, text: 'Error: Could not get response', sender: 'bot' };
          setMessages((currentMessages) => {
            const merged = [...currentMessages, botMessage];
            persistChats((chats) => {
              const chatIndex = chats.findIndex((chat) => chat.id === currentChatId);
              if (chatIndex !== -1) {
                chats[chatIndex].messages = merged;
              }
              return chats;
            });
            saveChatToDatabase(currentChatId);
            return merged;
          });
        }
      , abortController.signal);
    } catch (err) {
      console.error('Chat error:', err);
      setIsLoading(false);
      const botMessage = { id: Date.now() + 1, text: 'Network error. Please try again.', sender: 'bot' };
      setMessages((currentMessages) => {
        const merged = [...currentMessages, botMessage];
        persistChats((chats) => {
          const chatIndex = chats.findIndex((chat) => chat.id === currentChatId);
          if (chatIndex !== -1) {
            chats[chatIndex].messages = merged;
          }
          return chats;
        });
        saveChatToDatabase(currentChatId);
        return merged;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelStream = () => {
    try {
      if (currentAbortRef.current) {
        currentAbortRef.current.abort();
        currentAbortRef.current = null;
        setIsLoading(false);
      }
    } catch {}
  };

  const lastBotId = [...messages].reverse().find((m) => m.sender === 'bot')?.id;
  const filteredModels = modelOptions.filter((opt) =>
    opt.label.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <>
      {/* Sticky Model Selection Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">Active Models:</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(selectedModels)
                .filter(([_, selected]) => selected)
                .map(([key, _]) => {
                  const model = modelOptions.find(m => m.key === key);
                  return (
                    <span
                      key={key}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                    >
                      {model?.label}
                    </span>
                  );
                })}
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <span className="text-sm font-medium text-indigo-700">{Object.values(selectedModels).filter(Boolean).length}/4</span>
              <svg className={`w-4 h-4 text-indigo-700 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {showModelDropdown && (
              <div className="absolute right-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-200">
                  <input
                    type="text"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder="Search models..."
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="p-3 border-b border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => {
                      const active = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setSelectedTags((prev) =>
                              prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                            )
                          }
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                            active
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                    {selectedTags.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedTags([])}
                        className="px-2.5 py-1 rounded-full text-xs font-medium text-gray-600 border border-gray-300 hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {modelOptions
                    .filter((opt) => {
                      const matchText = opt.label.toLowerCase().includes(modelSearch.toLowerCase());
                      const matchTags =
                        selectedTags.length === 0 || (opt.tags && selectedTags.some((t) => opt.tags.includes(t)));
                      return matchText && matchTags;
                    })
                    .map((opt) => {
                      const currentSelected = Object.values(selectedModels).filter(Boolean).length;
                      const isCurrentlySelected = selectedModels[opt.key];
                      const isMaxed = currentSelected >= 4 && !isCurrentlySelected;

                      return (
                        <div
                          key={opt.key}
                          className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 ${isMaxed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}
                          onClick={() => {
                            if (isCurrentlySelected || currentSelected < 4) {
                              setSelectedModels((prev) => ({ ...prev, [opt.key]: !prev[opt.key] }));
                            }
                          }}
                        >
                          <div className="pr-3">
                            <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(opt.tags || []).map((tag) => (
                                <span
                                  key={`${opt.key}-${tag}`}
                                  className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-700 border border-gray-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={!!selectedModels[opt.key]}
                            onChange={() => {}}
                            disabled={isMaxed}
                            className={`w-4 h-4 text-indigo-600 rounded ${isMaxed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      );
                    })}
                  {modelOptions.filter((opt) => {
                    const matchText = opt.label.toLowerCase().includes(modelSearch.toLowerCase());
                    const matchTags = selectedTags.length === 0 || (opt.tags && selectedTags.some((t) => opt.tags.includes(t)));
                    return matchText && matchTags;
                  }).length === 0 && (
                    <div className="text-center py-6 text-sm text-gray-500">
                      No models match your search and tag filters
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-3 py-6 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Threadwork AI</p>
              <h1 className="text-2xl font-semibold text-gray-900">Multi-model copilot</h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">Synthesized answers</span>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <HiLightningBolt className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to assist you</h2>
              <p className="text-gray-600 max-w-md mb-8">
                Ask me anything and get responses from multiple AI models, synthesized into one comprehensive answer
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">✨ Better answers</p>
                  <p className="text-xs text-gray-600">Synthesized final response</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">🔍 Compare models</p>
                  <p className="text-xs text-gray-600">Side-by-side context</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">🎯 Multiple models</p>
                  <p className="text-xs text-gray-600">Select models above</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="mb-6">
                  {message.sender === 'user' ? (
                    <div className="flex justify-end items-end gap-3">
                      <div className="max-w-2xl bg-indigo-600 text-white rounded-xl rounded-br-none px-4 py-3 shadow-sm">
                        <p className="text-sm leading-relaxed break-words">{message.text}</p>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex-shrink-0 mb-1">
                        👤
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-6">
                      {message.allResponses && Object.keys(message.allResponses || {}).length > 0 && (
                        <div className="flex-[0.75] max-w-xl space-y-4">
                          {[
                            {
                              key: 'deepseek',
                              title: 'DeepSeek',
                              container: 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200',
                              heading: 'text-blue-700',
                              collapse: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
                            },
                            {
                              key: 'llama',
                              title: 'Llama',
                              container: 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200',
                              heading: 'text-purple-700',
                              collapse: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
                            },
                            {
                              key: 'glm',
                              title: 'GLM-4.6',
                              container: 'bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200',
                              heading: 'text-cyan-700',
                              collapse: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
                            },
                            {
                              key: 'qwen',
                              title: 'Qwen',
                              container: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200',
                              heading: 'text-emerald-700',
                              collapse: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                            },
                            {
                              key: 'essential',
                              title: 'Essential',
                              container: 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200',
                              heading: 'text-orange-700',
                              collapse: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
                            },
                            {
                              key: 'moonshot',
                              title: 'Moonshot',
                              container: 'bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200',
                              heading: 'text-pink-700',
                              collapse: 'bg-pink-50 text-pink-700 hover:bg-pink-100',
                            },
                          ]
                            .filter((item) => message.allResponses[item.key])
                            .map((item) => (
                              <div
                                key={item.key}
                                className={`${item.container} rounded-xl shadow-sm overflow-hidden border-l-4 transition-shadow hover:shadow-md`}
                              >
                                <Collapsible
                                  defaultOpen={false}
                                  titleClassName={`px-4 py-3 text-xs font-bold ${item.heading} uppercase tracking-wider font-mono`}
                                  title={item.title}
                                  showCollapseButton={true}
                                  collapseButtonClassName={`${item.collapse} rounded-lg`}
                                >
                                  <div className="px-4 pb-4 pt-2 space-y-3 text-sm text-gray-900">
                                    {renderFormattedContent(message.allResponses[item.key] || 'No response', {
                                      headingClass: item.heading,
                                      bulletColor: item.heading,
                                    })}
                                  </div>
                                </Collapsible>
                              </div>
                            ))}
                        </div>
                      )}

                      <div className="flex-[2.25]">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 rounded-xl rounded-bl-none h-fit shadow-sm" key={`detail-${message.id}`}>
                          <Collapsible
                            defaultOpen={message.id === lastBotId}
                            titleClassName="px-4 py-3 text-xs font-bold text-indigo-700 uppercase tracking-wider font-mono"
                            title={<span className="flex items-center gap-3">
                              <span className="text-emerald-600">✓</span>
                              {message.model ? message.model : 'Threadwork AI'}
                              {message.timings && (
                                <span className="ml-auto flex items-center gap-2 text-[10px] text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                  <span>first: {Math.round(message.timings.firstModelMs)}ms</span>
                                  <span>syn: {Math.round(message.timings.synthesisMs || 0)}ms</span>
                                  <span>total: {Math.round(message.timings.totalMs)}ms</span>
                                </span>
                              )}
                            </span>}
                            showCollapseButton={true}
                            collapseButtonClassName="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg font-semibold"
                          >
                            <div className="px-4 pb-4 pt-2 space-y-3 text-sm text-gray-800">
                              {renderSynthesis(message.text || 'No response')}
                            </div>
                          </Collapsible>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 px-4 py-3 rounded-xl rounded-bl-none shadow-sm">
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-gray-600 font-medium">Generating response</span>
                      <div className="flex gap-1.5 ml-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Send
            </button>
            {isLoading && (
              <button
                type="button"
                onClick={handleCancelStream}
                className="px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default HomePage;