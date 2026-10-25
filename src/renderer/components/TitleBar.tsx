export function TitleBar() {
  return (
    <div className="app-drag-region h-9 flex items-center justify-between bg-surface-1 border-b border-surface-border select-none">
      <div className="flex items-center gap-2 px-3">
        <span className="w-2 h-2 rounded-full bg-accent" />
        <span className="text-xs font-semibold tracking-wide text-zinc-300">
          CS COMPANION
        </span>
      </div>
      <div className="app-no-drag flex h-full">
        <button
          aria-label="Minimize"
          onClick={() => window.csCompanion.windowControls.minimize()}
          className="w-11 h-full flex items-center justify-center hover:bg-surface-2 text-zinc-400 hover:text-zinc-100"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="none">
            <rect width="10" height="1" fill="currentColor" />
          </svg>
        </button>
        <button
          aria-label="Maximize"
          onClick={() => window.csCompanion.windowControls.maximizeToggle()}
          className="w-11 h-full flex items-center justify-center hover:bg-surface-2 text-zinc-400 hover:text-zinc-100"
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <rect x="0.5" y="0.5" width="8" height="8" stroke="currentColor" />
          </svg>
        </button>
        <button
          aria-label="Close"
          onClick={() => window.csCompanion.windowControls.close()}
          className="w-11 h-full flex items-center justify-center hover:bg-state-danger text-zinc-400 hover:text-white"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M0 0L10 10M10 0L0 10" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
