import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';
import { Loader } from './Loader';
import { Terminal } from './Terminal';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [logs, setLogs] = useState<string[]>(["Console initialized. Waiting for commands..."]);
  const [showTerminal, setShowTerminal] = useState(true);
  const [status, setStatus] = useState<string>("Initializing...");

  // Helper function to add a log entry
  const addLog = (log: string) => {
    // Instead of breaking each line into separate logs, track state and update in place
    setLogs(prevLogs => {
      // Create a working copy
      const newLogs = [...prevLogs];
      
      // Process the log
      const cleanLog = log
        // Remove ANSI color/style codes (more comprehensive)
        .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
        // Remove other ANSI sequences
        .replace(/\x1b\].*?\x07/g, '')
        .trim();
      
      if (!cleanLog) return prevLogs;
      
      // Handle carriage returns properly (for progress indicators)
      if (cleanLog.includes('\r') && !cleanLog.includes('\n')) {
        // This is a progress indicator like [===>   ] updating in place
        // Update the last line instead of adding a new one
        if (newLogs.length > 0) {
          // Get everything after the last carriage return
          const updatedPart = cleanLog.split('\r').pop() || '';
          if (updatedPart) {
            newLogs[newLogs.length - 1] = updatedPart;
          }
          return newLogs;
        }
      }
      
      // Handle different line ending scenarios
      const lines = cleanLog
        .split(/\r\n|\n/)
        .filter(line => line.trim() !== '');
      
      // Filter out typical progress indicators (like / - \ |) when shown alone
      const filteredLines = lines.filter(line => 
        !/^[\/|\\-]$/.test(line.trim())
      );
      
      // Add new lines to logs
      return [...newLogs, ...filteredLines];
    });
  };

  useEffect(() => {
    async function main() {
      try {
        // Add initial logs
        addLog("Setting up project environment...");
        setStatus("Installing dependencies...");

        // Install dependencies
        addLog("$ npm install");
        const installProcess = await webContainer.spawn('npm', ['install']);

        // Capture stdout
        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log('[npm install]', data);
              addLog(data);
            }
          })
        );

        const installExitCode = await installProcess.exit;
        addLog(`npm install completed with exit code ${installExitCode}`);

        // Run dev server
        setStatus("Starting development server...");
        addLog("\n$ npm run dev");

        const devProcess = await webContainer.spawn('npm', ['run', 'dev']);

        // Capture output
        devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log('[dev]', data);
              addLog(data);
            }
          })
        );

        // Listen for server-ready event
        webContainer.on('server-ready', (port, url) => {
          console.log('[server-ready]', port, url);
          setStatus("Server ready");
          addLog(`\nServer ready at ${url} (port ${port})`);
          setUrl(url);
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addLog(`Error: ${errorMessage}`);
        console.error('Preview error:', error);
        setStatus(`Error: ${errorMessage}`);
      }
    }

    main();
  }, [webContainer]);

  return (
    <div className="h-full flex flex-col">
      <div className={`flex-1 ${url ? '' : 'flex items-center justify-center'}`}>
        {!url ? (
          <div className="text-center">
            <Loader />
            <p className="mt-4 text-gray-400 text-sm">{status}</p>
            <p className="mt-2 text-gray-500 text-xs">Check console for details</p>
          </div>
        ) : (
          <iframe
            width="100%"
            height="100%"
            src={url}
            title="Preview"
            sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
            allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
          />
        )}
      </div>

      <Terminal
        logs={logs}
        isVisible={showTerminal}
        onToggleVisibility={() => setShowTerminal(!showTerminal)}
        onClear={() => setLogs(["Console cleared"])}
        height={200}
      />
    </div>
  );
}