import { ArrowRight, RefreshCw } from "lucide-react";

export default function ReplacementPanel({ replacements }) {
  if (!replacements || replacements.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-blue-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <RefreshCw className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900">Smart Substitutions</h3>
        <span className="text-xs text-gray-500">({replacements.length})</span>
      </div>
      <div className="space-y-2.5">
        {replacements.map((r, i) => (
          <div key={i} className="flex items-center gap-2 bg-blue-50/50 rounded-lg p-2.5">
            <span className="text-sm text-gray-500 line-through shrink-0 max-w-[40%] truncate">{r.original_name}</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="text-sm font-medium text-blue-700 truncate">{r.replacement_name}</span>
            {r.price_diff !== 0 && (
              <span className={`ml-auto text-xs font-medium shrink-0 ${r.price_diff > 0 ? "text-red-600" : "text-green-600"}`}>
                {r.price_diff > 0 ? `+₹${r.price_diff}` : `-₹${Math.abs(r.price_diff)}`}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
