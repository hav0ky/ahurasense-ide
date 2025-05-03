import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { FileNode } from '@webcontainer/api';
import { Loader } from '../components/Loader';
import { createAndDownloadZip } from '../utils/zipUtils';
import { Download, PanelLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const MOCK_FILE_CONTENT = `// This is a sample file content
import React from 'react';

function Component() {
  return <div>Hello World</div>;
}

export default Component;`;

export function Builder() {
  const location = useLocation();
  const { prompt } = location.state as { prompt: string };
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{ role: "user" | "assistant", content: string; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showSteps, setShowSteps] = useState(true);
  // Always use compact steps

  const [steps, setSteps] = useState<Step[]>([]);

  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps.filter(({ status }) => status === "pending").map(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
        let currentFileStructure = [...originalFiles]; // {}
        let finalAnswerRef = currentFileStructure;

        let currentFolder = ""
        while (parsedPath.length) {
          currentFolder = `${currentFolder}/${parsedPath[0]}`;
          let currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);

          if (!parsedPath.length) {
            // final file
            let file = currentFileStructure.find(x => x.path === currentFolder)
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              })
            } else {
              file.content = step.code;
            }
          } else {
            /// in a folder
            let folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              // create the folder
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              })
            }

            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }

    })

    if (updateHappened) {

      setFiles(originalFiles)
      setSteps(steps => steps.map((s: Step) => {
        return {
          ...s,
          status: "completed"
        }

      }))
    }
    // console.log(files);
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === 'folder') {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children ?
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              )
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }

        return mountStructure[file.name];
      };

      // Process each top-level file/folder
      files.forEach(file => processFile(file, true));

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);

    // Mount the structure if WebContainer is available
    // console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim()
    });
    setTemplateSet(true);

    const { prompts, uiPrompts } = response.data;

    setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
      ...x,
      status: "pending"
    })));

    setLoading(true);
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map(content => ({
        role: "user",
        content
      }))
    })

    setLoading(false);

    // Get the maximum ID from existing steps and increment from there
    setSteps(s => {
      const maxId = s.reduce((max, step) => Math.max(max, step.id), 0);
      return [
        ...s,
        ...parseXml(stepsResponse.data.response).map((x, index) => ({
          ...x,
          id: maxId + index + 1, // Ensure IDs are unique
          status: "pending" as "pending"
        }))
      ];
    });

    setLlmMessages([...prompts, prompt].map(content => ({
      role: "user",
      content
    })));

    setLlmMessages(x => [...x, { role: "assistant", content: stepsResponse.data.response }])
  }

  useEffect(() => {
    init();
  }, [])

  // Memoize callbacks
  const handleSetCurrentStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const handleSetActiveTab = useCallback((tab: 'code' | 'preview') => {
    setActiveTab(tab);
  }, []);

  const handleSetSelectedFile = useCallback((file: FileItem) => {
    setSelectedFile(file);
  }, []);

  const toggleStepsSidebar = useCallback(() => {
    setShowSteps(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-[#0e1015] flex flex-col">
      <header className="bg-[#12141c]/80 backdrop-blur-md border-b border-[#21242e] px-4 md:px-6 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base md:text-lg font-semibold text-gray-100">Website Builder</h1>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 max-w-[180px] md:max-w-lg truncate">Prompt: {prompt}</p>
          </div>
          <div className="md:hidden">
            <Button
              onClick={toggleStepsSidebar}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-800"
              title="Toggle sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full px-4 md:px-6 ">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 py-3 md:py-6">
          {/* Left sidebar - Steps */}
          {showSteps && (
            <div className="col-span-1 md:col-span-3 space-y-4">
              <div className="bg-[#12141c]/80 backdrop-blur-sm rounded-lg border border-[#21242e] shadow-lg overflow-hidden h-[300px] md:h-[calc(75vh-2rem)]">
                <div className="px-3 py-2.5 border-b border-[#21242e] flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-200 flex items-center">
                    <span className="bg-indigo-500/10 text-indigo-400 p-1 rounded mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 6h10"></path>
                        <path d="M6 12h9"></path>
                        <path d="M4 18h8"></path>
                      </svg>
                    </span>
                    Build Steps
                  </h2>
                </div>

                <div className="overflow-y-auto h-[calc(100%-2.75rem)]">
                  <StepsList
                    steps={steps}
                    currentStep={currentStep}
                    onStepClick={handleSetCurrentStep}
                    compact={true}
                  />
                </div>
              </div>

              <div className="bg-[#12141c]/80 backdrop-blur-sm rounded-lg border border-[#21242e] shadow-lg p-3">
                {(loading || !templateSet) ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader />
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 mr-2">
                        <path d="M12 2v20"></path>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      <h3 className="text-xs font-medium text-gray-300">Additional Instructions</h3>
                    </div>
                    <textarea
                      value={userPrompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full h-20 bg-[#161923]/80 text-gray-200 border border-[#21242e] rounded text-xs p-2.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      placeholder="Add more instructions or modifications..."
                    />
                    <button
                      onClick={async () => {
                        if (!userPrompt.trim()) return;

                        const newMessage = {
                          role: "user" as "user",
                          content: userPrompt
                        };

                        setLoading(true);
                        const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                          messages: [...llmMessages, newMessage]
                        });
                        setLoading(false);

                        setLlmMessages(x => [...x, newMessage]);
                        setLlmMessages(x => [...x, {
                          role: "assistant",
                          content: stepsResponse.data.response
                        }]);

                        setSteps(s => {
                          const maxId = s.reduce((max, step) => Math.max(max, step.id), 0);
                          return [
                            ...s,
                            ...parseXml(stepsResponse.data.response).map((x, index) => ({
                              ...x,
                              id: maxId + index + 1, // Ensure IDs are unique
                              status: "pending" as "pending"
                            }))
                          ];
                        });
                        setPrompt("");
                      }}
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white text-xs font-medium py-1.5 px-3 rounded flex justify-center items-center space-x-1.5 transition-colors disabled:opacity-50"
                      disabled={!userPrompt.trim()}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m22 2-7 20-4-9-9-4Z"></path>
                        <path d="M22 2 11 13"></path>
                      </svg>
                      <span>Send Instructions</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Middle - File Explorer */}
          <div className={showSteps ? "col-span-1 md:col-span-2" : "col-span-1 md:col-span-4"}>
            <div className="bg-[#12141c]/80 backdrop-blur-sm rounded-lg border border-[#21242e] shadow-lg h-[250px] md:h-[calc(100vh-8rem)] overflow-hidden">
              <div className="px-3 py-2.5 border-b border-[#21242e]">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-medium text-gray-200 flex items-center">
                    <span className="bg-blue-500/10 text-blue-400 p-1 rounded mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M20.2 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
                        <path d="M20 8v2"></path>
                        <path d="M3 10v4c0 1.1.9 2 2 2h3"></path>
                        <path d="M3 18v4"></path>
                        <path d="M16 18h1"></path>
                        <path d="M20 18v4"></path>
                        <path d="M3 14h3"></path>
                        <path d="M11 14h4"></path>
                      </svg>
                    </span>
                    Project Files
                  </h2>

                  {files.length > 0 && (
                    <button
                      onClick={() => createAndDownloadZip(files, 'website-project')}
                      className="flex items-center gap-1 text-xs bg-blue-500/10 hover:bg-blue-500/15 text-blue-400 hover:text-blue-300 py-1 px-2 rounded transition-colors"
                      title="Download project files as ZIP"
                    >
                      <Download className="w-3 h-3" />
                      <span className="text-xs">Download</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(100%-2.75rem)]">
                <FileExplorer
                  files={files}
                  onFileSelect={handleSetSelectedFile}
                />
              </div>
            </div>
          </div>

          {/* Right - Code Editor/Preview */}
          <div className={showSteps ? "col-span-1 md:col-span-7" : "col-span-1 md:col-span-8"}>
            <div className="bg-[#12141c]/80 backdrop-blur-sm rounded-lg border border-[#21242e] shadow-lg h-[300px] md:h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
              <div className="px-3 py-2.5 border-b border-[#21242e]">
                <TabView
                  activeTab={activeTab}
                  onTabChange={handleSetActiveTab}
                  webcontainerReady={!!webcontainer}
                  toggleSteps={toggleStepsSidebar}
                />
              </div>
              <div className="flex-1 overflow-hidden">
                {activeTab === 'code' ? (
                  <CodeEditor file={selectedFile} />
                ) : (
                  <PreviewFrame
                    webContainer={webcontainer!}
                    files={files}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}