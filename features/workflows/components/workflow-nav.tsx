"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, Workflow } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import type { Workflow as WorkflowType } from "@/lib/db/schema"
import { generateSlug } from "@/features/workflows/lib/generate-slug"

interface WorkflowNavProps {
  workflows: WorkflowType[]
  onCreateWorkflow: (name: string) => Promise<void>
}

export function WorkflowNav({ workflows, onCreateWorkflow }: WorkflowNavProps) {
  const { state } = useSidebar()
  const pathname = usePathname()
  const activeWorkflowId = pathname.startsWith("/workflow/")
    ? pathname.split("/")[2]
    : null

  function handleCreate() {
    const name = generateSlug()
    onCreateWorkflow(name)
  }

  if (state === "collapsed") {
    return (
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <Popover>
              <PopoverTrigger asChild>
                <SidebarMenuButton>
                  <Workflow />
                </SidebarMenuButton>
              </PopoverTrigger>
              <PopoverContent side="right" align="start">
                <SidebarMenuButton onClick={handleCreate}>
                  <Plus />
                  <span>New workflow</span>
                </SidebarMenuButton>
                <Separator />
                <SidebarMenu className="gap-y-0.5">
                  {workflows.map((workflow) => (
                    <SidebarMenuItem key={workflow.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={workflow.id === activeWorkflowId}
                        className="truncate"
                      >
                        <Link href={`/workflow/${workflow.id}`}>
                          <span className="truncate">{workflow.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workflows</SidebarGroupLabel>
      <SidebarGroupAction title="New workflow" onClick={handleCreate}>
        <Plus />
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu className="gap-y-0.5">
          {workflows.map((workflow) => (
            <SidebarMenuItem key={workflow.id}>
              <SidebarMenuButton
                asChild
                isActive={workflow.id === activeWorkflowId}
                className="truncate"
              >
                <Link href={`/workflow/${workflow.id}`}>
                  <span className="truncate">{workflow.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
