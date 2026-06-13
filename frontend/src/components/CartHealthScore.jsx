import { Heart, Clock, CheckCircle2, RefreshCw } from "lucide-react";

const SCORE_CONFIG = [
  { key: "budget_fit", label: "Budget Fit", icon: Heart, color: "emerald" },
  { key: "eta_confidence", label: "ETA Confidence", icon: Clock, color: "blue" },
  { key: "completeness", label: "Completeness", icon: CheckCircle2, color: "amber" },
  { key: "substitution_readiness", label: "Sub. Readiness", icon: RefreshCw, color: "purple" },
];

function getScoreColor(value) {
  if (value >= 85) return "text-emerald-400";
  if (value >= 70) return "text-amber-400";
  return "text-red-400";
}

function getBarColor(value) {
  if (value >= 85) return "bg-emerald-500";
  if (value >= 70) return "bg-amber-500";
  return "bg-red-500";
}

export default function CartHealthScore({ scores }) {
  if (!scores) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {SCORE_CONFIG.map(({ key, label, icon: Icon }) => {
        const value = scores[key] ?? 0;
        return (
          <div
            key={key}
            className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-center"
          >
            <Icon className={`w-5 h-5 mx-auto mb-1 ${getScoreColor(value)}`} />
            <div className={`text-2xl font-bold ${getScoreColor(value)}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
            <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getBarColor(value)}`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
