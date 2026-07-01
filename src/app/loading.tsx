export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6" aria-label="Loading" role="status">
      <div className="h-12 w-12 animate-[wg-spin_0.8s_linear_infinite] rounded-full border-[3px] border-line-strong border-t-terracotta motion-reduce:animate-none" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
