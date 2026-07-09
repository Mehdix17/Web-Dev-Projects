"use client";

import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <>
      {/* Floating overlay — does not push page content */}
      <aside
        className={[
          "fixed left-0 top-12 z-40 flex h-[calc(100vh-3rem)] w-72 flex-col",
          "border-r border-border-default bg-bg-surface/95 backdrop-blur-sm",
          "transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border-default px-4">
          <span className="text-sm font-medium text-text-primary">Projects</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close sidebar"
            className="h-7 w-7 text-text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="my-projects" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-4 mt-3 grid w-auto grid-cols-2 bg-bg-subtle">
            <TabsTrigger value="my-projects" className="text-xs">
              My Projects
            </TabsTrigger>
            <TabsTrigger value="shared" className="text-xs">
              Shared
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="my-projects"
            className="flex flex-1 items-center justify-center px-4"
          >
            <p className="text-center text-sm text-text-muted">
              No projects yet.
            </p>
          </TabsContent>

          <TabsContent
            value="shared"
            className="flex flex-1 items-center justify-center px-4"
          >
            <p className="text-center text-sm text-text-muted">
              No shared projects yet.
            </p>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="shrink-0 border-t border-border-default p-4">
          <Button className="w-full gap-2 bg-accent-primary text-bg-base hover:bg-accent-primary/90">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
