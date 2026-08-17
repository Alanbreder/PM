import React, { useState } from 'react';
import { ToolKey } from '../types/tools';
import { ToolsHubView } from './tools/ToolsHubView';
import { ToolRunnerView } from './tools/ToolRunnerView';

interface ToolkitViewProps {
  workspaceId: string;
  initialToolKey?: ToolKey | null;
}

export const ToolkitView: React.FC<ToolkitViewProps> = ({ workspaceId, initialToolKey }) => {
  const [selectedToolKey, setSelectedToolKey] = useState<ToolKey | null>(initialToolKey || null);
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | undefined>();

  React.useEffect(() => {
    if (initialToolKey) {
      setSelectedToolKey(initialToolKey);
      setSelectedCanvasId(undefined);
    }
  }, [initialToolKey]);

  const handleSelectTool = (toolKey: ToolKey, canvasId?: string) => {
    setSelectedToolKey(toolKey);
    setSelectedCanvasId(canvasId);
  };

  const handleBackToHub = () => {
    setSelectedToolKey(null);
    setSelectedCanvasId(undefined);
  };

  if (selectedToolKey) {
    return (
      <ToolRunnerView
        toolKey={selectedToolKey}
        canvasId={selectedCanvasId}
        workspaceId={workspaceId}
        onBackToHub={handleBackToHub}
      />
    );
  }

  return <ToolsHubView workspaceId={workspaceId} onSelectTool={handleSelectTool} />;
};
