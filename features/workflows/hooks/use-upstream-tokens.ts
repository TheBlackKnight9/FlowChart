import { useMemo } from "react"
import { useEdges, useNodes } from "@xyflow/react"

import {
  nodeRegistry,
  type NodeType,
  type StepNodeType,
} from "../nodes/node-registry"

// ── Types ────────────────────────────────────────────────────────────────────

export type UpstreamToken = {
  /** Ready-to-insert placeholder, e.g. `{{ open-url-1.title }}`. */
  token: string
  /** Human-readable label, e.g. `"Open URL 1 · Page Title"`. */
  label: string  
  /** Registry type key of the source node so the UI can show its icon. */
  sourceType: NodeType
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Given a selected node, walk the graph backwards through every connection and
 * return a flat list of `{{ nodeId.path }}` tokens for every output declared by
 * each upstream node.
 *
 * Re-computes whenever nodes or edges change (connect / disconnect / rename).
 */
export function useUpstreamTokens(
  selectedNodeId: string | undefined,
): UpstreamToken[] {
  const nodes = useNodes<StepNodeType>()
  const edges = useEdges()

  return useMemo(() => {
    if (!selectedNodeId) return []

    // Build a reverse adjacency list: target → set of sources.
    const parents = new Map<string, Set<string>>()
    for (const e of edges) {
      let set = parents.get(e.target)
      if (!set) {
        set = new Set()
        parents.set(e.target, set)
      }
      set.add(e.source)
    }

    // BFS / DFS backwards to collect every transitive upstream id.
    const visited = new Set<string>()
    const queue = [selectedNodeId]
    while (queue.length > 0) {
      const id = queue.pop()!
      const pars = parents.get(id)
      if (!pars) continue
      for (const p of pars) {
        if (!visited.has(p)) {
          visited.add(p)
          queue.push(p)
        }
      }
    }

    // Index nodes by id for quick lookup.
    const byId = new Map(nodes.map((n) => [n.id, n]))

    // Build the token list, ordered by graph distance (closest first since
    // visited was built BFS-style from the selected node).
    const tokens: UpstreamToken[] = []

    for (const id of visited) {
      const node = byId.get(id)
      if (!node) continue

      const def = nodeRegistry[node.data.type]
      const outputs = def.outputs ?? []

      for (const out of outputs) {
        tokens.push({
          token: `{{ ${id}.${out.path} }}`,
          label: `${node.data.title} · ${out.label}`,
          sourceType: node.data.type,
        })
      }
    }

    return tokens
  }, [selectedNodeId, nodes, edges])
}
