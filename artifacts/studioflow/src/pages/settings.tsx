import { AppShell } from "@/components/app-shell";
import { usePageTitle } from "@/hooks/use-page-title";
import {
  saveStudioProfile,
  useStudioProfile,
  type StudioProfile,
} from "@/hooks/use-studio-profile";
import { useTheme } from "@/hooks/use-theme";
import { cx } from "@/lib/format";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Palette,
  Users,
} from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

export function SettingsPage() {
  usePageTitle("Settings");
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useTheme();
  const profile = useStudioProfile();
  const [form, setForm] = useState<StudioProfile>(profile);
  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  const save = (e: FormEvent) => {
    e.preventDefault();
    saveStudioProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };
  return (
    <AppShell>
      <div className="page-head reveal">
        <div>
          <p className="eyebrow">Your space, your rules</p>
          <h1>Settings</h1>
          <p className="lede">Shape how your studio shows up.</p>
        </div>
        {saved && (
          <span className="saved-note">
            <Check size={15} /> Saved
          </span>
        )}
      </div>
      <form className="settings-grid reveal delay-1" onSubmit={save}>
        <section className="panel settings-section">
          <div className="settings-heading">
            <div className="settings-icon">
              <Users size={18} />
            </div>
            <div>
              <h2>Freelancer profile</h2>
              <p>This appears on client-facing proposals.</p>
            </div>
          </div>
          <div className="settings-fields">
            <label>
              Full name
              <input
                data-testid="input-settings-name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </label>
            <label>
              Studio name
              <input
                data-testid="input-settings-studio"
                value={form.studio}
                onChange={(e) => update("studio", e.target.value)}
              />
            </label>
            <label>
              Email address
              <input
                data-testid="input-settings-email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </label>
            <label className="span-2">
              Short bio
              <textarea
                data-testid="textarea-settings-bio"
                rows={3}
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
              />
            </label>
          </div>
        </section>
        <section className="panel settings-section">
          <div className="settings-heading">
            <div className="settings-icon amber">
              <Palette size={18} />
            </div>
            <div>
              <h2>Brand & appearance</h2>
              <p>A little personality goes a long way.</p>
            </div>
          </div>
          <div className="theme-choices">
            {[
              ["warm", "Warm paper", "#f4f0e8"],
              ["sage", "Quiet sage", "#e7eee7"],
              ["ink", "Ink & cream", "#20373b"],
              ["replit", "Replit", "#f26524"],
            ].map(([value, label, color]) => (
              <button
                type="button"
                data-testid={`button-theme-${value}`}
                key={value}
                className={cx("theme-choice", theme === value && "selected")}
                onClick={() => setTheme(value)}
              >
                <span style={{ background: color }} />
                <strong>{label}</strong>
                {theme === value && <Check size={15} />}
              </button>
            ))}
          </div>
        </section>
        <section className="panel settings-section">
          <div className="settings-heading">
            <div className="settings-icon green">
              <CircleDollarSign size={18} />
            </div>
            <div>
              <h2>Payments</h2>
              <p>Defaults for your invoices and deposits.</p>
            </div>
          </div>
          <div className="payment-row">
            <div>
              <strong>USD · United States Dollar</strong>
              <span>Default currency</span>
            </div>
            <CheckCircle2 size={19} />
          </div>
          <div className="payment-row">
            <div>
              <strong>40% deposit</strong>
              <span>Suggested for new projects</span>
            </div>
            <ChevronDown size={17} />
          </div>
        </section>
        <div className="settings-save">
          <span>Changes are saved to this workspace.</span>
          <button
            data-testid="button-save-settings"
            className="button primary"
            type="submit"
          >
            Save changes
          </button>
        </div>
      </form>
    </AppShell>
  );
}

