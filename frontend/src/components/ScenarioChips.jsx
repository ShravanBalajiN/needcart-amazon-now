import { Sparkles } from "lucide-react";

const SCENARIOS = [
  { id: "guests_arriving", label: "Guests Coming", prompt: "Guests are coming in 30 minutes. Need snacks and drinks for 6 people under 500 rupees." },
  { id: "breakfast_rush", label: "Breakfast Rush", prompt: "Need quick breakfast for 3 people in 15 minutes under 300 rupees." },
  { id: "child_fever", label: "Child Fever Essentials", prompt: "My child has fever at night. Need safe essentials quickly under 600 rupees." },
  { id: "power_cut", label: "Power Cut", prompt: "Power cut happened. Need emergency items in 20 minutes under 700 rupees." },
  { id: "pooja_items", label: "Pooja Items", prompt: "Pooja starting in 45 minutes. Need all essentials under 400 rupees." },
  { id: "late_night_hunger", label: "Late Night Hunger", prompt: "It's 11 PM. I'm hungry and everything is closed nearby. Budget 250 rupees." },
];

export default function ScenarioChips({ onSelect, disabled }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="text-sm text-slate-400 font-medium">Quick scenarios</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.prompt)}
            disabled={disabled}
            className="px-3 py-1.5 text-sm bg-slate-800/80 border border-slate-700 rounded-full text-slate-300 hover:border-amber-500/50 hover:text-amber-400 transition-colors disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
