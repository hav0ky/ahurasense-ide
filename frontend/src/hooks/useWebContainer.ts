import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer>();
    const [error, setError] = useState<Error>();

    async function main() {
        try {
            // Wait for document to be fully loaded and interactive
            if (document.readyState !== 'complete') {
                await new Promise(resolve => {
                    window.addEventListener('load', resolve, { once: true });
                });
            }
            
            // Boot the WebContainer
            const webcontainerInstance = await WebContainer.boot();
            setWebcontainer(webcontainerInstance);
            console.log("WebContainer booted successfully");
        } catch (err) {
            console.error("Failed to boot WebContainer:", err);
            setError(err as Error);
        }
    }
    
    useEffect(() => {
        main();
        
        // Cleanup function
        return () => {
            // Optional cleanup if needed
        };
    }, []);

    return webcontainer;
}