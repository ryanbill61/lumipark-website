export function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 bg-ink text-bone ${className}`}
      style={{ minHeight: 120 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="w-6 h-6 opacity-50 shrink-0"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="M21 15l-4.5-4.5L11 16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="block w-full tabular text-[11px] uppercase tracking-[0.16em] text-center px-2 break-words leading-snug text-bone/85">
        {label}
      </span>
      <span className="hidden sm:block tabular text-[9px] uppercase tracking-[0.2em] text-bone/50">
        Photo coming soon
      </span>
    </div>
  );
}

export function SectionHeading({
  kicker,
  title,
  lead,
}: {
  kicker: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="mb-10 md:mb-14">
      <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-3">{kicker}</div>
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight max-w-3xl">
        {title}
      </h2>
      {lead && <p className="mt-4 text-ink-soft text-base md:text-lg max-w-2xl">{lead}</p>}
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rule-top pt-5">
      <div className="tabular text-3xl md:text-5xl font-bold tracking-tighter">{value}</div>
      <div className="mt-2 text-sm text-ink-soft">{label}</div>
    </div>
  );
}
