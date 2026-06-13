import { XCircle } from "lucide-react";

export default function SkippedItemsPanel({ skippedItems }) {
  if (!skippedItems || skippedItems.length === 0) return null;

  return (
    <div className="bg-red-950/20 border border-red-800/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <XCircle className="w-4 h-4 text-red-400" />
        <h3 className="text-sm font-medium text-red-400">
          Skipped Items ({skippedItems.length})
        </h3>
      </div>
      <div className="space-y-2">
        {skippedItems.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <XCircle className="w-3.5 h-3.5 text-red-500/60 mt-0.5 shrink-0" />
            <div>
              <span className="text-slate-300">{item.name}</span>
              <p className="text-xs text-slate-500 mt-0.5">{item.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
