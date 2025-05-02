import React, { useState, useEffect, memo } from 'react';
import Editor from '@monaco-editor/react';
import { FileItem } from '../types';
import { Loader } from './Loader';
import { FileText, FileCode, Code, Layers } from 'lucide-react';

interface CodeEditorProps {
  file: FileItem | null;
}

export const CodeEditor = memo(function CodeEditor({ file }: CodeEditorProps) {
  const [language, setLanguage] = useState<string>('typescript');
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Determine language based on file extension
  useEffect(() => {
    if (file?.name) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      switch(extension) {
        case 'js':
          setLanguage('javascript');
          break;
        case 'jsx':
          setLanguage('javascript');
          break;
        case 'ts':
          setLanguage('typescript');
          break;
        case 'tsx':
          setLanguage('typescript');
          break;
        case 'html':
          setLanguage('html');
          break;
        case 'css':
          setLanguage('css');
          break;
        case 'json':
          setLanguage('json');
          break;
        case 'md':
          setLanguage('markdown');
          break;
        default:
          setLanguage('plaintext');
      }
    }
  }, [file]);

  function handleEditorDidMount() {
    setIsEditorReady(true);
  }

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6">
        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-gray-300 text-lg font-medium mb-2">No File Selected</h3>
        <p className="text-center text-gray-500 max-w-md text-sm">
          Select a file from the file explorer to view and edit its contents
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* File path display */}
      <div className="bg-gray-900/70 border-b border-gray-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-400 overflow-x-auto scrollbar-hide">
          <FileCode className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="text-gray-300 font-mono">{file.path}</span>
        </div>
        <div className="flex items-center">
          <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-indigo-400 font-mono">
            {language}
          </span>
        </div>
      </div>
      
      {/* Editor */}
      <div className="flex-1 relative">
        {!isEditorReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
            <Loader />
          </div>
        )}
        
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={file.content || ''}
          options={{
            readOnly: true,
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            renderLineHighlight: 'all',
            lineNumbers: 'on',
            lineDecorationsWidth: 10,
            suggestFontSize: 14,
            fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, "Courier New", monospace',
            fontLigatures: true,
            padding: { top: 16 }
          }}
          onMount={handleEditorDidMount}
          loading={<Loader />}
        />
      </div>
    </div>
  );
});