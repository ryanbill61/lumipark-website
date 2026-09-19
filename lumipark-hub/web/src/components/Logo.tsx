export default function Logo({ light = false }: { light?: boolean }) {
  const src = light ? "/logo-blue-light.png" : "/logo-blue.png";
  return (
    <img
      src={src}
      alt="BMC — Human Centric Lighting"
      className="h-9 w-auto"
      style={{ height: "36px", width: "auto" }}
    />
  );
}
