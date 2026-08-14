"use client"

import { ReactFlowProvider } from "@xyflow/react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { RightSidebar } from "@/features/workflows/components/right-sidebar"
import { Canvas } from "@/features/workflows/components/canvas"

interface WorkflowShellProps {
  workflowId: string
}

export function WorkflowShell({ workflowId }: WorkflowShellProps) {
  return (
    <ReactFlowProvider>
      <ResizablePanelGroup orientation="horizontal" className="size-full">
        <ResizablePanel id="primary" minSize="30rem">
          <ResizablePanelGroup orientation="vertical" className="size-full">
            <ResizablePanel id="canvas" minSize="18rem">
              <Canvas />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
              id="logs"
              defaultSize="8rem"
              minSize="6rem"
            >
              <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                Logs
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <RightSidebar workflowId={workflowId} />
      </ResizablePanelGroup>
    </ReactFlowProvider>
  )
}
