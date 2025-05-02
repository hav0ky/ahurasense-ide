import React from 'react';
import { Code2, Play, PanelLeft, Server } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';

interface TabViewProps {
  activeTab: 'code' | 'preview';
  onTabChange: (tab: 'code' | 'preview') => void;
  webcontainerReady?: boolean;
  toggleSteps?: () => void;
}

export function TabView({ activeTab, onTabChange, webcontainerReady, toggleSteps }: TabViewProps) {
  return (
    <div className="flex justify-between items-center w-full">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => onTabChange(value as 'code' | 'preview')} className="w-full">
        <TabsList className="bg-gray-900/50 border border-gray-700/50 p-1 rounded-md h-9">
          <TabsTrigger
            value="code"
            className="flex items-center gap-1.5 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 rounded-sm px-2 md:px-3 h-7"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Editor</span>
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="flex items-center gap-1.5 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 rounded-sm px-2 md:px-3 h-7"
          >
            <Play className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Preview</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Environment status indicator */}
        <div className="hidden md:flex items-center mr-2">
          {webcontainerReady ? (
            <div className="flex items-center bg-emerald-500/15 text-emerald-400 py-1 px-2 rounded-md text-xs">
              <span className="inline mr-1">Ready</span>
              {/* <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span> */}
            </div>
          ) : (
            <div className="flex items-center bg-amber-500/15 text-amber-400 py-1 px-2 rounded-md text-xs">
              <span className="inline mr-1">Loading</span>
              {/* <span className="h-1.5 w-1.5 bg-amber-400 rounded-full animate-pulse"></span> */}
            </div>
          )}
        </div>

        {/* Mobile indicator dots */}
        <div className="flex md:hidden">
          {webcontainerReady ? (
            <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></div>
          ) : (
            <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Toggle steps button - hidden on mobile, shown on desktop */}
        <Button
          onClick={toggleSteps}
          variant="ghost"
          size="icon"
          className="hidden md:flex h-8 w-8 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-800"
          title="Toggle sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}