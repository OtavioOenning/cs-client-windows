import { EmptyState } from "../components/ui";

export function ComingSoon({ title, source }: { title: string; source: string }) {
  return (
    <div className="p-6 h-full flex items-center justify-center">
      <EmptyState
        title={`${title} isn't connected yet`}
        description={`This screen needs a live ${source} integration. Rather than show placeholder or invented data, it stays empty until a real, documented data source is wired up — see FEATURE_INVENTORY.md for what that integration would need.`}
      />
    </div>
  );
}
