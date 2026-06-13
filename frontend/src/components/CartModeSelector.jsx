import { Zap, Wallet, Gauge, PackageCheck } from "lucide-react";

const MODES = [
  { id: "balanced", label: "Balanced", icon: Gauge, desc: "Best mix of speed, price, coverage" },
  { id: "budget", label: "Budget", icon: Wallet, desc: "Maximize savings" },
  { id: "fastest", label: "Fastest", icon: Zap, desc: "Prioritize delivery speed" },
  { id: "complete", label: "Complete", icon: PackageCheck, desc: "Full coverage, all items" },
];

export default function CartModeSelector({ selected, onChange, disabled }) {
  return (
    <div>
      <span className="text-sm text-slate-400 font-medium mb-2 block">Cart Mode</span>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              disabled={disabled}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                active
                  ? "bg-amber-500/10 border-amber-500 text-amber-400"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
              aria-pressed={active}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
