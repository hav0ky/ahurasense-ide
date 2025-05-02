import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Sparkles, Code, Globe, Puzzle, Github, Twitter } from 'lucide-react';
import axios from "axios";
import { BACKEND_URL } from '../config';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      setIsLoading(true);
      // Simulate a delay for better UX
      setTimeout(() => {
        setIsLoading(false);
        navigate('/builder', { state: { prompt } });
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 flex flex-col items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-3xl w-full relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600/20 blur-xl rounded-full"></div>
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-4 rounded-full relative">
                <Wand2 className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-4">
            Website Builder AI
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Describe your dream website, and we'll help you build it step by step
          </p>
          <div className="flex justify-center space-x-4 mb-8">
            <div className="flex items-center bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-sm text-gray-300">AI-Powered</span>
            </div>
            <div className="flex items-center bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full">
              <Code className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-sm text-gray-300">React + TypeScript</span>
            </div>
            <div className="flex items-center bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full">
              <Globe className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-sm text-gray-300">Live Preview</span>
            </div>
          </div>
        </div>

        <Card className="border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-gray-100">Create Your Website</CardTitle>
            <CardDescription className="text-gray-400">
              Describe what you want and our AI will generate a working website
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the website you want to build... (e.g. 'Create a portfolio website with a hero section, about me, skills, and contact form')"
                className="min-h-32 bg-gray-900/50 border-gray-700/50 placeholder:text-gray-500 focus-visible:ring-indigo-500"
              />
            </CardContent>
            <CardFooter>
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Website Plan
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-2">Example prompts:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <div 
              onClick={() => setPrompt("Create a personal portfolio website with a clean design, featuring a hero section, about me, skills, projects, and contact form.")}
              className="bg-gray-800/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-gray-300 cursor-pointer hover:bg-gray-800/60 transition-colors border border-gray-700/30"
            >
              Portfolio website
            </div>
            <div 
              onClick={() => setPrompt("Build an e-commerce landing page with a featured products section, customer testimonials, and a newsletter signup.")}
              className="bg-gray-800/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-gray-300 cursor-pointer hover:bg-gray-800/60 transition-colors border border-gray-700/30"
            >
              E-commerce landing page
            </div>
            <div 
              onClick={() => setPrompt("Create a blog homepage with a featured post, recent articles list, and category navigation.")}
              className="bg-gray-800/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-gray-300 cursor-pointer hover:bg-gray-800/60 transition-colors border border-gray-700/30"
            >
              Blog homepage
            </div>
          </div>
        </div>
        
        <footer className="mt-16 text-center">
          <div className="flex justify-center space-x-4 mb-4">
            <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
          <p className="text-gray-500 text-xs">
            © 2025 Website Builder AI. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}