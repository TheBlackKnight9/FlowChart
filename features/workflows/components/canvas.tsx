"use client"

import { useState, useCallback, useMemo, useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import {
  Background,
  Controls,
  ReactFlow,
  ConnectionLineType,
  type ColorMode,
  type Edge,
  type EdgeChange,
  type NodeTypes,
  Panel,
} from "@xyflow/react"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"
import { AvatarStack } from "@liveblocks/react-ui";

import { StepNode } from "@/features/workflows/components/step-node"
import type { StepNodeType } from "@/features/workflows/nodes/node-registry"

import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

const nodeTypes: NodeTypes = { step: StepNode }

const initialNodes: StepNodeType[] = [
  {
    id: "start",
    type: "step",
    position: { x: 0, y: 0 },
    data: { type: "start", kind: "trigger", title: "Start", values: {} },
  },
]

const initialEdges: Edge[] = []

const emptySubscribe = () => () => { }

// False during server render and hydration, true after mount. Keeps the
// server and initial client render identical to avoid a hydration mismatch.
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export function Canvas() {
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()
  const colorMode: ColorMode = mounted
    ? (resolvedTheme as ColorMode) ?? "light"
    : "light"
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDelete,
  } = useLiveblocksFlow({
    suspense: true,
    nodes: { initial: initialNodes },
    edges: { initial: initialEdges },
  })

  // Liveblocks syncs edges from storage where local selection is not synced.
  // We track selected edge IDs locally so React Flow knows which edge is selected when Backspace is pressed.
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(() => new Set())

  const edgesWithSelection = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      selected: selectedEdgeIds.has(edge.id),
    }))
  }, [edges, selectedEdgeIds])

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setSelectedEdgeIds((prev) => {
        let next = prev
        for (const change of changes) {
          if (change.type === "select") {
            if (next === prev) next = new Set(prev)
            if (change.selected) {
              next.add(change.id)
            } else {
              next.delete(change.id)
            }
          } else if (change.type === "remove") {
            if (next === prev) next = new Set(prev)
            next.delete(change.id)
          }
        }
        return next
      })

      onEdgesChange(changes)

      // When React Flow removes edges, ensure Liveblocks storage deletes them
      const removed = changes.filter((c) => c.type === "remove")
      if (removed.length > 0) {
        onDelete({
          nodes: [],
          edges: removed.map((c) => ({ id: c.id } as Edge)),
        })
      }
    },
    [onEdgesChange, onDelete]
  )

  const handleDelete = useCallback(
    (elements: { nodes: StepNodeType[]; edges: Edge[] }) => {
      if (elements.edges.length > 0) {
        setSelectedEdgeIds((prev) => {
          const next = new Set(prev)
          for (const edge of elements.edges) {
            next.delete(edge.id)
          }
          return next
        })
      }
      onDelete(elements)
    },
    [onDelete]
  )

  return (
    <div className="size-full">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edgesWithSelection}
        onNodesChange={onNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDelete={handleDelete}
        colorMode={colorMode}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
        elevateEdgesOnSelect={true}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: "var(--border)" }}
        defaultEdgeOptions={{
          type: "smoothstep",
          interactionWidth: 20,
        }}
        style={
          {
            "--xy-background-color": "var(--background)",
            "--xy-edge-stroke-default": "var(--border)",
            "--xy-edge-stroke-selected": "var(--primary)",
            "--xy-edge-stroke-width": 2,
            "--xy-connectionline-stroke-width": 2,
          } as React.CSSProperties
        }
        maxZoom={1}
      >
        <Background />
        <Controls />
        <Cursors />
        <Panel position="top-right">
          <AvatarStack />
        </Panel>
      </ReactFlow>
    </div>
  )
}