import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    async function main() {
      // Install dependencies
      const installProcess = await webContainer.spawn('npm', ['install']);
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log('[npm install]', data);
          }
        })
      );
      await installProcess.exit;

      // Run dev server
      const devProcess = await webContainer.spawn('npm', ['run', 'dev']);
      devProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log('[dev]', data);
          }
        })
      );

      // Listen for server-ready event
      webContainer.on('server-ready', (port, url) => {
        console.log('[server-ready]', port, url);
        setUrl(url);
      });
    }

    main();
  }, [webContainer]);

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {!url ? (
        <div className="text-center">
          <p className="mb-2">Loading preview...</p>
        </div>
      ) : (
        <iframe width="100%" height="100%" src={url} />
      )}
    </div>
  );
}
