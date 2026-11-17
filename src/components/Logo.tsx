export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-extrabold text-deep ${className}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill="#2563EB" />
        <path d="M16 24s-7-4.4-7-9.2A4 4 0 0 1 16 12.4a4 4 0 0 1 7 2.4C23 19.6 16 24 16 24z" fill="#fff" />
      </svg>
      <span className="text-xl tracking-tight">Nafsity <span className="text-sky">نفسيتي</span></span>
    </span>
  );
}
