import toposort from "toposort";
import { logger, task } from "@trigger.dev/sdk";
import { Stagehand } from "@browserbasehq/stagehand";
import { nodeExecutors } from "../nodes/node-executors";
 
import { getWorkflow }  from "@/features/workflows/data";

// The Trigger.dev task the Run button fires. It loads the workflow graph 
// what order the nodes should run in, and walks them. For now each node just
// announces itself - real execution (per-node executors, live profress, browser sessions)
// gets layeres on from here

export const runWorkflowTask = task({
    id: "run-workflow",
    run: async ({ workflowId, orgId}: { workflowId: string, orgId: string}) => {
       const workflow = await getWorkflow(orgId, workflowId);
       if(!workflow || !workflow.graph) {
        throw new Error("Workflow not found")
       }
       const {nodes, edges} = workflow.graph
       const byId = new Map(nodes.map((n) => [n.id, n]))

       // Run only connected nodes - anything touching an edge. Orphans dropped on 
       // the canvas are skipped . toposort orders them and throws on a cycle.
       const connected = new Set(edges.flatMap((e) => [e.source, e.target]))
       const order = toposort
        .array(
            nodes.map((n) => n.id),
            edges.map((e) => [e.source, e.target])
        )
         .filter((id) => connected.has(id));

        logger.log(`Running worklfow ${workflow.name}`, {steps: order.length})

        // The run owns one Browserbase session, opened lazily on the first browser step
        // and  resued by every later one , so the recording spans the whole flow. The
        // LLM routes through Browserbase's Model Gateway (BROWSERBASE-API_KEY), so on
        // seprate provider key is needed.
        let stagehand: Stagehand | undefined
        const getStagehand = async () => {
            if (stagehand) return stagehand
            stagehand = new Stagehand({
                env: "BROWSERBASE",
                apiKey: process.env.BROWSERBASE_API_KEY!,
                projectId: process.env.BROWSERBASE_PROJECT_ID!,
                model: "google/gemini-2.5-flash",

                disablePino: true,
            })
            await stagehand.init()
            return stagehand
        }

        for (const id of order){
            const node = byId.get(id)!
            logger.log(`Running step: ${node.data.title}`)
            
            const executor = nodeExecutors[node.data.type]
            if (executor) await executor({values: node.data.values, getStagehand})
        }

        await stagehand?.close()

        return { steps: order.length }
    },
})