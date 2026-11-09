import meadow from "@/assets/meadow-bg.jpg";

// Realistic meadow backdrop with soft light overlay so content stays readable.
export function Scenery() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img src={meadow} alt="" width={1536} height={1920} className="size-full object-cover" />
      <div className="scenery-veil absolute inset-0" />
    </div>
  );
}
