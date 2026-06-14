import { Lightbulb } from "lucide-react";

const INTENT_EXPLANATIONS = {
  guests_arriving: (r) => {
    const points = ["Built for guests arriving soon.", "Balanced snacks, drinks and serving essentials."];
    if (r.constraints?.budget) points.push(`Kept the cart within the ₹${r.constraints.budget} budget.`);
    if (r.items?.some(i => i.is_forgotten_essential)) points.push("Added forgotten essentials like cups or napkins.");
    if (r.replacements?.length > 0) points.push("Substituted unavailable items with best alternatives.");
    return points;
  },
  breakfast_rush: (r) => {
    const points = ["Built for a quick breakfast situation.", "Prioritized fast-delivery breakfast essentials."];
    if (r.constraints?.budget) points.push(`Balanced quantity, price and ETA within ₹${r.constraints.budget}.`);
    if (r.constraints?.urgency_minutes) points.push(`Optimized for ${r.constraints.urgency_minutes}-minute delivery.`);
    return points;
  },
  child_fever_essentials: (r) => {
    const points = [
      "Built for fever-care support essentials.",
      "Avoided medicines and prescription-sensitive items.",
      "Prioritized safe support items like ORS, thermometer and hydration essentials.",
    ];
    if (r.constraints?.budget) points.push(`Kept the cart within the ₹${r.constraints.budget} budget.`);
    return points;
  },
  power_cut: (r) => {
    const points = [
      "Built for a power outage situation.",
      "Prioritized emergency backup items like candles, matchbox, torch and batteries.",
    ];
    if (r.constraints?.budget) points.push(`Kept the cart within the ₹${r.constraints.budget} budget and urgency window.`);
    if (r.items?.some(i => i.is_forgotten_essential)) points.push("Added forgotten essentials needed during a power cut.");
    return points;
  },
  pooja_items: (r) => {
    const points = [
      "Built for prayer / pooja preparation.",
      "Prioritized pooja essentials like diya, incense, camphor and matchbox.",
    ];
    if (r.constraints?.urgency_minutes) points.push(`Kept within the ${r.constraints.urgency_minutes}-minute urgency window.`);
    return points;
  },
  late_night_hunger: () => {
    const points = ["Built for late-night hunger.", "Prioritized quick snacks and drinks."];
    points.push("Kept the cart small, fast and budget-friendly.");
    return points;
  },
  general_urgent_need: (r) => {
    const points = ["Built for an urgent household need."];
    if (r.constraints?.budget) points.push(`Kept within ₹${r.constraints.budget} budget.`);
    points.push("Selected practical everyday items available for quick delivery.");
    return points;
  },
};

export default function WhyThisCart({ result }) {
  if (!result) return null;

  const generator = INTENT_EXPLANATIONS[result.detected_intent] || INTENT_EXPLANATIONS.general_urgent_need;
  const points = generator(result);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-gray-900">Why this cart?</h3>
      </div>
      <ul className="space-y-1.5">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-amber-500 mt-0.5 shrink-0">•</span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
