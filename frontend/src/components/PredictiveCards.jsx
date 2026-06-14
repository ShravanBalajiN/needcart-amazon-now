import { Sparkles, Trophy, Sun, Flame, Zap } from "lucide-react";

const PREDICTIONS = [
  {
    id: "cricket",
    icon: Trophy,
    label: "Game Night Cart",
    prompt: "India match tonight. Need game night snacks and drinks for four people under six hundred rupees.",
  },
  {
    id: "sunday",
    icon: Sun,
    label: "Sunday Breakfast",
    prompt: "Need weekly breakfast essentials for family of four under five hundred rupees.",
  },
  {
    id: "festival",
    icon: Flame,
    label: "Festival Prep",
    prompt: "Need pooja items before morning prayer in thirty minutes under four hundred rupees.",
  },
  {
    id: "emergency",
    icon: Zap,
    label: "Power Backup",
    prompt: "Power is gone at home. Need emergency backup items in twenty minutes and my budget is seven hundred.",
  },
];

export default function PredictiveCards({ onSelect, disabled }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
        <h3 className="text-xs font-bold text-gray-800">Predictive NeedCart</h3>
      </div>
      <p className="text-[10px] text-gray-400 mb-3">Proactive carts for routines, events and emergencies.</p>
      <div className="space-y-2">
        {PREDICTIONS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.prompt)}
              disabled={disabled}
              className="w-full group flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50/40 transition-all text-left disabled:opacity-50"
            >
              <Icon className="w-4 h-4 text-purple-400 group-hover:text-orange-500 shrink-0" />
              <span className="text-xs font-medium text-gray-700 group-hover:text-orange-700">{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
