"use server";

import { auth as clerkAuth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth as triggerAuth, tasks, runs } from "@trigger.dev/sdk";
import type { helloWorldTask } from "@/trigger/example";
import { createWorkflow, deleteWorkflow, saveWorkflowGraph } from "@/features/workflows/data";
import { liveblocks } from "@/lib/liveblocks";

import { WorkflowGraph } from "@/lib/db/schema";

export async function createWorkflowAction(name: string) {
  const { orgId } = await clerkAuth();

  if (!orgId) {
    throw new Error("No active organization. Please select an organization.");
  }

  const workflow = await createWorkflow(orgId, name);

  revalidatePath("/", "layout");
  redirect(`/workflow/${workflow.id}`);
}

export async function deleteWorkflowAction(id: string) {
  const { orgId } = await clerkAuth();

  if (!orgId) {
    throw new Error("No active organization. Please select an organization.");
  }

  await deleteWorkflow(orgId, id);

  try {
    await liveblocks.deleteRoom(id);
  } catch (error) {
    console.error("Failed to delete Liveblocks room:", error);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function runWorkflowAction({
  id,
  graph,
}: {
  id: string
  graph: WorkflowGraph
}) {
  const { orgId } = await clerkAuth();

  if (!orgId) {
    throw new Error("No active organization. Please select an organization.");
  }
  await saveWorkflowGraph({ orgId, id, graph})

  const handle = await tasks.trigger<typeof helloWorldTask>("hello-world", {
    message: "Workflow run initiated from right-sidebar",
  });

  const publicAccessToken = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: [handle.id],
      },
    },
  });

  return {
    runId: handle.id,
    publicAccessToken,
  };
}

export async function cancelWorkflowRunAction(runId: string) {
  const { orgId } = await clerkAuth();
  if (!orgId) {
    throw new Error("No active organization. Please select an organization.");
  }
  await runs.cancel(runId);
}
