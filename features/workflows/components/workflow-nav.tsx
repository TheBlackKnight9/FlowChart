"use client"

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

const workflows = [
  { id: "1", name: "dominant-wasp" },
  { id: "2", name: "honest-reindeer" },
  { id: "3", name: "expected-llama" },
  { id: "4", name: "essential-ocelot" },
  { id: "5", name: "creepy-echidna" },
  { id: "6", name: "eastern-silkworm" },
  { id: "7", name: "cultural-lion" },
  { id: "8", name: "proud-weasel" },
  { id: "9", name: "regional-bonobo" },
]

export function WorkflowNav() {
  const { state } = useSidebar()

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
                <SidebarMenuButton>
                  <Plus />
                  <span>New workflow</span>
                </SidebarMenuButton>
                <Separator />
                <SidebarMenu className="gap-y-0.5">
                  {workflows.map((workflow) => (
                    <SidebarMenuItem key={workflow.id}>
                      <SidebarMenuButton className="truncate">
                        <span className="truncate">{workflow.name}</span>
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
      <SidebarGroupAction title="New workflow">
        <Plus />
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu className="gap-y-0.5">
          {workflows.map((workflow) => (
            <SidebarMenuItem key={workflow.id}>
              <SidebarMenuButton className="truncate">
                <span className="truncate">{workflow.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
