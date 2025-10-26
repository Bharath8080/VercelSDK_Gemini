'use client';
import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';

// Enhanced SVG Icons
const SparklesIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M19 12l.75 2.25L22 15l-2.25.75L19 18l-.75-2.25L16 15l2.25-.75L19 12z" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const ThumbsUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
  </svg>
);

const ThumbsDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L14 22h0a3.13 3.13 0 0 1-3-3.88Z"/>
  </svg>
);

// Markdown parser
const parseMarkdown = (text: string) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements: React.ReactElement[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableLines = [];
      let j = i;
      
      while (j < lines.length && lines[j].includes('|')) {
        tableLines.push(lines[j]);
        j++;
      }
      
      if (tableLines.length > 2) {
        elements.push(renderTable(tableLines, key++));
        i = j;
        continue;
      }
    }
    
    if (line.trim().startsWith('####')) {
      const content = line.trim().substring(4).trim();
      elements.push(
        <h4 key={key++} className="text-base font-semibold text-white mt-4 mb-2">
          {parseInlineBold(content)}
        </h4>
      );
    } else if (line.trim().startsWith('###')) {
      const content = line.trim().substring(3).trim();
      elements.push(
        <h3 key={key++} className="text-lg font-semibold text-white mt-5 mb-2">
          {parseInlineBold(content)}
        </h3>
      );
    } else if (line.trim().startsWith('---')) {
      elements.push(
        <hr key={key++} className="border-zinc-700/50 my-4" />
      );
    } else if (line.trim().startsWith('* ')) {
      const content = line.trim().substring(2);
      elements.push(
        <div key={key++} className="flex gap-2 ml-0 my-1.5">
          <span className="text-zinc-400 mt-1 flex-shrink-0 text-sm">•</span>
          <span className="flex-1 text-sm">{parseInlineBold(content)}</span>
        </div>
      );
    } else if (line.trim()) {
      elements.push(
        <div key={key++} className="my-1 leading-relaxed text-sm">
          {parseInlineBold(line)}
        </div>
      );
    } else {
      elements.push(<div key={key++} className="h-2" />);
    }
    
    i++;
  }

  return elements;
};

const renderTable = (tableLines: string[], key: number) => {
  const rows = tableLines.map(line => 
    line.split('|').map(cell => cell.trim()).filter(cell => cell)
  );
  
  if (rows.length < 2) return null;
  
  const headers = rows[0];
  const dataRows = rows.slice(2);
  
  return (
    <div key={key} className="overflow-x-auto my-4 rounded-lg border border-zinc-800">
      <table className="min-w-full">
        <thead className="bg-zinc-800/50">
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="px-4 py-2 text-left text-xs font-semibold text-white border-b border-zinc-700">
                {parseInlineBold(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-zinc-900/30">
          {dataRows.map((row, i) => (
            <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 text-xs text-zinc-300">
                  {parseInlineBold(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const parseInlineBold = (text: string): (React.ReactElement | string)[] | string => {
  const parts: (React.ReactElement | string)[] = [];
  let currentText = '';
  let i = 0;
  let key = 0;

  while (i < text.length) {
    if (text[i] === '*' && text[i + 1] === '*') {
      if (currentText) {
        parts.push(<span key={key++}>{currentText}</span>);
        currentText = '';
      }
      
      let j = i + 2;
      let boldText = '';
      while (j < text.length - 1 && !(text[j] === '*' && text[j + 1] === '*')) {
        boldText += text[j];
        j++;
      }
      
      if (j < text.length - 1) {
        parts.push(<strong key={key++} className="font-semibold text-white">{boldText}</strong>);
        i = j + 2;
      } else {
        currentText += text[i];
        i++;
      }
    } else {
      currentText += text[i];
      i++;
    }
  }

  if (currentText) {
    parts.push(<span key={key++}>{currentText}</span>);
  }

  return parts.length > 0 ? parts : text;
};

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { messages, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 hover:bg-zinc-800/50 rounded-lg transition-all">
              <MenuIcon />
            </button>
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <SparklesIcon className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">
                Gemini Pro
              </h1>
            </div>
          </div>
          <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-all">
            <PlusIcon />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <SparklesIcon className="text-white w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                Hello! How can I help?
              </h2>
              <p className="text-zinc-400 text-sm max-w-md">
                I'm your AI assistant. Ask me anything and let's have a great conversation.
              </p>
              
              {/* Suggestion chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10 w-full max-w-2xl">
                {[
                  { icon: '💡', text: 'Explain quantum computing' },
                  { icon: '✨', text: 'Write a creative story' },
                  { icon: '🚀', text: 'Plan a project' },
                  { icon: '🎨', text: 'Design inspiration' }
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(chip.text)}
                    className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{chip.icon}</span>
                      <span className="text-zinc-300 text-sm">
                        {chip.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m, idx) => (
                <div key={m.id} className="flex flex-col gap-2">
                  {m.role === 'user' ? (
                    // User message - right aligned bubble
                    <div className="flex justify-end">
                      <div className="max-w-[80%]">
                        <div className="bg-blue-600 text-white rounded-3xl px-5 py-3 inline-block">
                          <div className="text-sm leading-relaxed">
                            {m.parts.map((p, i) => {
                              if (p.type === 'text') {
                                return <span key={i}>{p.text}</span>;
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Assistant message - left aligned with avatar
                    <div className="flex gap-3 items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                          <SparklesIcon className="text-white w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-zinc-200 leading-relaxed">
                          {m.parts.map((p, i) => {
                            if (p.type === 'text') {
                              return (
                                <div key={i}>
                                  {parseMarkdown(p.text)}
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                        {/* Action buttons */}
                        <div className="flex gap-2 mt-3">
                          <button className="p-2 hover:bg-zinc-800 rounded-lg transition-all" title="Copy">
                            <CopyIcon />
                          </button>
                          <button className="p-2 hover:bg-zinc-800 rounded-lg transition-all" title="Good response">
                            <ThumbsUpIcon />
                          </button>
                          <button className="p-2 hover:bg-zinc-800 rounded-lg transition-all" title="Bad response">
                            <ThumbsDownIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                    <SparklesIcon className="text-white w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-1.5 py-2">
                      <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-zinc-950 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                className="w-full px-4 py-3 bg-zinc-900 text-white border border-zinc-800 rounded-full focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all placeholder-zinc-500"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <SendIcon />
            </button>
          </div>
          <p className="text-xs text-zinc-600 text-center mt-3">
            Gemini can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
