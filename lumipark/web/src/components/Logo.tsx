export default function Logo({ light = false }: { light?: boolean }) {
  const main = light ? "text-bone" : "text-ink";
  const sub = light ? "text-bone/60" : "text-ink-soft";
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        viewBox="0 0 40 40"
        className="w-9 h-9 shrink-0"
      >
        <rect fill="#0A2E50" height="40" rx="9" width="40" />
        <rect fill="#FFFFFF" height="13" rx="1.5" width="5" x="9" y="17" />
        <rect fill="#7FB6F2" height="18" rx="1.5" width="5" x="17.5" y="12" />
        <rect fill="#FFFFFF" height="10" rx="1.5" width="5" x="26" y="20" />
        <circle cx="20" cy="7.5" fill="#FFD66B" r="2.4" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={`font-semibold tracking-tight text-lg ${main}`}>
          LumiPark
          <span className={sub}> Group</span>
        </span>
        <span className={`mt-0.5 text-[10px] uppercase tracking-[0.18em] ${sub}`}>
          Lighting Supply Chain
        </span>
      </span>
    </span>
  );
}
