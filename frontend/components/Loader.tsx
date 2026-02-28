export function Loader({ label = 'Analyzing ticket…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted">
      {/* Animated ring */}
      <span className="relative flex h-12 w-12">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-25" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/40">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </span>
      </span>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
