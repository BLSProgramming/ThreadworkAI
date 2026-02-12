/**
 * Content formatting and parsing utilities
 */

export const parseMarkdownTable = (tableStr) => {
  const lines = tableStr.trim().split('\n').map(l => l.trim());
  if (lines.length < 3) return null;
  
  const headerLine = lines[0];
  const separator = lines[1];
  const dataLines = lines.slice(2);
  
  if (!separator.includes('-') || !separator.includes('|')) return null;
  
  const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
  const rows = dataLines.map(line => 
    line.split('|').map(cell => cell.trim()).filter(cell => cell)
  ).filter(row => row.length === headers.length);
  
  return { headers, rows };
};

export const parseSynthesisNew = (text) => {
  if (!text) return null;
  
  const hasNewFormat = text.includes('===REASONING===') || text.includes('===ANSWER===');
  
  if (hasNewFormat) {
    const reasoningMatch = text.match(/===REASONING===\s*([\s\S]*?)(?====ANSWER===|$)/i);
    const answerMatch = text.match(/===ANSWER===\s*([\s\S]*?)(?====TIPS===|$)/i);
    const tipsMatch = text.match(/===TIPS===\s*([\s\S]*?)$/i);
    
    return {
      reasoning: reasoningMatch ? reasoningMatch[1].trim() : '',
      answer: answerMatch ? answerMatch[1].trim() : '',
      tips: tipsMatch ? tipsMatch[1].trim() : '',
      format: 'new',
    };
  }
  
  return null;
};

export const parseReasoningSections = (text) => {
  if (!text) return null;
  
  const consensusMatch = text.match(/\*\*Consensus\*\*[^•\n]*\n?([\s\S]*?)(?=\*\*Conflicts?\*\*|\*\*Checks?\*\*|$)/i);
  const conflictsMatch = text.match(/\*\*Conflicts?\*\*[^•\n]*\n?([\s\S]*?)(?=\*\*Checks?\*\*|$)/i);
  const checksMatch = text.match(/\*\*Checks?\*\*[^•\n]*\n?([\s\S]*?)$/i);
  
  const consensus = consensusMatch ? consensusMatch[1].trim() : '';
  const conflicts = conflictsMatch ? conflictsMatch[1].trim() : '';
  const checks = checksMatch ? checksMatch[1].trim() : '';
  
  if (!consensus && !conflicts && !checks) return null;
  
  return { consensus, conflicts, checks };
};

export const extractYouTubeId = (url) => {
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

export const MODEL_OPTIONS = [
  { key: 'deepseek', label: 'DeepSeek', tags: ['Reasoning', 'Coding', 'Math', 'Long Context'] },
  { key: 'llama', label: 'Llama', tags: ['Fast', 'General', 'Lightweight'] },
  { key: 'glm', label: 'GLM-4.6', tags: ['Multilingual', 'Reasoning', 'Coding'] },
  { key: 'qwen', label: 'Qwen', tags: ['Coding', 'Reasoning', 'Tools'] },
  { key: 'essential', label: 'Essential', tags: ['Creative', 'Writing', 'General'] },
  { key: 'moonshot', label: 'Moonshot', tags: ['Long Reasoning', 'Planning', 'Multilingual'] },
];

export const MODEL_STYLES = {
  deepseek: {
    key: 'deepseek',
    title: 'DeepSeek',
    container: 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200',
    heading: 'text-blue-700',
    collapse: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  },
  llama: {
    key: 'llama',
    title: 'Llama',
    container: 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200',
    heading: 'text-purple-700',
    collapse: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
  },
  glm: {
    key: 'glm',
    title: 'GLM-4.6',
    container: 'bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200',
    heading: 'text-cyan-700',
    collapse: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
  },
  qwen: {
    key: 'qwen',
    title: 'Qwen',
    container: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200',
    heading: 'text-emerald-700',
    collapse: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  },
  essential: {
    key: 'essential',
    title: 'Essential',
    container: 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200',
    heading: 'text-orange-700',
    collapse: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
  },
  moonshot: {
    key: 'moonshot',
    title: 'Moonshot',
    container: 'bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200',
    heading: 'text-pink-700',
    collapse: 'bg-pink-50 text-pink-700 hover:bg-pink-100',
  },
};

export const INITIAL_MODELS_STATE = {
  deepseek: true,
  llama: true,
  glm: true,
  qwen: true,
  essential: true,
  moonshot: true,
};
