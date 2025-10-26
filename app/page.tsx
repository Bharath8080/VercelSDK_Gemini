'use client';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

// Simple SVG Icons
const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

// Markdown parser for bold text, lists, headings, and tables
const parseMarkdown = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    
    // Check for tables (line with pipes)
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableLines = [];
      let j = i;
      
      // Collect all table lines
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
    
    // Check for headings
    if (line.trim().startsWith('####')) {
      const content = line.trim().substring(4).trim();
      elements.push(
        <h4 key={key++} className="text-lg font-bold text-white mt-4 mb-2">
          {parseInlineBold(content)}
        </h4>
      );
    } else if (line.trim().startsWith('###')) {
      const content = line.trim().substring(3).trim();
      elements.push(
        <h3 key={key++} className="text-xl font-bold text-white mt-5 mb-3">
          {parseInlineBold(content)}
        </h3>
      );
    } else if (line.trim().startsWith('---')) {
      // Horizontal rule
      elements.push(
        <hr key={key++} className="border-zinc-700 my-4" />
      );
    } else if (line.trim().startsWith('* ')) {
      // List item
      const content = line.trim().substring(2);
      elements.push(
        <div key={key++} className="flex gap-2 ml-4 my-1">
          <span className="text-blue-400 mt-1">•</span>
          <span>{parseInlineBold(content)}</span>
        </div>
      );
    } else if (line.trim()) {
      // Regular line with possible bold text
      elements.push(
        <div key={key++} className="my-2">
          {parseInlineBold(line)}
        </div>
      );
    } else {
      // Empty line
      elements.push(<div key={key++} className="h-2" />);
    }
    
    i++;
  }

  return elements;
};

// Render markdown table
const renderTable = (tableLines, key) => {
  const rows = tableLines.map(line => 
    line.split('|').map(cell => cell.trim()).filter(cell => cell)
  );
  
  if (rows.length < 2) return null;
  
  const headers = rows[0];
  const dataRows = rows.slice(2); // Skip header and separator line
  
  return (
    <div key={key} className="overflow-x-auto my-4">
      <table className="min-w-full border border-zinc-700 rounded-lg">
        <thead className="bg-zinc-800">
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="px-4 py-2 text-left text-sm font-semibold text-white border-b border-zinc-700">
                {parseInlineBold(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, i) => (
            <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-900">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 text-sm text-zinc-300">
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

// Parse inline bold text
const parseInlineBold = (text) => {
  const parts = [];
  let currentText = '';
  let i = 0;
  let key = 0;

  while (i < text.length) {
    if (text[i] === '*' && text[i + 1] === '*') {
      // Found bold marker
      if (currentText) {
        parts.push(<span key={key++}>{currentText}</span>);
        currentText = '';
      }
      
      // Find closing **
      let j = i + 2;
      let boldText = '';
      while (j < text.length - 1 && !(text[j] === '*' && text[j + 1] === '*')) {
        boldText += text[j];
        j++;
      }
      
      if (j < text.length - 1) {
        parts.push(<strong key={key++} className="font-bold text-white">{boldText}</strong>);
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
  const { messages, sendMessage } = useChat();

  const handleSend = () => {
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <SparklesIcon />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Gemini Chat</h1>
            <p className="text-xs text-zinc-400">Powered by Google AI</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                  <path d="M19 12l.75 2.25L22 15l-2.25.75L19 18l-.75-2.25L16 15l2.25-.75L19 12z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                How can I help you today?
              </h2>
              <p className="text-zinc-400">
                Ask me anything and I'll do my best to assist you
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <div key={m.id} className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {m.role === 'user' ? (
                      <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-white">
                        <UserIcon />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                        <SparklesIcon />
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white mb-2">
                      {m.role === 'user' ? 'You' : 'Gemini'}
                    </div>
                    <div className="text-zinc-300 leading-relaxed">
                      {m.parts.map((p, i) => {
                        if (p.type === 'text') {
                          return (
                            <div key={i}>
                              {parseMarkdown(p.text)}
                            </div>
                          );
                        }
                        // Hide step-start messages
                        if (typeof p === 'object' && p.type === 'step-start') {
                          return null;
                        }
                        return (
                          <div key={i} className="text-xs text-zinc-500 font-mono mt-2">
                            {JSON.stringify(p)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-zinc-900 border-t border-zinc-800 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-zinc-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <SendIcon />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          <p className="text-xs text-zinc-500 text-center mt-3">
            Gemini can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}