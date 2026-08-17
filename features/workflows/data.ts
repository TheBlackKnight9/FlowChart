import { and, desc, eq  } from "drizzle-orm";
import { db } from "@/lib/db";
import { workflows, Workflow, WorkflowGraph} from "@/lib/db/schema";
import { validateGraph } from "./lib/validate-graph";      
import { StackId } from "recharts/types/util/ChartUtils";

export async function saveWorkflowGraph({
    orgId,
    id,
    graph,
}: {
    orgId: string
    id: string
    graph: WorkflowGraph
}) {
    const problems = validateGraph(graph)
    if (problems.length > 0) throw new Error(problems.join(" "))
}
 
export async function listWorkflows(orgId: string): Promise<Workflow[]> {
    return await db
        .select()
        .from(workflows)
        .where(eq(workflows.orgId, orgId))
        .orderBy(desc(workflows.createdAt));
}

export async function getWorkflow(orgId: string, id: string): Promise<Workflow | undefined> {
    const [workflow] = await db
        .select()
        .from(workflows)
        .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)));

    return workflow;
}

export async function createWorkflow(orgId: string, name: string): Promise<Workflow> {
    const [workflow] = await db
        .insert(workflows)
        .values({
            orgId,
            name,
        })
        .returning();

    return workflow;
}

export async function deleteWorkflow(orgId: string, id: string): Promise<Workflow | undefined> {
    const [workflow] = await db
        .delete(workflows)
        .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))
        .returning();

    return workflow;
}

