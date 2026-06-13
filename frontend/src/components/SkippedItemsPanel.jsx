import { XCircle } from "lucide-react";

export default function SkippedItemsPanel({ skippedItems }) {
  if (!skippedItems || skippedItems.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-red-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <XCircle className="w-4 h-4 text-red-500" />
        <h3 className="text-sm font-semibold text-gray-900">Unavailable Items</h3>
        <span className="text-xs text-gray-500">({skippedItems.length})</span>
      </div>
      <div className="space-y-2">
        {skippedItems.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-sm text-gray-700">{item.name}</span>
              <p className="text-xs text-gray-400">{item.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
