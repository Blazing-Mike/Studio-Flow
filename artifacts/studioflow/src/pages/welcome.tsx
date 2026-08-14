import { usePageTitle } from "@/hooks/use-page-title";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Copy,
  FileText,
  LayoutDashboard,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

export function WelcomePage() {
  usePageTitle("Welcome");
  return (
    <div className="welcome-shell">
      <header className="welcome-nav">
        <Link href="/" className="brand">
          <div className="brand-mark">
            <Zap size={15} strokeWidth={3} />
          </div>
          <span>
            studio<span>flow</span>
          </span>
        </Link>
        <div className="welcome-nav-actions">
          <Link href="/projects" className="text-link">
            Explore workspace <ArrowUpRight size={15} />
          </Link>
          <Link href="/" className="button dark">
            Open dashboard
          </Link>
        </div>
      </header>
      <main className="welcome-main">
        <section className="welcome-hero">
          <div className="welcome-copy reveal">
            <p className="eyebrow">A calmer way to run creative work</p>
            <h1>
              From first brief
              <br />
              <em>to final yes.</em>
            </h1>
            <p className="welcome-lede">
              StudioFlow gives freelancers and small studios one thoughtful
              place to shape proposals, keep projects moving, and make client
              approvals feel easy.
            </p>
            <div className="welcome-cta">
              <Link href="/" className="button primary">
                <Sparkles size={17} /> Start managing projects
              </Link>
              <span>
                <CheckCircle2 size={15} /> No setup required
              </span>
            </div>
          </div>
          <div className="welcome-preview reveal delay-1">
            <div className="preview-window">
              <div className="preview-window-top">
                <span />
                <span />
                <span />
                <small>studioflow / proposal writer</small>
              </div>
              <div className="preview-window-body">
                <div className="preview-side">
                  <div className="preview-logo">
                    <Zap size={10} />
                  </div>
                  <div className="preview-side-item active">
                    <LayoutDashboard size={12} />
                  </div>
                  <div className="preview-side-item">
                    <FileText size={12} />
                  </div>
                  <div className="preview-side-item">
                    <BriefcaseBusiness size={12} />
                  </div>
                  <div className="preview-side-item">
                    <Users size={12} />
                  </div>
                </div>
                <div className="preview-writer">
                  <div className="preview-writer-head">
                    <div>
                      <p>Proposal writer</p>
                      <h3>
                        From brief to <b>beautiful yes.</b>
                      </h3>
                    </div>
                    <span className="preview-ai-badge">
                      <Sparkles size={10} /> AI assisted
                    </span>
                  </div>
                  <div className="preview-writer-grid">
                    <div className="preview-brief-card">
                      <div className="preview-card-label">
                        <span>Client brief</span>
                        <span className="preview-complete">Ready</span>
                      </div>
                      <strong>Northstar Coffee</strong>
                      <small>Brand + ecommerce refresh</small>
                      <p>
                        A warmer digital home for a thoughtful coffee brand,
                        with a clearer subscription story.
                      </p>
                      <div className="preview-brief-meta">
                        <span>$4,800 budget</span>
                        <span>Aug 29 deadline</span>
                      </div>
                      <div className="preview-generate">
                        <Sparkles size={11} /> Generate proposal
                      </div>
                    </div>
                    <div className="preview-proposal-card">
                      <div className="preview-card-label">
                        <span>Draft proposal</span>
                        <span className="preview-status-dot">Saved</span>
                      </div>
                      <h4>A warmer digital home for your daily ritual</h4>
                      <p>
                        Northstar has already built a beautiful product. This
                        project gives that product a digital experience with the
                        same care.
                      </p>
                      <div className="preview-package-row">
                        <span>Starter</span>
                        <span className="selected">Growth · $4,800</span>
                        <span>Signature</span>
                      </div>
                      <div className="preview-proposal-actions">
                        <span>
                          <Copy size={10} /> Copy proposal
                        </span>
                        <span>
                          <ArrowUpRight size={10} /> Client portal
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="preview-writer-footer">
                    <span>
                      <CheckCircle2 size={11} /> Proposal, packages, and next
                      steps ready
                    </span>
                    <span>2 min ago</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="preview-note">
              <Sparkles size={15} />
              <span>
                <strong>Write proposals faster</strong>
                <small>Brief in. Client-ready copy out.</small>
              </span>
            </div>
          </div>
        </section>
        <section className="welcome-proof">
          <p className="eyebrow">Everything that keeps a studio moving</p>
          <div className="proof-grid">
            <div>
              <span className="proof-number">01</span>
              <h2>Write proposals that sound like you.</h2>
              <p>
                Turn a job brief or client notes into thoughtful proposal copy,
                clear package options, and a confident next step.
              </p>
            </div>
            <div>
              <span className="proof-number">02</span>
              <h2>Keep the work in motion.</h2>
              <p>
                Milestones, tasks, invoices, and client activity stay close
                enough to act on.
              </p>
            </div>
            <div>
              <span className="proof-number">03</span>
              <h2>Get to yes, more naturally.</h2>
              <p>
                Give clients a considered portal where they can choose, approve,
                and leave useful notes.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="welcome-footer">
        <span>StudioFlow</span>
        <span>Built for independent studios with a lot of care.</span>
        <Link href="/settings">
          Make it yours <ArrowUpRight size={14} />
        </Link>
      </footer>
    </div>
  );
}

