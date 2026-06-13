import { Users, Coffee, Thermometer, Zap, Flame, Moon } from "lucide-react";

const SCENARIOS = [
  { id: "guests_arriving", label: "Guests Arriving", desc: "Snacks, drinks, disposables", icon: Users, prompt: "Guests are coming in 30 minutes. Need snacks and drinks for 6 people under 500 rupees." },
  { id: "breakfast_rush", label: "Breakfast Rush", desc: "Quick breakfast before school", icon: Coffee, prompt: "Need quick breakfast for 3 people in 15 minutes under 300 rupees." },
  { id: "child_fever", label: "Child Fever", desc: "Safe support essentials", icon: Thermometer, prompt: "My child has fever at night. Need safe essentials quickly under 600 rupees." },
  { id: "power_cut", label: "Power Cut", desc: "Emergency backup items", icon: Zap, prompt: "Power cut happened. Need emergency items in 20 minutes under 700 rupees." },
  { id: "pooja_items", label: "Pooja Items", desc: "All prayer essentials", icon: Flame, prompt: "Pooja starting in 45 minutes. Need all essentials under 400 rupees." },
  { id: "late_night", label: "Late Night Hunger", desc: "Quick midnight snacks", icon: Moon, prompt: "It's 11 PM. I'm hungry and everything is closed nearby. Budget 250 rupees." },
];

export default function ScenarioChips({ onSelect, disabled, selected }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Quick scenarios</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {SCENARIOS.map((s) => {
          const Icon = s.icon;
          const isActive = selected === s.prompt;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.prompt)}
              disabled={disabled}
              className={`group flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                isActive
                  ? "bg-orange-50 border-orange-300 shadow-sm"
                  : "bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 hover:shadow-sm"
              } disabled:opacity-50`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-orange-600" : "text-gray-400 group-hover:text-orange-500"}`} />
              <span className={`text-xs font-semibold leading-tight ${isActive ? "text-orange-700" : "text-gray-700"}`}>{s.label}</span>
              <span className="text-[10px] text-gray-400 leading-tight hidden md:block">{s.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
