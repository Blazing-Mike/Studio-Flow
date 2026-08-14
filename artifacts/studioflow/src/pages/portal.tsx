import { PackageCard } from "@/components/shared";
import { usePageTitle } from "@/hooks/use-page-title";
import { toast } from "@/hooks/use-toast";
import { date } from "@/lib/format";
import { sampleDetail, sampleProjects } from "@/lib/sample-data";
import {
  getGetClientPortalQueryKey,
  useApproveProposal,
  useGetClientPortal,
  useRequestProposalChanges,
} from "@workspace/api-client-react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Users,
  Zap,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { useState } from "react";

export function PortalPage() {
  usePageTitle("Client portal");
  const { token } = useParams<{ token: string }>();
  const query = useGetClientPortal(token ?? "", {
    query: {
      enabled: !!token,
      queryKey: getGetClientPortalQueryKey(token ?? ""),
    },
  });
  const fallback =
    sampleProjects.find((p) => p.shareToken === token) ?? sampleProjects[0];
  const project = query.data ?? sampleDetail(fallback);
  const approve = useApproveProposal();
  const request = useRequestProposalChanges();
  const [selected, setSelected] = useState(
    project.proposal.selectedPackage ?? "signature",
  );
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState("");
  const submit = (kind: "approve" | "changes") => {
    const mutation = kind === "approve" ? approve : request;
    mutation.mutate(
      { id: project.id, data: { packageId: selected, note } },
      {
        onSuccess: () => {
          setDecision(kind);
          toast({
            title:
              kind === "approve" ? "Proposal approved" : "Changes requested",
            description:
              kind === "approve"
                ? "The client confirmed the proposal. Kickoff is on."
                : "The client sent notes back to the studio.",
          });
        },
        onError: () => {
          toast({
            title: "Couldn’t send",
            description: "Something went wrong. Please try again.",
          });
        },
      },
    );
  };
  return (
    <div className="portal-shell">
      <header className="portal-header">
        <Link href="/" className="brand portal-brand">
          <div className="brand-mark">
            <Zap size={15} strokeWidth={3} />
          </div>
          <span>
            studio<span>flow</span>
          </span>
        </Link>
        <div className="portal-by">
          A proposal from <strong>Alex Lee</strong>
          <span className="portal-avatar">AL</span>
        </div>
      </header>
      <main className="portal-main">
        {decision ? (
          <div className="portal-success">
            <div className="success-mark">
              <Check size={27} />
            </div>
            <p className="eyebrow">
              {decision === "approve" ? "We’re on" : "Back to the studio"}
            </p>
            <h1>
              {decision === "approve" ? "A great choice." : "Notes received."}
            </h1>
            <p>
              {decision === "approve"
                ? "Alex has been notified and will be in touch with the next step shortly."
                : "Alex has your notes and will come back with a considered update."}
            </p>
            <button
              data-testid="button-portal-return"
              className="button dark"
              onClick={() => setDecision("")}
            >
              Review proposal again
            </button>
          </div>
        ) : (
          <>
            <div className="portal-hero">
              <p className="eyebrow">A proposal for {project.clientName}</p>
              <h1>{project.proposal.headline}</h1>
              <p>{project.proposal.body}</p>
              <div className="portal-meta">
                <span>
                  <CalendarDays size={15} /> Target delivery{" "}
                  {date(project.deadline)}
                </span>
                <span>
                  <Users size={15} /> Prepared by Alex Lee
                </span>
              </div>
            </div>
            <section className="portal-section">
              <div className="portal-section-heading">
                <div>
                  <p className="eyebrow">Choose what fits</p>
                  <h2>Ways we can work together</h2>
                </div>
                <span>All prices in USD</span>
              </div>
              <div className="portal-packages">
                {project.packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    selected={selected === pkg.id}
                    onSelect={() => setSelected(pkg.id)}
                  />
                ))}
              </div>
            </section>
            <section className="portal-bottom">
              <div>
                <p className="eyebrow">Once we’re aligned</p>
                <h2>A thoughtful process, with room to think.</h2>
                <div className="portal-timeline">
                  {project.milestones.map((m) => (
                    <div key={m.id}>
                      <span>{date(m.date)}</span>
                      <strong>{m.name}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="portal-decision">
                <p className="eyebrow">Ready when you are</p>
                <h3>What do you think?</h3>
                <textarea
                  data-testid="textarea-portal-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="A note for Alex (optional)"
                />
                <button
                  data-testid="button-approve-proposal"
                  className="button dark full"
                  disabled={approve.isPending}
                  onClick={() => submit("approve")}
                >
                  <CheckCircle2 size={17} /> Approve{" "}
                  {project.packages.find((p) => p.id === selected)?.name}
                </button>
                <button
                  data-testid="button-request-changes"
                  className="button text-button full"
                  onClick={() => submit("changes")}
                >
                  I’d like to request changes
                </button>
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="portal-footer">
        StudioFlow <span>·</span> A calmer way to run creative work.
      </footer>
    </div>
  );
}

