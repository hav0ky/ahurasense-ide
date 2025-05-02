import JSZip from 'jszip';
import { FileItem } from '../types';

/**
 * Creates a zip archive from file structure and initiates download
 */
export const createAndDownloadZip = async (files: FileItem[], projectName: string = 'project') => {
  // Create a new JSZip instance
  const zip = new JSZip();
  
  // Function to recursively add files to zip
  const addFilesToZip = (items: FileItem[], currentPath: string = '') => {
    for (const item of items) {
      const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      
      if (item.type === 'file') {
        // Add file with content
        zip.file(itemPath, item.content || '');
      } else if (item.type === 'folder' && item.children) {
        // Create folder and add its children recursively
        addFilesToZip(item.children, itemPath);
      }
    }
  };
  
  // Add files to zip starting from root
  addFilesToZip(files);
  
  try {
    // Generate the zip content
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${projectName}.zip`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 7000);
    
    return true;
  } catch (error) {
    console.error('Error creating zip file:', error);
    return false;
  }
};