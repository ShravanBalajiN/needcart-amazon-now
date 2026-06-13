import { Scale, Zap, Wallet, PackageCheck } from "lucide-react";

const MODES = [
  { id: "balanced", label: "Balanced", desc: "Best mix of speed, price & coverage", icon: Scale },
  { id: "fastest", label: "Fastest", desc: "Prioritize delivery speed", icon: Zap },
  { id: "budget", label: "Budget Saver", desc: "Maximize savings within budget", icon: Wallet },
  { id: "complete", label: "Complete Cart", desc: "Full coverage, all categories", icon: PackageCheck },
];

export default function CartModeSelector({ selected, onChange, disabled }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Cart mode</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              disabled={disabled}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                active
                  ? "bg-orange-50 border-orange-400 shadow-sm ring-1 ring-orange-200"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
              } disabled:opacity-50`}
              aria-pressed={active}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? "text-orange-600" : "text-gray-400"}`} />
              <div>
                <div className={`text-sm font-semibold ${active ? "text-orange-700" : "text-gray-700"}`}>{m.label}</div>
                <div className="text-[10px] text-gray-400 leading-tight">{m.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
