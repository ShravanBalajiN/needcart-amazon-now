import { Wallet, Clock, CheckCircle2, RefreshCw } from "lucide-react";

const SCORE_CONFIG = [
  { key: "budget_fit", label: "Budget Match", helper: "How well this cart fits your budget.", icon: Wallet },
  { key: "eta_confidence", label: "Delivery Confidence", helper: "How safely items fit your urgency window.", icon: Clock },
  { key: "completeness", label: "Need Coverage", helper: "How completely this cart covers the situation.", icon: CheckCircle2 },
  { key: "substitution_readiness", label: "Backup Options", helper: "How many substitute options exist if items go out of stock.", icon: RefreshCw },
];

function getStatus(value) {
  if (value >= 80) return { label: "Excellent", color: "text-green-600", bar: "bg-green-500", badge: "bg-green-100 text-green-700" };
  if (value >= 60) return { label: "Good", color: "text-green-600", bar: "bg-green-400", badge: "bg-green-50 text-green-600" };
  if (value >= 40) return { label: "Moderate", color: "text-amber-600", bar: "bg-amber-400", badge: "bg-amber-50 text-amber-600" };
  return { label: "Limited", color: "text-red-600", bar: "bg-red-400", badge: "bg-red-50 text-red-600" };
}

export default function CartHealthScore({ scores }) {
  if (!scores) return null;

  return (
    <div className="space-y-3">
      {SCORE_CONFIG.map(({ key, label, helper, icon: Icon }) => {
        const value = scores[key] ?? 0;
        const status = getStatus(value);
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${status.color}`} />
                <span className="text-xs font-medium text-gray-700">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${status.badge}`}>
                  {status.label}
                </span>
                <span className={`text-xs font-bold ${status.color}`}>{value}</span>
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${status.bar}`}
                style={{ width: `${value}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 leading-tight">{helper}</p>
          </div>
        );
      })}
    </div>
  );
}
