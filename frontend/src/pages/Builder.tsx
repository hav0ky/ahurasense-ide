import React, { useEffect, useState } from 'react';
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
import { Download } from 'lucide-react';

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
  const [compactSteps, setCompactSteps] = useState(true);

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
    console.log(files);
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
    console.log(mountStructure);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
            <p className="text-sm text-gray-400 mt-1 max-w-lg truncate">Prompt: {prompt}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCompactSteps(!compactSteps)}
              className="text-xs bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 hover:text-gray-100 py-1 px-2 rounded transition-colors"
              title={compactSteps ? "Show detailed steps" : "Show compact steps"}
            >
              {compactSteps ? "Detailed Steps" : "Compact Steps"}
            </button>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="text-xs bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 hover:text-gray-100 py-1 px-2 rounded transition-colors"
              title={showSteps ? "Hide build steps" : "Show build steps"}
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            <span className="text-xs text-gray-400">
              {webcontainer ?
                <span className="flex items-center text-emerald-400">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                  Environment Ready
                </span>
                :
                <span className="flex items-center text-yellow-400">
                  <span className="inline-block h-2 w-2 rounded-full bg-yellow-400 mr-2 animate-pulse"></span>
                  Initializing...
                </span>
              }
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden max-w-screen-2xl mx-auto w-full">
        <div className={`h-full grid ${showSteps ? 'grid-cols-12' : 'grid-cols-10'} gap-6 p-6`}>
          {/* Left sidebar - Steps */}
          {showSteps && (
            <div className="col-span-3 space-y-4">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-xl overflow-hidden h-[calc(75vh-2rem)]">
                <div className="p-3 border-b border-gray-700/50 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-100 flex items-center">
                    <span className="bg-indigo-500/20 text-indigo-400 p-1 rounded mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 6h10"></path>
                        <path d="M6 12h9"></path>
                        <path d="M4 18h8"></path>
                      </svg>
                    </span>
                    Build Steps
                  </h2>
                </div>

                <div className="overflow-y-auto h-[calc(100%-3.75rem)]">
                  <StepsList
                    steps={steps}
                    currentStep={currentStep}
                    onStepClick={setCurrentStep}
                    compact={compactSteps}
                  />
                </div>
              </div>

              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-xl p-4">
                {(loading || !templateSet) ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 mr-2">
                        <path d="M12 2v20"></path>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      <h3 className="text-sm font-medium text-gray-200">Additional Instructions</h3>
                    </div>
                    <textarea
                      value={userPrompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full h-20 bg-gray-900/50 text-gray-200 border border-gray-700/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      placeholder="Add more instructions or modifications..."
                    />
                    <button
                      onClick={async () => {
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
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg flex justify-center items-center space-x-2 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <div className={showSteps ? "col-span-2" : "col-span-3"}>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-xl h-[calc(100vh-8rem)] overflow-hidden">
              <div className="p-4 border-b border-gray-700/50">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-100 flex items-center">
                    <span className="bg-blue-500/20 text-blue-400 p-1 rounded mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      className="flex items-center gap-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 py-1 px-2 rounded transition-colors"
                      title="Download project files as ZIP"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(100%-4rem)]">
                <FileExplorer
                  files={files}
                  onFileSelect={setSelectedFile}
                />
              </div>
            </div>
          </div>

          {/* Right - Code Editor/Preview */}
          <div className={showSteps ? "col-span-7" : "col-span-7"}>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-xl h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-700/50">
                <TabView activeTab={activeTab} onTabChange={setActiveTab} />
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