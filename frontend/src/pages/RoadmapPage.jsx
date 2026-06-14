import { Mic, Heart, CreditCard, Wifi, ArrowRight, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PHASES = [
  {
    label: "Phase 1", title: "Urgency-to-Cart MVP", status: "active",
    desc: "Intent detection, budget fitting, stockout handling, rescue mode, forgotten essentials, explicit user preferences.",
  },
  {
    label: "Phase 2", title: "Family Preferences & Personalization", status: "active",
    desc: "Household profiles, dietary preferences, brand preferences, budget optimization per family, personalized picks.",
  },
  {
    label: "Phase 3", title: "Predictive Shopping Intelligence", status: "future",
    desc: "Future capability: time-of-day signals, repeat purchase patterns, festivals and event-based cart suggestions.",
    expanded: "NeedCart can evolve from reactive cart generation to proactive shopping intelligence by suggesting carts before the customer starts searching.",
    examples: [
      "Sunday morning → Weekly breakfast essentials",
      "Cricket match night → Game night snacks and drinks",
      "Festival day → Pooja preparation cart",
      "Monthly routine → Refill reminders for household staples",
    ],
  },
  {
    label: "Phase 4", title: "Alexa, Prime & Amazon Pay", status: "future",
    desc: "Future capability: voice-first ordering, Prime-based personalization, purchase history signals and one-tap checkout.",
    expanded: "NeedCart can become an Amazon ecosystem layer where urgent shopping starts from Alexa, adapts using Prime and purchase history, and moves directly toward Amazon Pay checkout.",
    examples: [
      "\"Alexa, guests are arriving\" → Guest Snack Cart",
      "Prime preferences → Household-aware product choices",
      "Purchase history → Faster repeat-cart generation",
      "Amazon Pay → One-tap checkout flow",
      "Smart home signals → Power backup or pantry refill suggestions",
    ],
  },
];

const INTEGRATIONS = [
  { icon: Mic, title: "Alexa Trigger", desc: "\"Alexa, guests are arriving.\" Hands-free cart generation from voice commands." },
  { icon: Heart, title: "Prime Personalization", desc: "Leverage household purchase history and Prime preferences for better picks." },
  { icon: CreditCard, title: "Amazon Pay", desc: "One-tap checkout with saved payment methods and delivery addresses." },
  { icon: Wifi, title: "Smart Home Signals", desc: "Power cut detected by smart home. Pantry sensors. Calendar-triggered carts." },
];

const ARCHITECTURE_STEPS = [
  "User Need / Voice Input",
  "LLM Intent Parser + Rule Fallback",
  "Constraint Extractor",
  "Explicit Preference Filter",
  "Family Preference Layer",
  "Catalog + Stock + ETA",
  "Deterministic Cart Optimizer",
  "Substitution + Rescue Mode",
  "Explainable Checkout-Ready Cart",
];

export default function RoadmapPage() {
  const navigate = useNavigate();

  return (
    <div className="py-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Vision & Roadmap</h1>
        <p className="text-sm text-gray-500">
          From urgency-to-cart MVP to full Amazon ecosystem integration.
        </p>
      </div>

      {/* Timeline */}
      <section className="max-w-4xl mx-auto">
        <div className="space-y-0">
          {PHASES.map((phase, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full shrink-0 ${
                  phase.status === "active" ? "bg-[#ff9900]" :
                  "bg-gray-300 border-2 border-dashed border-gray-400"
                }`} />
                {i < PHASES.length - 1 && (
                  <div className={`w-0.5 ${phase.status === "active" ? "bg-[#ff9900]" : "bg-gray-200 border-l border-dashed border-gray-300"}`}
                    style={{ minHeight: phase.examples ? "180px" : "60px" }} />
                )}
              </div>
              <div className={`pb-6 ${phase.status === "future" ? "opacity-80" : ""}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{phase.label}</p>
                  {phase.status === "active" && (
                    <span className="px-2 py-0.5 text-[9px] font-semibold bg-green-100 text-green-700 rounded-full">Live in MVP</span>
                  )}
                  {phase.status === "future" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold bg-[#232f3e] text-[#febd69] rounded-full">
                      <Eye className="w-2.5 h-2.5" />
                      Future Vision
                    </span>
                  )}
                </div>
                <h3 className={`text-sm font-bold ${phase.status === "active" ? "text-gray-900" : "text-gray-700"}`}>{phase.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{phase.desc}</p>
                {phase.expanded && (
                  <p className="text-[11px] text-gray-400 mt-2 italic leading-relaxed">{phase.expanded}</p>
                )}
                {phase.examples && (
                  <div className="mt-2 space-y-1">
                    {phase.examples.map((ex, j) => (
                      <p key={j} className="text-[10px] text-gray-400 pl-3 border-l-2 border-gray-200">{ex}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Roadmap Note */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-600">Note:</span> Roadmap items show Amazon-scale product extensions beyond the current MVP.
            The implemented MVP focuses on urgency-to-cart generation, deterministic optimization, personalization-lite, substitutions and checkout readiness.
          </p>
        </div>
      </section>

      {/* Integration Cards */}
      <section className="bg-[#131921] rounded-2xl p-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-sm font-bold text-[#febd69]">Amazon Ecosystem Integrations</h2>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-semibold bg-[#febd69]/10 text-[#febd69] rounded-full border border-[#febd69]/20">
            <Eye className="w-2.5 h-2.5" />
            Future Vision
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-6">These integrations represent product vision for Amazon-scale deployment, not current MVP functionality.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INTEGRATIONS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-[#232f3e] rounded-xl p-4 border border-[#2d3a4a]">
                <Icon className="w-5 h-5 text-[#febd69] mb-3" />
                <p className="text-xs font-semibold text-white mb-1">{item.title}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-center text-lg font-bold text-gray-900 mb-2">System Architecture</h2>
        <p className="text-center text-xs text-gray-500 mb-6">AI understands the situation. Deterministic commerce logic builds the cart.</p>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {ARCHITECTURE_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="px-3 py-1.5 text-[11px] font-medium bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {step}
                </span>
                {i < ARCHITECTURE_STEPS.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-[#ff9900] shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <button
          onClick={() => navigate("/build")}
          className="px-6 py-3 bg-[#ff9900] hover:bg-[#e88a00] text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-200 transition-all"
        >
          Try NeedCart Now
        </button>
      </section>
    </div>
  );
}
