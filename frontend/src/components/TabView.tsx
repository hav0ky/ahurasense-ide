import React from 'react';
import { Code2, Eye, Play, LayoutTemplate, Settings2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

interface TabViewProps {
  activeTab: 'code' | 'preview';
  onTabChange: (tab: 'code' | 'preview') => void;
}

export function TabView({ activeTab, onTabChange }: TabViewProps) {
  return (
    <div className="flex justify-between items-center w-full">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => onTabChange(value as 'code' | 'preview')} className="w-full">
        <TabsList className="bg-gray-900/50 border border-gray-700/50 p-1 rounded-lg">
          <TabsTrigger value="code" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">Editor</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex space-x-1">
        <button 
          className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-md transition-colors"
          title="Toggle layout"
        >
          <LayoutTemplate className="w-4 h-4" />
        </button>
        <button 
          className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-md transition-colors"
          title="Settings"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}