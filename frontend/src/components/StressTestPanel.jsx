import { useState } from "react";
import { FlaskConical, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

const BUDGET_OPTIONS = [null, 300, 500, 700];
const URGENCY_OPTIONS = [null, 10, 20, 30];
const STOCKOUT_PRODUCTS = ["P001", "P004"];
const STOCKOUT_GROUPS = ["beverages", "snacks"];

export default function StressTestPanel({ stress, onChange, onRebuild, disabled }) {
  const [open, setOpen] = useState(false);

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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-700">Demo Stress Controls</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-100 pt-3">
          {/* Budget override */}
          <div>
            <span className="text-[11px] font-medium text-gray-500 block mb-1">Override Budget</span>
            <div className="flex gap-1.5 flex-wrap">
              {BUDGET_OPTIONS.map((b) => (
                <button
                  key={b ?? "none"}
                  onClick={() => onChange({ ...stress, override_budget: b })}
                  disabled={disabled}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    stress.override_budget === b
                      ? "bg-purple-50 border-purple-400 text-purple-700 font-medium"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {b === null ? "None" : `₹${b}`}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency override */}
          <div>
            <span className="text-[11px] font-medium text-gray-500 block mb-1">Override Urgency</span>
            <div className="flex gap-1.5 flex-wrap">
              {URGENCY_OPTIONS.map((u) => (
                <button
                  key={u ?? "none"}
                  onClick={() => onChange({ ...stress, override_urgency_minutes: u })}
                  disabled={disabled}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    stress.override_urgency_minutes === u
                      ? "bg-purple-50 border-purple-400 text-purple-700 font-medium"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {u === null ? "None" : `${u} min`}
                </button>
              ))}
            </div>
          </div>

          {/* Stockout products */}
          <div>
            <span className="text-[11px] font-medium text-gray-500 block mb-1">Stockout Products</span>
            <div className="flex gap-1.5 flex-wrap">
              {STOCKOUT_PRODUCTS.map((id) => (
                <button
                  key={id}
                  onClick={() => toggleProductId(id)}
                  disabled={disabled}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    (stress.simulate_stockout_product_ids || []).includes(id)
                      ? "bg-red-50 border-red-400 text-red-700 font-medium"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          {/* Stockout groups */}
          <div>
            <span className="text-[11px] font-medium text-gray-500 block mb-1">Stockout Groups</span>
            <div className="flex gap-1.5 flex-wrap">
              {STOCKOUT_GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => toggleGroup(g)}
                  disabled={disabled}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    (stress.simulate_stockout_groups || []).includes(g)
                      ? "bg-red-50 border-red-400 text-red-700 font-medium"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onRebuild}
            disabled={disabled}
            className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Rebuild Cart
          </button>
        </div>
      )}
    </div>
  );
}
