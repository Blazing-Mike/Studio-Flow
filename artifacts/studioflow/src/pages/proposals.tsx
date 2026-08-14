import { AppShell } from "@/components/app-shell";
import { usePageTitle } from "@/hooks/use-page-title";
import { useStudioProfile } from "@/hooks/use-studio-profile";
import { cx } from "@/lib/format";
import { useGenerateJobProposal } from "@workspace/api-client-react";
import type {
  JobProposal,
  JobProposalInputLength,
  JobProposalInputTone,
  ProposalDraft,
} from "@workspace/api-client-react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const PROPOSAL_DRAFTS_KEY = "studioflow-proposal-drafts";

function loadLocalDrafts(): ProposalDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(PROPOSAL_DRAFTS_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalDrafts(drafts: ProposalDraft[]) {
  try {
    window.localStorage.setItem(PROPOSAL_DRAFTS_KEY, JSON.stringify(drafts));
  } catch {
    /* ignore quota / storage errors */
  }
}

export function ProposalsPage() {
  usePageTitle("Proposal writer");
  const write = useGenerateJobProposal();
  const profile = useStudioProfile();
  const [drafts, setDrafts] = useState<ProposalDraft[]>(loadLocalDrafts);
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState<JobProposalInputTone>("confident");
  const [length, setLength] = useState<JobProposalInputLength>("standard");
  const [portfolio, setPortfolio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [job, setJob] = useState<JobProposal["job"]>(undefined);
  const [proposal, setProposal] = useState("");
  const [source, setSource] = useState("");
  const [needsDescription, setNeedsDescription] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const loading = write.isPending;

  const applyDraft = (draft: ProposalDraft) => {
    setProposal(draft.proposal);
    setSource(draft.source ?? "");
    setTone((draft.tone as JobProposalInputTone) ?? "confident");
    setLength((draft.length as JobProposalInputLength) ?? "standard");
    if (draft.title)
      setJob({ title: draft.title, org: draft.org, url: draft.url });
    setNeedsDescription(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const run = () => {
    setError("");
    write.mutate(
      {
        data: {
          url: url.trim() || undefined,
          description: description.trim() || undefined,
          portfolioUrl: portfolioUrl.trim() || undefined,
          tone,
          length,
          profile: {
            name: profile.name,
            studio: profile.studio,
            email: profile.email,
            bio: profile.bio,
            portfolio: portfolio.trim() || undefined,
          },
        },
      },
      {
        onSuccess: (data) => {
          setJob(data.job);
          setProposal(data.proposal ?? "");
          setSource(data.source ?? "");
          setNeedsDescription(Boolean(data.needsDescription));
          if (data.job?.description && !description.trim())
            setDescription(data.job.description);
          if (data.draft) {
            const draft = data.draft;
            setDrafts((prev) => {
              const next = [draft, ...prev];
              saveLocalDrafts(next);
              return next;
            });
          }
        },
        onError: () => {
          setError(
            "Something went wrong drafting the proposal. Please try again.",
          );
        },
      },
    );
  };

  const remove = (id: string) =>
    setDrafts((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveLocalDrafts(next);
      return next;
    });
  const copy = () => {
    navigator.clipboard?.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <AppShell>
      <div className="page-head reveal">
        <div>
          <p className="eyebrow">Land the gig</p>
          <h1>Proposal writer</h1>
          <p className="lede">
            Paste a job link — or the posting — and get a tailored proposal
            ready to copy into your application.
          </p>
        </div>
        <div className="ai-stamp">
          <Sparkles size={15} /> Gemini-powered
        </div>
      </div>
      <div className="proposal-writer reveal delay-1">
        <section className="panel writer-card">
          <div className="writer-step">
            <span>1</span>
            <div>
              <h3>Paste the job</h3>
              <p>
                A Contra, Upwork, or any job posting link — we’ll read it for
                you.
              </p>
            </div>
          </div>
          <label>
            Job link
            <input
              data-testid="input-job-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://contra.com/opportunity/..."
            />
          </label>
          {needsDescription && (
            <div className="writer-note">
              <Sparkles size={14} /> We couldn’t read that page. Paste the
              posting text below instead.
            </div>
          )}
          {needsDescription && (
            <label>
              Job description
              <textarea
                data-testid="textarea-job-description"
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the full job description here..."
              />
            </label>
          )}

          <div className="writer-step">
            <span>2</span>
            <div>
              <h3>Tune it</h3>
              <p>
                Tone and length make the difference — add portfolio proof to
                seal it.
              </p>
            </div>
          </div>
          <div className="writer-tune">
            <label>
              Tone
              <select
                data-testid="select-tone"
                value={tone}
                onChange={(e) =>
                  setTone(e.target.value as JobProposalInputTone)
                }
              >
                <option value="confident">Confident & direct</option>
                <option value="consultative">Consultative & curious</option>
                <option value="warm">Warm & personal</option>
              </select>
            </label>
            <label>
              Length
              <select
                data-testid="select-length"
                value={length}
                onChange={(e) =>
                  setLength(e.target.value as JobProposalInputLength)
                }
              >
                <option value="short">Short · ~120 words</option>
                <option value="standard">Standard · ~200 words</option>
                <option value="detailed">Detailed · ~350 words</option>
              </select>
            </label>
          </div>
          <button
            type="button"
            className="text-link writer-portfolio-toggle"
            data-testid="button-portfolio-toggle"
            onClick={() => setShowPortfolio((p) => !p)}
          >
            <ChevronDown
              size={13}
              className={cx("writer-chevron", showPortfolio && "open")}
            />{" "}
            {showPortfolio
              ? "Hide portfolio context"
              : "Add relevant work / portfolio (link or paste)"}
          </button>
          {showPortfolio && (
            <>
              <label>
                Portfolio / Contra profile link
                <input
                  data-testid="input-portfolio-url"
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://contra.com/your_username"
                />
              </label>
              <p className="writer-hint">
                <Sparkles size={14} /> We’ll read your work &amp; case studies
                once and auto-pick the most relevant proof for this job.
              </p>
              <label>
                Or paste relevant work
                <textarea
                  data-testid="textarea-portfolio"
                  rows={4}
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="e.g. Wrote 30+ UGC ad scripts for a DTC skincare brand; hooks that lifted CTR 2.4×. Happy to share samples."
                />
              </label>
            </>
          )}

          {error && <p className="writer-error">{error}</p>}
          <div className="editor-actions">
            <button
              data-testid="button-write-proposal"
              className="button primary"
              onClick={run}
              disabled={loading || (!url.trim() && !description.trim())}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" /> Writing…
                </>
              ) : (
                <>
                  <Sparkles size={16} />{" "}
                  {description.trim() && !needsDescription
                    ? "Rewrite proposal"
                    : "Read job & write proposal"}
                </>
              )}
            </button>
          </div>
        </section>
        {job && (
          <section className="panel job-summary">
            <div className="job-summary-icon">
              <BriefcaseBusiness size={17} />
            </div>
            <div className="job-summary-copy">
              <p className="eyebrow">Reading the posting</p>
              <h3>{job.title}</h3>
              <span>
                {job.org ? `${job.org} · ` : ""}
                {job.employmentType ?? "Freelance"}
              </span>
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  Open original <ArrowUpRight size={13} />
                </a>
              )}
            </div>
          </section>
        )}
        {proposal && (
          <section className="panel proposal-result">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Copy, refine, send</p>
                <h2>Your draft</h2>
              </div>
              <div className="proposal-result-actions">
                <span className={cx("source-badge", source === "ai" && "ai")}>
                  {source === "ai" ? "AI draft" : "Template draft"}
                </span>
                <button
                  data-testid="button-copy-proposal"
                  className="button outline"
                  onClick={copy}
                >
                  {copied ? (
                    <>
                      <Check size={15} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={15} /> Copy proposal
                    </>
                  )}
                </button>
              </div>
            </div>
            <pre className="proposal-text">{proposal}</pre>
          </section>
        )}
        {drafts.length > 0 && (
          <section className="panel history-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Saved drafts</p>
                <h2>History</h2>
              </div>
              <Clock3 size={16} className="panel-icon" />
            </div>
            <div className="history-list">
              {drafts.map((draft) => (
                <div className="history-row" key={draft.id}>
                  <div className="history-copy">
                    <strong>{draft.title ?? "Untitled proposal"}</strong>
                    <span>
                      {draft.org ? `${draft.org} · ` : ""}
                      {new Date(draft.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {draft.source === "ai" ? "AI" : "Template"} ·{" "}
                      {draft.length ?? "standard"}
                    </span>
                  </div>
                  <div className="history-actions">
                    <button
                      className="button tiny-outline"
                      data-testid={`button-load-draft-${draft.id}`}
                      onClick={() => applyDraft(draft)}
                    >
                      Open
                    </button>
                    <button
                      className="icon-button tiny"
                      data-testid={`button-delete-draft-${draft.id}`}
                      title="Delete draft"
                      aria-label="Delete draft"
                      onClick={() => remove(draft.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

