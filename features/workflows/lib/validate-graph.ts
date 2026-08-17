import toposort from "toposort"
import type { WorkflowGraph } from "@/lib/db/schema"

export function validateGraph({ nodes, edges }: WorkflowGraph): string[] {
  const problems: string[] = []
  const triggers = nodes.filter((n) => n.data.kind === "trigger").length
  if (triggers !== 1) {
    problems.push(`A workflow needs exactly one Start trigger (found ${triggers}).`)
  }

  if (edges.length === 0) {
    problems.push(`A flow needs at least one edge leaving the trigger.`)
  } else {
    try {
      toposort(edges.map((edge) => [edge.source, edge.target]))
    } catch {
      problems.push(`Workflow contains cyclic dependencies (loops are not supported).`)
    }
  }

  return problems
}