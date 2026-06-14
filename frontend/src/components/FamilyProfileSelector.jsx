import { Home, Info } from "lucide-react";

const PROFILES = [
  { id: "default", label: "Default Household", summary: "Standard urgent cart logic." },
  { id: "pepsi_family", label: "Pepsi Family", summary: "Prefers Pepsi, Lays and Good Day where available." },
  { id: "veg_family", label: "Vegetarian Family", summary: "Prioritizes veg-friendly items and avoids egg/chicken." },
  { id: "non_veg_family", label: "Non-Veg Family", summary: "Prefers egg, chicken and high-protein options where relevant." },
  { id: "budget_saver_family", label: "Budget Saver", summary: "Prioritizes lower-cost picks while preserving need coverage." },
  { id: "health_conscious_family", label: "Health Conscious", summary: "Prefers water, oats, juice and lighter choices where available." },
];

export default function FamilyProfileSelector({ selected, onChange, disabled }) {
  const activeProfile = PROFILES.find(p => p.id === selected) || PROFILES[0];

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Home className="w-3.5 h-3.5 text-gray-500" />
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Family Profile</p>
      </div>
      <div className="flex items-center gap-1 mb-2">
        <Info className="w-3 h-3 text-gray-400" />
        <p className="text-[10px] text-gray-400">Profiles personalize brand and category choices. They never override budget, delivery time or safety rules.</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PROFILES.map((p) => (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            disabled={disabled}
            className={`px-2.5 py-1.5 text-[11px] rounded-lg border transition-all ${
              selected === p.id
                ? "bg-orange-50 border-orange-400 text-orange-700 font-semibold"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            } disabled:opacity-50`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {selected !== "default" && (
        <p className="mt-2 text-[10px] text-orange-600 font-medium">{activeProfile.summary}</p>
      )}
    </div>
  );
}
