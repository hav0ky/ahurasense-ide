import React from 'react';
import { CheckCircle, Circle, Clock, Code, Folder, Terminal, Trash, Edit } from 'lucide-react';
import { Step, StepType } from '../types';
import { ScrollArea } from './ui/scroll-area';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
  compact?: boolean;
}

export function StepsList({ steps, currentStep, onStepClick, compact = false }: StepsListProps) {
  const getStepIcon = (type: StepType) => {
    switch (type) {
      case StepType.CreateFile:
        return <Code className="w-3 h-3 text-blue-400" />;
      case StepType.CreateFolder:
        return <Folder className="w-3 h-3 text-yellow-400" />;
      case StepType.EditFile:
        return <Edit className="w-3 h-3 text-purple-400" />;
      case StepType.DeleteFile:
        return <Trash className="w-3 h-3 text-red-400" />;
      case StepType.RunScript:
        return <Terminal className="w-3 h-3 text-green-400" />;
      default:
        return <Code className="w-3 h-3 text-blue-400" />;
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
      <div className="space-y-1 py-1">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`py-1.5 px-2 rounded cursor-pointer transition-all hover:bg-gray-700/30 ${
              currentStep === step.id
                ? 'bg-gray-700/40 border border-gray-700/50 shadow-sm'
                : 'bg-gray-800/20 border border-transparent'
            }`}
            onClick={() => onStepClick(step.id)}
          >
            <div className="flex items-center gap-2">
              <div>
                {step.status === 'completed' ? (
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                ) : step.status === 'in-progress' ? (
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-gray-600" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <h3 className="font-medium text-gray-100 text-xs truncate">{step.title}</h3>
                  {!compact && (
                    <>
                      <div className={`text-[10px] px-1.5 rounded-full ${getStatusBadgeColor(step.status)}`}>
                        {step.status}
                      </div>
                      <div className="bg-gray-800/50 rounded-full px-1.5 flex items-center text-[10px]">
                        {getStepIcon(step.type)}
                        <span className="ml-1 text-gray-300">
                          {StepType[step.type]}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                {!compact && step.description && (
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">{step.description}</p>
                )}
                
                {!compact && step.path && (
                  <div className="mt-1 bg-gray-900/50 rounded px-1.5 py-1 text-gray-400 text-[10px] font-mono truncate">
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