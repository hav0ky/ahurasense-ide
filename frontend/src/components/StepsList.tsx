import React from 'react';
import { CheckCircle, Circle, Clock, Code, Folder, Terminal, Trash, Edit } from 'lucide-react';
import { Step, StepType } from '../types';
import { ScrollArea } from './ui/scroll-area';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  const getStepIcon = (type: StepType) => {
    switch (type) {
      case StepType.CreateFile:
        return <Code className="w-4 h-4 text-blue-400" />;
      case StepType.CreateFolder:
        return <Folder className="w-4 h-4 text-yellow-400" />;
      case StepType.EditFile:
        return <Edit className="w-4 h-4 text-purple-400" />;
      case StepType.DeleteFile:
        return <Trash className="w-4 h-4 text-red-400" />;
      case StepType.RunScript:
        return <Terminal className="w-4 h-4 text-green-400" />;
      default:
        return <Code className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-700/20 text-gray-400';
    }
  };

  return (
    <ScrollArea className="h-full px-2">
      <div className="space-y-3 py-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-700/30 ${
              currentStep === step.id
                ? 'bg-gray-700/40 border border-gray-700/50 shadow-md'
                : 'bg-gray-800/20 border border-transparent'
            }`}
            onClick={() => onStepClick(step.id)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {step.status === 'completed' ? (
                  <div className="bg-green-500/10 rounded-full p-1">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ) : step.status === 'in-progress' ? (
                  <div className="bg-blue-500/10 rounded-full p-1">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                ) : (
                  <div className="bg-gray-700/10 rounded-full p-1">
                    <Circle className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 items-center mb-1">
                  <h3 className="font-medium text-gray-100 text-sm">{step.title}</h3>
                  <div className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeColor(step.status)}`}>
                    {step.status}
                  </div>
                  <div className="bg-gray-800/50 rounded-full px-2 py-0.5 flex items-center text-xs">
                    {getStepIcon(step.type)}
                    <span className="ml-1.5 text-gray-300 text-xs">
                      {StepType[step.type]}
                    </span>
                  </div>
                </div>
                
                {step.description && (
                  <p className="text-xs text-gray-400 mt-1">{step.description}</p>
                )}
                
                {step.path && (
                  <div className="mt-2 bg-gray-900/50 rounded px-2 py-1.5 text-gray-400 text-xs font-mono">
                    {step.path}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}