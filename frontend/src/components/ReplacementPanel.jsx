import { ArrowRightLeft } from "lucide-react";

export default function ReplacementPanel({ replacements }) {
  if (!replacements || replacements.length === 0) return null;

  return (
    <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <ArrowRightLeft className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-medium text-blue-400">
          Replacements ({replacements.length})
        </h3>
      </div>
      <div className="space-y-3">
        {replacements.map((r, i) => (
          <div key={i} className="bg-slate-800/40 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-red-400 line-through">{r.original_name}</span>
              <ArrowRightLeft className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="text-emerald-400">{r.replacement_name}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{r.reason}</p>
            {r.price_diff !== 0 && (
              <span className={`text-xs mt-1 inline-block ${r.price_diff > 0 ? "text-red-400" : "text-emerald-400"}`}>
                {r.price_diff > 0 ? `+₹${r.price_diff}` : `-₹${Math.abs(r.price_diff)}`}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
