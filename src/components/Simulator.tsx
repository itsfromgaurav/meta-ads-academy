import { useState } from 'react';
import { ChevronLeft, Play, RotateCcw, TrendingUp, AlertTriangle, CheckCircle2, Dog } from 'lucide-react';
import {
  simulate,
  DEFAULT_CONFIG,
  DOG_STORY_PRESET,
  type CampaignConfig,
  type SimResult,
} from '../lib/simulator';
import type { Store } from '../lib/useStore';

interface Props {
  store: Store;
  onBack: () => void;
}

export default function Simulator({ store, onBack }: Props) {
  const [cfg, setCfg] = useState<CampaignConfig>(DEFAULT_CONFIG);
  const [result, setResult] = useState<SimResult | null>(null);

  function set<K extends keyof CampaignConfig>(k: K, v: CampaignConfig[K]) {
    setCfg((c) => ({ ...c, [k]: v }));
    setResult(null);
  }

  function launch() {
    const r = simulate(cfg);
    setResult(r);
    store.saveSim({
      id: `${Date.now()}`,
      ts: Date.now(),
      score: r.score,
      grade: r.grade,
      cpl: r.totals.cpl,
      leads: r.totals.leads,
      note: `${cfg.objective} · ${cfg.audience} · ₹${cfg.budgetPerDay}/day · ${cfg.creativeCount} creative${cfg.creativeCount > 1 ? 's' : ''}`,
    });
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-20">
      <div className="flex items-center justify-between py-5">
        <button onClick={onBack} className="flex items-center gap-1 text-faint transition-colors hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-display text-[18px] font-medium text-white">Campaign Simulator</h2>
        <button
          onClick={() => {
            setCfg(DOG_STORY_PRESET);
            setResult(null);
          }}
          className="flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 font-body text-[11px] text-zinc-300 transition-colors hover:border-white/30"
        >
          <Dog size={12} /> Dog Story
        </button>
      </div>

      <p className="mb-5 font-body text-[12px] leading-relaxed text-faint">
        Paper-trade a campaign: configure it, launch a <span className="text-zinc-300">simulated</span> 7-day
        run, and get coached. No real spend.
      </p>

      {/* controls */}
      <div className="space-y-4">
        <Field label="What do you actually want?">
          <Seg
            options={[['leads', 'Leads'], ['sales', 'Sales']]}
            value={cfg.goal}
            onChange={(v) => set('goal', v as CampaignConfig['goal'])}
          />
        </Field>

        <Field label="Campaign objective (your pick)">
          <Seg
            options={[
              ['awareness', 'Awareness'],
              ['traffic', 'Traffic'],
              ['engagement', 'Engage'],
              ['leads', 'Leads'],
              ['sales', 'Sales'],
            ]}
            value={cfg.objective}
            onChange={(v) => set('objective', v as CampaignConfig['objective'])}
            small
          />
        </Field>

        <Field label="Audience breadth">
          <Seg
            options={[['narrow', 'Narrow'], ['balanced', 'Balanced'], ['broad', 'Broad']]}
            value={cfg.audience}
            onChange={(v) => set('audience', v as CampaignConfig['audience'])}
          />
        </Field>

        <Field label="Targeting precision">
          <Seg
            options={[['tight', 'Tight (buyer-tuned)'], ['loose', 'Loose']]}
            value={cfg.targeting}
            onChange={(v) => set('targeting', v as CampaignConfig['targeting'])}
          />
        </Field>

        <Slider label="Daily budget" value={cfg.budgetPerDay} min={200} max={5000} step={100} suffix=" ₹/day" onChange={(v) => set('budgetPerDay', v)} />
        <Slider label="Target CPL" value={cfg.targetCPL} min={50} max={600} step={10} suffix=" ₹" onChange={(v) => set('targetCPL', v)} />
        <Rating label="Offer + landing strength" value={cfg.offerStrength} onChange={(v) => set('offerStrength', v)} />
        <Rating label="Hook quality" value={cfg.hookQuality} onChange={(v) => set('hookQuality', v)} />
        <Rating label="Creative quality" value={cfg.creativeQuality} onChange={(v) => set('creativeQuality', v)} />
        <Rating label="Creative variants" value={cfg.creativeCount} max={6} onChange={(v) => set('creativeCount', v)} />

        <button
          onClick={() => set('audienceNetwork', !cfg.audienceNetwork)}
          className={`flex w-full items-center justify-between rounded-[2px] border px-4 py-3 font-body text-[13px] transition-colors ${
            cfg.audienceNetwork ? 'border-rose-400/40 bg-rose-400/8 text-rose-300' : 'border-white/10 bg-surface text-zinc-300'
          }`}
        >
          Include Audience Network placements
          <span className={`h-4 w-7 rounded-full p-0.5 transition-colors ${cfg.audienceNetwork ? 'bg-rose-400/60' : 'bg-white/15'}`}>
            <span className={`block h-3 w-3 rounded-full bg-white transition-transform ${cfg.audienceNetwork ? 'translate-x-3' : ''}`} />
          </span>
        </button>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          onClick={launch}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-3 font-body text-[14px] font-medium text-black transition-colors hover:bg-zinc-200"
        >
          <Play size={15} /> Launch (simulated)
        </button>
        <button
          onClick={() => {
            setCfg(DEFAULT_CONFIG);
            setResult(null);
          }}
          className="flex items-center justify-center rounded-full border border-white/12 px-4 text-faint transition-colors hover:text-white"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {result && <Results result={result} cfg={cfg} />}

      {store.progress.sims.length > 0 && (
        <div className="mt-8">
          <div className="mb-2 font-body text-[11px] uppercase tracking-[0.18em] text-faint">Run history</div>
          <div className="space-y-1.5">
            {store.progress.sims.slice(0, 6).map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-[2px] border border-white/6 bg-surface px-3 py-2">
                <span className={`font-display text-[15px] font-medium ${gradeColor(s.grade)}`}>{s.grade}</span>
                <span className="min-w-0 flex-1 truncate font-body text-[12px] text-zinc-400">{s.note}</span>
                <span className="font-body text-[12px] tabular-nums text-zinc-300">
                  {s.leads} leads · {s.cpl ? `₹${s.cpl}` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Results({ result, cfg }: { result: SimResult; cfg: CampaignConfig }) {
  const t = result.totals;
  const maxCtr = Math.max(...result.days.map((d) => d.ctr));
  return (
    <div className="mt-6 animate-floatup">
      {/* score banner */}
      <div className="shell mb-3">
        <div className="dotfield flex items-center gap-4 rounded-[2px] bg-ink p-5">
          <div className={`font-display text-[44px] font-medium leading-none ${gradeColor(result.grade)}`}>{result.grade}</div>
          <div className="flex-1">
            <div className="font-display text-[20px] font-medium text-white">{result.score}/100</div>
            <div className="font-body text-[11px] uppercase tracking-wider text-faint">
              {result.status === 'optimized' ? 'Cleared learning phase' : result.status === 'limited' ? 'Learning limited' : 'In learning phase'}
            </div>
          </div>
          <TrendingUp size={20} className="text-indigo-soft" />
        </div>
      </div>

      {/* metric grid */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Metric label="Leads (7d)" value={`${t.leads}`} />
        <Metric label="Cost / lead" value={t.cpl ? `₹${t.cpl}` : '—'} good={t.cpl > 0 && t.cpl <= cfg.targetCPL} bad={t.cpl > cfg.targetCPL || t.cpl === 0} />
        <Metric label="Spend" value={`₹${t.spend.toLocaleString('en-IN')}`} />
        <Metric label="CTR avg" value={`${t.ctr}%`} />
        <Metric label="CPM" value={`₹${t.cpm}`} />
        <Metric label="Frequency" value={`${t.frequency}`} bad={t.frequency >= 3} />
      </div>

      {/* CTR sparkline */}
      <div className="mb-3 rounded-[2px] border border-white/6 bg-surface p-4">
        <div className="mb-2 flex items-center justify-between font-body text-[11px] text-faint">
          <span>CTR over 7 days</span>
          <span>{result.days[0].ctr}% → {result.days[6].ctr}%</span>
        </div>
        <div className="flex items-end gap-1">
          {result.days.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center justify-end gap-1">
              <div
                className="w-full rounded-[1px] bg-indigo/70"
                style={{ height: `${Math.round(Math.max(6, (d.ctr / maxCtr) * 56))}px` }}
                title={`Day ${d.day}: ${d.ctr}%`}
              />
              <span className="font-body text-[9px] text-faint">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* coach */}
      <div className="mb-1 font-body text-[11px] uppercase tracking-[0.18em] text-faint">Coach</div>
      <div className="space-y-1.5">
        {result.coach.map((c, idx) => {
          const Icon = c.level === 'good' ? CheckCircle2 : c.level === 'warn' ? AlertTriangle : AlertTriangle;
          const color = c.level === 'good' ? 'text-emerald-400' : c.level === 'warn' ? 'text-amber-300' : 'text-rose-400';
          return (
            <div key={idx} className="flex gap-2.5 rounded-[2px] border border-white/6 bg-surface px-3 py-2.5">
              <Icon size={15} className={`mt-0.5 flex-none ${color}`} />
              <div>
                <p className="font-body text-[13px] leading-relaxed text-zinc-200">{c.msg}</p>
                <p className="mt-1 font-body text-[10px] uppercase tracking-wider text-faint">{c.ref}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function gradeColor(g: string) {
  if (g === 'A') return 'text-emerald-400';
  if (g === 'B') return 'text-indigo-soft';
  if (g === 'C') return 'text-amber-300';
  return 'text-rose-400';
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 font-body text-[12px] text-muted">{label}</div>
      {children}
    </div>
  );
}

function Seg({
  options,
  value,
  onChange,
  small,
}: {
  options: [string, string][];
  value: string;
  onChange: (v: string) => void;
  small?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`rounded-[2px] ${small ? 'px-2.5 py-1.5 text-[12px]' : 'flex-1 px-3 py-2 text-[13px]'} font-body transition-colors ${
            value === v ? 'bg-indigo text-white' : 'bg-surface text-muted hover:bg-white/8'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between font-body text-[12px]">
        <span className="text-muted">{label}</span>
        <span className="tabular-nums text-white">
          {value.toLocaleString('en-IN')}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/12 accent-indigo"
      />
    </div>
  );
}

function Rating({
  label,
  value,
  onChange,
  max = 5,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between font-body text-[12px]">
        <span className="text-muted">{label}</span>
        <span className="tabular-nums text-white">
          {value}/{max}
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`h-7 flex-1 rounded-[2px] transition-colors ${n <= value ? 'bg-indigo' : 'bg-white/8 hover:bg-white/15'}`}
            aria-label={`${label} ${n}`}
          />
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  const color = good ? 'text-emerald-400' : bad ? 'text-rose-400' : 'text-white';
  return (
    <div className="rounded-[2px] border border-white/6 bg-surface px-3 py-3">
      <div className={`font-display text-[20px] font-medium leading-none ${color}`}>{value}</div>
      <div className="mt-1.5 font-body text-[10px] uppercase tracking-wider text-faint">{label}</div>
    </div>
  );
}
