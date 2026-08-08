"use client"

import { useState, useTransition } from "react"
import {
  PlayIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
} from "lucide-react"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import type { helloWorldTask } from "@/trigger/example"
import { runWorkflowAction } from "@/features/workflows/actions"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"

export function RightSidebar() {
  const [isPending, startTransition] = useTransition()
  const [credentials, setCredentials] = useState<{
    runId: string
    publicAccessToken: string
  } | null>(null)

  const { run, error } = useRealtimeRun<typeof helloWorldTask>(
    credentials?.runId ?? "",
    {
      accessToken: credentials?.publicAccessToken ?? "",
      enabled: Boolean(credentials?.runId && credentials?.publicAccessToken),
    }
  )

  const isRunning =
    run?.status === "EXECUTING" ||
    run?.status === "QUEUED" ||
    run?.status === "DEQUEUED" ||
    run?.status === "WAITING"

  const handleRun = () => {
    startTransition(async () => {
      try {
        const result = await runWorkflowAction()
        setCredentials(result)
      } catch (err) {
        console.error("Failed to run workflow:", err)
      }
    })
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge variant="default" className="bg-emerald-600 text-white hover:bg-emerald-700">
            <CheckCircle2 className="size-3" />
            Completed
          </Badge>
        )
      case "EXECUTING":
        return (
          <Badge variant="secondary" className="bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <Spinner className="size-3" />
            Executing
          </Badge>
        )
      case "QUEUED":
      case "DEQUEUED":
        return (
          <Badge variant="secondary" className="bg-purple-500/15 text-purple-600 dark:text-purple-400">
            <Spinner className="size-3" />
            Queued
          </Badge>
        )
      case "WAITING":
        return (
          <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Clock className="size-3" />
            Waiting
          </Badge>
        )
      case "FAILED":
      case "CRASHED":
      case "SYSTEM_FAILURE":
      case "TIMED_OUT":
        return (
          <Badge variant="destructive">
            <AlertCircle className="size-3" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Clock className="size-3" />
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="flex size-full flex-col gap-4 p-4 text-sm">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="font-semibold text-foreground">Inspector</h3>
        <Button
          onClick={handleRun}
          disabled={isPending || isRunning}
          size="sm"
        >
          {isPending || isRunning ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <PlayIcon data-icon="inline-start" />
          )}
          Run
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <p className="font-medium">Realtime subscription error:</p>
          <p className="mt-1">{error.message}</p>
        </div>
      )}

      {run && (
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status</span>
            {getStatusBadge(run.status)}
          </div>

          <div className="flex flex-col gap-1 border-t pt-2">
            <span className="text-xs text-muted-foreground">Run ID</span>
            <span className="font-mono text-xs text-foreground truncate select-all">
              {run.id}
            </span>
          </div>

          {run.output && (
            <div className="flex flex-col gap-1.5 border-t pt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Terminal className="size-3.5" />
                <span>Output</span>
              </div>
              <pre className="overflow-x-auto rounded bg-muted p-2 font-mono text-xs text-foreground">
                {JSON.stringify(run.output, null, 2)}
              </pre>
            </div>
          )}

          {run.error && (
            <div className="flex flex-col gap-1 border-t pt-2 text-xs text-destructive">
              <span className="font-medium">Error:</span>
              <p className="font-mono">{typeof run.error === "string" ? run.error : JSON.stringify(run.error)}</p>
            </div>
          )}
        </div>
      )}

      {!run && !isPending && (
        <div className="flex flex-1 flex-col items-center justify-center text-center text-xs text-muted-foreground">
          <p>Click &quot;Run&quot; to execute the workflow and track live status updates.</p>
        </div>
      )}
    </div>
  )
}
