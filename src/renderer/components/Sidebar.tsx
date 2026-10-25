export type Route =
  | "home"
  | "fps-plus"
  | "pro-config"
  | "news"
  | "matches"
  | "ranking"
  | "teams"
  | "settings";

const FEATURES: { id: Route; label: string }[] = [
  { id: "fps-plus", label: "FPS+" },
  { id: "pro-config", label: "PRO Config" },
];

const RESOURCES: { id: Route; label: string }[] = [
  { id: "news", label: "News" },
  { id: "matches", label: "Matches" },
  { id: "ranking", label: "Ranking" },
  { id: "teams", label: "Teams" },
];

function NavItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-accent/10 text-accent border border-accent/30"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-surface-2 border border-transparent"
      }`}
    >
      {label}
    </button>
  );
}

export function Sidebar({
  route,
  onNavigate,
}: {
  route: Route;
  onNavigate: (r: Route) => void;
}) {
  return (
    <nav className="w-56 shrink-0 bg-surface-1 border-r border-surface-border flex flex-col p-3 gap-6 overflow-y-auto">
      <NavItem label="Home" active={route === "home"} onClick={() => onNavigate("home")} />

      <div>
        <p className="px-3 text-[11px] uppercase tracking-wider text-zinc-500 mb-2">
          Features
        </p>
        <div className="flex flex-col gap-1">
          {FEATURES.map((item) => (
            <NavItem
              key={item.id}
              label={item.label}
              active={route === item.id}
              onClick={() => onNavigate(item.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="px-3 text-[11px] uppercase tracking-wider text-zinc-500 mb-2">
          Resources
        </p>
        <div className="flex flex-col gap-1">
          {RESOURCES.map((item) => (
            <NavItem
              key={item.id}
              label={item.label}
              active={route === item.id}
              onClick={() => onNavigate(item.id)}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <NavItem label="Settings" active={route === "settings"} onClick={() => onNavigate("settings")} />
      </div>
    </nav>
  );
}
