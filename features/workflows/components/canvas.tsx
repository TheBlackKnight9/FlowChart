"use client"

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ConnectionLineType,
  type Edge,
  type ColorMode,
} from "@xyflow/react"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"
import { useTheme } from "next-themes"

import { StepNode } from "@/features/workflows/components/step-node"
import type { StepNodeType } from "@/features/workflows/nodes/node-registry"

import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"

const nodeTypes = {
  step: StepNode,
}

const initialNodes: StepNodeType[] = [
  {
    id: "start",
    type: "step",
    position: { x: 0, y: 0 },
    data: {
      type: "start", kind: "trigger", title: "Start", values: {},
    },
  },
]

const initialEdges: Edge[] = []

export function Canvas() {
  const { resolvedTheme } = useTheme()
  const colorMode: ColorMode = resolvedTheme === "dark" ? "dark" : "light"

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDelete,
  } = useLiveblocksFlow({
    nodes: { initial: initialNodes },
    edges: { initial: initialEdges },
  })

  return (
    <div className="size-full">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes ?? undefined}
        edges={edges ?? undefined}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        colorMode={colorMode}
        fitView
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{stroke: "var(--border)"}}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "var(--border)"},
        }}
        style={
          {
            "--xy-background-color": "var(--background)",
            "--xy-edge-stroke-width": 2,
            "--xy-connectionline-stroke-width": 2,
          } as React.CSSProperties
        }
        maxZoom={1}
      >
        <Cursors />
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
