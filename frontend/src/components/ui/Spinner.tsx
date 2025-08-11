export function Spinner({ size = 24 }: { size?: number }) {
  const s = `${size}px`;
  return (
    <span
      aria-label="Loading"
      role="status"
      className="inline-block animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-600"
      style={{ width: s, height: s }}
    />
  );
}


