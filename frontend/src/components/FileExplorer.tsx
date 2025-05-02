import React, { useState, memo, useMemo } from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown, FileJson, FileText, FileType, Image } from 'lucide-react';
import { FileItem } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../lib/utils';

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
}

interface FileNodeProps {
  item: FileItem;
  depth: number;
  onFileClick: (file: FileItem) => void;
  isSelected?: boolean;
}

// Function to get the file icon based on file extension
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch(extension) {
    case 'json':
      return <FileJson className="w-4 h-4 text-yellow-400" />;
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode className="w-4 h-4 text-blue-400" />;
    case 'html':
      return <FileCode className="w-4 h-4 text-orange-400" />;
    case 'css':
      return <FileCode className="w-4 h-4 text-purple-400" />;
    case 'md':
      return <FileText className="w-4 h-4 text-green-400" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'svg':
      return <Image className="w-4 h-4 text-pink-400" />;
    default:
      return <FileType className="w-4 h-4 text-gray-400" />;
  }
};

const FileNode = memo(function FileNode({ item, depth, onFileClick, isSelected = false }: FileNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Default expanded for better UX

  const handleClick = () => {
    if (item.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(item);
    }
  };

  // Generate a gradient background for selected files
  const getBackgroundStyle = () => {
    if (!isSelected) return '';
    return 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-l-2 border-indigo-500';
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-1.5 md:gap-2 py-1 md:py-1.5 px-1.5 md:px-2 hover:bg-gray-800/50 rounded-md cursor-pointer transition-colors text-xs md:text-sm",
          isSelected && getBackgroundStyle()
        )}
        style={{ paddingLeft: `${depth * 0.75}rem` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-1.5 min-w-6">
          {item.type === 'folder' && (
            <span className="text-gray-400">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </span>
          )}
          
          {item.type === 'folder' ? (
            <Folder className="w-4 h-4 text-yellow-400" />
          ) : (
            getFileIcon(item.name)
          )}
        </div>
        
        <span className={cn(
          "text-sm transition-colors truncate",
          isSelected ? "text-white font-medium" : "text-gray-300"
        )}>
          {item.name}
        </span>
      </div>
      
      {item.type === 'folder' && isExpanded && item.children && (
        <div className="ml-1">
          {/* Sort children: folders first, then files, both alphabetically */}
          {[...item.children]
            .sort((a, b) => {
              // If types are different, folders come first
              if (a.type !== b.type) {
                return a.type === 'folder' ? -1 : 1;
              }
              // If types are the same, sort alphabetically by name
              return a.name.localeCompare(b.name);
            })
            .map((child, index) => (
              <FileNode
                key={`${child.path}-${index}`}
                item={child}
                depth={depth + 1}
                onFileClick={onFileClick}
                isSelected={false} // We only track selected files, not folders
              />
            ))
          }
        </div>
      )}
    </div>
  );
});

export const FileExplorer = memo(function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
    onFileSelect(file);
  };

  // Memoize sorted files to prevent unnecessary re-sorting
  const sortedFiles = useMemo(() => {
    // Sort files: folders first, then files, both alphabetically by name
    return [...files].sort((a, b) => {
      // If types are different, folders come first
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      
      // If types are the same, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }, [files]);

  return (
    <ScrollArea className="h-full px-2">
      <div className="py-2">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Folder className="w-10 h-10 text-gray-600 mb-2" />
            <p className="text-gray-400 text-sm">No files yet</p>
            <p className="text-gray-500 text-xs mt-1">Files will appear as they are created</p>
          </div>
        ) : (
          <div className="space-y-0.5 md:space-y-1">
            {sortedFiles.map((file, index) => (
              <FileNode
                key={`${file.path}-${index}`}
                item={file}
                depth={0}
                onFileClick={handleFileSelect}
                isSelected={selectedFile?.path === file.path}
              />
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
});