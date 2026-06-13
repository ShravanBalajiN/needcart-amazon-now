import { FlaskConical, RotateCcw } from "lucide-react";

const BUDGET_OPTIONS = [null, 300, 500, 700];
const URGENCY_OPTIONS = [null, 10, 20, 30];
const STOCKOUT_PRODUCTS = ["P001", "P004"];
const STOCKOUT_GROUPS = ["beverages", "snacks"];

export default function StressTestPanel({ stress, onChange, onRebuild, disabled }) {
  const toggleProductId = (id) => {
    const ids = stress.simulate_stockout_product_ids || [];
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    onChange({ ...stress, simulate_stockout_product_ids: next });
  };

  const toggleGroup = (group) => {
    const groups = stress.simulate_stockout_groups || [];
    const next = groups.includes(group) ? groups.filter((x) => x !== group) : [...groups, group];
    onChange({ ...stress, simulate_stockout_groups: next });
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-medium text-purple-400">Stress Test Panel</span>
      </div>

      {/* Budget override */}
      <div>
        <span className="text-xs text-slate-500 block mb-1">Override Budget</span>
        <div className="flex gap-2">
          {BUDGET_OPTIONS.map((b) => (
            <button
              key={b ?? "none"}
              onClick={() => onChange({ ...stress, override_budget: b })}
              disabled={disabled}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                stress.override_budget === b
                  ? "bg-purple-500/20 border-purple-500 text-purple-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
            >
              {b === null ? "None" : `₹${b}`}
            </button>
          ))}
        </div>
      </div>

      {/* Urgency override */}
      <div>
        <span className="text-xs text-slate-500 block mb-1">Override Urgency</span>
        <div className="flex gap-2">
          {URGENCY_OPTIONS.map((u) => (
            <button
              key={u ?? "none"}
              onClick={() => onChange({ ...stress, override_urgency_minutes: u })}
              disabled={disabled}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                stress.override_urgency_minutes === u
                  ? "bg-purple-500/20 border-purple-500 text-purple-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
            >
              {u === null ? "None" : `${u} min`}
            </button>
          ))}
        </div>
      </div>

      {/* Stockout product IDs */}
      <div>
        <span className="text-xs text-slate-500 block mb-1">Stockout Products</span>
        <div className="flex gap-2">
          {STOCKOUT_PRODUCTS.map((id) => (
            <button
              key={id}
              onClick={() => toggleProductId(id)}
              disabled={disabled}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                (stress.simulate_stockout_product_ids || []).includes(id)
                  ? "bg-red-500/20 border-red-500 text-red-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Stockout groups */}
      <div>
        <span className="text-xs text-slate-500 block mb-1">Stockout Groups</span>
        <div className="flex gap-2">
          {STOCKOUT_GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => toggleGroup(g)}
              disabled={disabled}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                (stress.simulate_stockout_groups || []).includes(g)
                  ? "bg-red-500/20 border-red-500 text-red-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Rebuild button */}
      <button
        onClick={onRebuild}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Rebuild Cart
      </button>
    </div>
  );
}
