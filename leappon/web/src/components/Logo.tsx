export default function Logo({ light = false }: { light?: boolean }) {
  const main = light ? "text-bone" : "text-ink";
  const sub = light ? "text-bone/50" : "text-ink-soft";
  return (
    <span className="flex flex-col leading-none">
      <span className={`font-bold tracking-[0.18em] text-xl ${main}`}>LEAPPON</span>
      <span className={`mt-1 text-[8px] uppercase tracking-[0.28em] font-medium ${sub}`}>
        Lighting for Living
      </span>
    </span>
  );
}
