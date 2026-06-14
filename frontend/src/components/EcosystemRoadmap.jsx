import { Mic, Heart, CreditCard, Wifi } from "lucide-react";

const PHASES = [
  { label: "Phase 1", title: "Urgency-to-Cart MVP", status: "active" },
  { label: "Phase 2", title: "Family Preferences", status: "active" },
  { label: "Phase 3", title: "Predictive Shopping Intelligence", status: "planned" },
  { label: "Phase 4", title: "Alexa, Prime & Amazon Pay", status: "planned" },
];

const INTEGRATIONS = [
  { icon: Mic, title: "Alexa Trigger", desc: "\"Alexa, guests are arriving.\"" },
  { icon: Heart, title: "Prime Personalization", desc: "Household preferences and purchase history." },
  { icon: CreditCard, title: "Amazon Pay", desc: "One-tap checkout." },
  { icon: Wifi, title: "Smart Home Signals", desc: "Power cut, pantry signals and event reminders." },
];

export default function EcosystemRoadmap() {
  return (
    <div className="bg-[#131921] rounded-2xl p-6 text-white">
      <h3 className="text-sm font-bold text-[#febd69] mb-0.5">Amazon-Scale Roadmap</h3>
      <p className="text-xs text-gray-400 mb-1">Vision roadmap from urgent-cart MVP to Amazon ecosystem integration.</p>
      <p className="text-[10px] text-gray-500 mb-5">Future integrations shown for product vision.</p>

      {/* Timeline */}
      <div className="flex items-center gap-0 mb-6 overflow-x-auto pb-2">
        {PHASES.map((phase, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center min-w-[120px]">
              <div className={`w-3 h-3 rounded-full ${phase.status === "active" ? "bg-[#ff9900]" : "bg-gray-600"}`} />
              <p className="text-[10px] text-gray-500 mt-1">{phase.label}</p>
              <p className={`text-[11px] font-medium text-center ${phase.status === "active" ? "text-white" : "text-gray-500"}`}>
                {phase.title}
              </p>
            </div>
            {i < PHASES.length - 1 && (
              <div className={`h-0.5 w-8 ${i < 2 ? "bg-[#ff9900]" : "bg-gray-700"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Integration cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {INTEGRATIONS.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-[#232f3e] rounded-lg p-3">
              <Icon className="w-4 h-4 text-[#febd69] mb-2" />
              <p className="text-xs font-medium text-white">{item.title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
