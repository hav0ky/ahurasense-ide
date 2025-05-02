import React, { useEffect, useRef } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { X, Terminal as TerminalIcon, ChevronUp, ChevronDown } from 'lucide-react';

interface TerminalProps {
  logs: string[];
  isVisible: boolean;
  onToggleVisibility: () => void;
  onClear: () => void;
  height?: number | string;
}

export function Terminal({
  logs,
  isVisible,
  onToggleVisibility,
  onClear,
  height = 200
}: TerminalProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when logs update
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [logs]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-0 right-0 z-10 mb-4 mr-4">
        <button
          onClick={onToggleVisibility}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 p-2 rounded-md shadow-lg border border-gray-700 transition-colors"
          title="Show terminal"
        >
          <TerminalIcon size={16} />
          <span>Show Console</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col border-t border-gray-700 bg-gray-900"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div className="flex justify-between items-center px-3 py-1 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-300">Console</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-gray-200 p-1 rounded hover:bg-gray-700/50"
            title="Clear console"
          >
            <span className="text-xs">Clear</span>
          </button>
          <button
            onClick={onToggleVisibility}
            className="text-gray-400 hover:text-gray-200 p-1 rounded hover:bg-gray-700/50"
            title="Minimize console"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={onToggleVisibility}
            className="text-gray-400 hover:text-gray-200 p-1 rounded hover:bg-gray-700/50"
            title="Close console"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-2 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-gray-500 italic">No logs to display</div>
          ) : (
            logs.map((log, index) => {
              // Skip rendering empty logs or spinner indicators
              if (!log.trim() || /^[\s\/|\\-]+$/.test(log)) {
                return null;
              }
              
              // Determine log type by content for styling
              const isError = log.toLowerCase().includes('error') || 
                             log.toLowerCase().includes('fail') ||
                             log.toLowerCase().includes('err!') ||
                             log.toLowerCase().includes('missing');
                             
              const isWarning = log.toLowerCase().includes('warn') ||
                               log.toLowerCase().includes('deprecated');
                               
              const isSuccess = log.toLowerCase().includes('success') || 
                               log.toLowerCase().includes('ready') ||
                               log.toLowerCase().includes('done') ||
                               log.toLowerCase().includes('server started') ||
                               (log.toLowerCase().includes('added') && log.toLowerCase().includes('packages')) ||
                               log.toLowerCase().includes('local:');
              
              // Special styling for npm package installation summaries
              const isPackageSummary = log.includes('node_modules/') || 
                                      /\d+\.\d+\.\d+/.test(log); // Has a version number
              
              // Special styling for commands
              const isCommand = log.startsWith('$');
              
              return (
                <div 
                  key={index}
                  className={`whitespace-pre-wrap mb-1 ${
                    isError 
                      ? 'text-red-400'
                      : isWarning
                        ? 'text-yellow-400'
                        : isSuccess
                          ? 'text-green-400'
                          : isCommand
                            ? 'text-blue-400 font-bold'
                            : isPackageSummary
                              ? 'text-gray-500 text-xs'
                              : 'text-gray-300'
                  }`}
                >
                  {log}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}