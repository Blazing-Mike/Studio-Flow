import { getGetProjectQueryKey } from "@workspace/api-client-react";
import { useCallback, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/query-client";

export type PlanPhase =
  | "proposal"
  | "packages"
  | "milestones"
  | "tasks"
  | "done";

const PHASE_LABEL: Record<PlanPhase, string> = {
  proposal: "Drafting proposal…",
  packages: "Structuring packages…",
  milestones: "Mapping milestones…",
  tasks: "Planning tasks…",
  done: "Finalizing…",
};

type StreamEvent =
  | { type: "progress"; phase?: PlanPhase }
  | { type: "result" }
  | { type: "error"; message?: string };

/**
 * Streams the AI project-plan generation over SSE and reports live progress.
 * On completion the project query is invalidated so the UI refreshes.
 */
export function useStreamPlan(projectId: string | undefined) {
  const [phase, setPhase] = useState<PlanPhase | null>(null);

  const run = useCallback(async () => {
    if (!projectId) return;
    setPhase("proposal");
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}/generate/stream`,
        { method: "POST" },
      );
      if (!response.ok || !response.body) {
        throw new Error(`Stream failed (${response.status})`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;
      while (!finished) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          const dataLine = frame
            .split("\n")
            .find((line) => line.startsWith("data:"));
          if (!dataLine) continue;
          let event: StreamEvent;
          try {
            event = JSON.parse(dataLine.slice(5).trim());
          } catch {
            continue;
          }
          if (event.type === "progress" && event.phase) {
            setPhase(event.phase);
          } else if (event.type === "result") {
            finished = true;
            queryClient.invalidateQueries({
              queryKey: getGetProjectQueryKey(projectId),
            });
          } else if (event.type === "error") {
            finished = true;
            toast({
              title: "Couldn't generate the plan",
              description:
                event.message ?? "Something went wrong. Please try again.",
            });
          }
        }
      }
      setPhase(null);
    } catch (error) {
      console.error("[use-stream-plan]", error);
      setPhase(null);
      toast({
        title: "Couldn't generate the plan",
        description: "Something went wrong. Please try again.",
      });
    }
  }, [projectId]);

  return {
    phase,
    label: phase ? PHASE_LABEL[phase] : null,
    isStreaming: phase !== null,
    run,
  };
}
